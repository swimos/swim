// Copyright 2015-2023 Swim.inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.ws;

import java.nio.ByteBuffer;
import java.util.zip.Deflater;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.BinaryOutputBuffer;
import swim.codec.Encode;
import swim.codec.EncodeException;
import swim.codec.OutputBuffer;
import swim.util.Assume;
import swim.util.Notation;

@Public
@Since("5.0")
public class WsDeflateEncoder extends WsEncoder {

  protected final WsOptions options;
  protected final BinaryOutputBuffer deflateBuffer;
  protected final Deflater deflater;
  protected final int flush;

  protected WsDeflateEncoder(boolean masked, WsOptions options) {
    super(masked);
    this.options = options;
    this.deflateBuffer = BinaryOutputBuffer.allocate(options.deflateBufferSize()).asLast(false);
    final int compressionLevel;
    final boolean noContextTakeover;
    if (masked) {
      compressionLevel = options.clientCompressionLevel();
      noContextTakeover = options.clientNoContextTakeover();
    } else {
      compressionLevel = options.serverCompressionLevel();
      noContextTakeover = options.serverNoContextTakeover();
    }
    this.deflater = new Deflater(compressionLevel, true);
    if (noContextTakeover) {
      this.flush = Deflater.FULL_FLUSH;
    } else {
      this.flush = Deflater.SYNC_FLUSH;
    }
  }

  public final WsOptions options() {
    return this.options;
  }

  public final Deflater deflater() {
    return this.deflater;
  }

  @Override
  public <T> Encode<WsFrame<T>> encodeContinuation(OutputBuffer<?> output, WsContinuation<T> frame) {
    return EncodeWsDeflateFrame.encode(output, this, frame.frame, frame.encodePayload, frame.offset);
  }

  @Override
  public <T> Encode<WsFrame<T>> encodeContinuation(WsContinuation<T> frame) {
    return new EncodeWsDeflateFrame<T>(this, frame.frame, frame.encodePayload, frame.offset);
  }

  @Override
  public <T> Encode<WsFrame<T>> encodeTextFrame(OutputBuffer<?> output, WsFrame<T> frame) {
    return EncodeWsDeflateFrame.encode(output, this, frame, null, 0L);
  }

  @Override
  public <T> Encode<WsFrame<T>> encodeTextFrame(WsFrame<T> frame) {
    return new EncodeWsDeflateFrame<T>(this, frame, null, 0L);
  }

  @Override
  public <T> Encode<WsFrame<T>> encodeBinaryFrame(OutputBuffer<?> output, WsFrame<T> frame) {
    return EncodeWsDeflateFrame.encode(output, this, frame, null, 0L);
  }

  @Override
  public <T> Encode<WsFrame<T>> encodeBinaryFrame(WsFrame<T> frame) {
    return new EncodeWsDeflateFrame<T>(this, frame, null, 0L);
  }

  @Override
  public void reset() {
    this.deflater.reset();
  }

  @Override
  public void close() {
    this.deflater.end();
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.masked) {
      notation.beginInvoke("Ws", "deflateClientEncoder")
              .appendArgument(this.options)
              .endInvoke();
    } else {
      notation.beginInvoke("Ws", "deflateServerEncoder")
              .appendArgument(this.options)
              .endInvoke();
    }
  }

}

final class EncodeWsDeflateFrame<T> extends Encode<WsFrame<T>> {

  final WsDeflateEncoder encoder;
  final WsFrame<T> frame;
  final @Nullable Encode<?> encode;
  final long offset;

  EncodeWsDeflateFrame(WsDeflateEncoder encoder, WsFrame<T> frame,
                       @Nullable Encode<?> encode, long offset) {
    this.encoder = encoder;
    this.frame = frame;
    this.encode = encode;
    this.offset = offset;
  }

  @Override
  public Encode<WsFrame<T>> produce(OutputBuffer<?> output) {
    return EncodeWsDeflateFrame.encode(output, this.encoder, this.frame, this.encode, this.offset);
  }

  static <T> Encode<WsFrame<T>> encode(OutputBuffer<?> output, WsDeflateEncoder encoder,
                                       WsFrame<T> frame, @Nullable Encode<?> encode, long offset) {
    // Only compress data frames.
    final WsOpcode frameType = frame.frameType();
    if (frameType.isControl()) {
      return Encode.error(new EncodeException("unexpected control frame"));
    }

    // Capture the usable bounds of the output buffer.
    final int outputStart = output.position();
    final int outputLimit = output.limit();
    final int outputRemaining = outputLimit - outputStart;

    // Compute the size of the header for the longest payload
    // fragment that could possibly be written to the buffer.
    final int maskSize = encoder.masked ? 4 : 0;
    final int maxHeaderSize;
    if (outputRemaining < 2 + maskSize + 126) {
      maxHeaderSize = 2 + maskSize; // tiny length
    } else if (outputRemaining < 4 + maskSize + (1 << 16)) {
      maxHeaderSize = 4 + maskSize; // short length
    } else {
      maxHeaderSize = 10 + maskSize; // long length
    }

    // To avoid generating small message fragments, check if the output buffer
    // has sufficient available capacity to attempt to encode a frame.
    if (outputRemaining >= maxHeaderSize + encoder.minPayloadCapacity()) {
      // Leave space at the start of the buffer for the frame header.
      final int payloadStart = outputStart + maxHeaderSize;
      output.position(payloadStart);
      // Encode a payload fragment into the deflate buffer.
      final BinaryOutputBuffer deflateBuffer = encoder.deflateBuffer;
      if (encode == null) {
        encode = frame.codec().encode(deflateBuffer, Assume.conformsNullable(frame.get()));
      } else {
        encode = encode.produce(deflateBuffer);
      }
      if (encode.isError()) {
        return encode.asError();
      }
      deflateBuffer.flip();

      // Deflate the payload fragment from the deflate buffer into the output buffer.
      final ByteBuffer outputBuffer = output.asByteBuffer();
      encoder.deflater.setInput(deflateBuffer.byteBuffer());
      encoder.deflater.deflate(outputBuffer, encoder.flush);
      output.limit(outputLimit).position(outputBuffer.position());
      deflateBuffer.compact();
      // We can't finalize a message until all data consumed by the deflater
      // has been written to the output buffer. Unfortunately, java.util.zip
      // doesn't provide an API to check for internally buffered data. So we
      // instead check for the presence of an empty deflate block at the end
      // of the deflated output, which we have to remove from the frame anyway.
      // It's unclear whether or not the byte sequence 0x0000FFFF can
      // incidentally occur at the end of a chunk generated with
      // SYNC_FLUSH; hopefully not.
      final boolean fin;
      if (!encode.isDone()) {
        fin = false;
      } else if (output.position() - payloadStart == 0) {
        // Send an empty deflate block.
        output.write(0x00);
        fin = true;
      } else if (output.position() - payloadStart >= 4
              && output.get(output.position() - 4) == 0x00
              && output.get(output.position() - 3) == 0x00
              && output.get(output.position() - 2) == 0xFF
              && output.get(output.position() - 1) == 0xFF) {
        fin = true;
        output.position(output.position() - 4);
      } else {
        fin = false;
      }

      // Capture the size of the deflated payload fragment.
      final int payloadSize = output.position() - payloadStart;
      // Compute the size of the header for the encoded payload fragment.
      final int headerSize;
      if (payloadSize < 126) {
        headerSize = 2 + maskSize; // tiny length
      } else if (payloadSize < 1 << 16) {
        headerSize = 4 + maskSize; // short length
      } else {
        headerSize = 10 + maskSize; // long length
      }

      // Compute the finRsvOp byte for the encoded payload fragment.
      final int finRsvOp;
      if (fin) {
        if (offset == 0L) {
          finRsvOp = 0xC0 | frameType.code;
        } else {
          finRsvOp = 0x80;
        }
      } else if (offset == 0L) {
        finRsvOp = 0x40 | frameType.code;
      } else {
        finRsvOp = 0x00;
      }

      // Rewind the output buffer to write the frame header.
      output.position(outputStart);
      if (payloadSize == 0 && !fin) {
        // Don't write empty fragments.
      } else {
        // Write the finRsvOp byte.
        output.write(finRsvOp);
        // Write the mask flag and payload length.
        if (payloadSize < 126) { // tiny length
          output.write(encoder.masked ? 0x80 | payloadSize : payloadSize);
        } else if (payloadSize < 1 << 16) { // short length
          output.write(encoder.masked ? 254 : 126)
                .write(payloadSize >>> 8)
                .write(payloadSize);
        } else { // long length
          output.write(encoder.masked ? 255 : 127)
                .write(0)
                .write(0)
                .write(0)
                .write(0)
                .write(payloadSize >>> 24)
                .write(payloadSize >>> 16)
                .write(payloadSize >>> 8)
                .write(payloadSize);
        }

        if (encoder.masked) {
          // Generate a new masking key.
          final int maskingKey = encoder.maskingKey();
          // Write the masking key.
          output.write(maskingKey >>> 24 & 0xFF)
                .write(maskingKey >>> 16 & 0xFF)
                .write(maskingKey >>> 8 & 0xFF)
                .write(maskingKey & 0xFF);
          // Mask the payload, shifting it if necessary
          // to line up with the end of the header.
          for (int i = 0; i < payloadSize; i += 1) {
            final int fromIndex = outputStart + maxHeaderSize + i;
            final int toIndex = outputStart + headerSize + i;
            final int maskShift = 24 - ((i & 0x3) << 3);
            final int maskByte = maskingKey >>> maskShift & 0xFF;
            output.set(toIndex, output.get(fromIndex) ^ maskByte);
          }
        } else if (headerSize < maxHeaderSize) {
          // Shift the payload to line up with the header boundary.
          output.shift(outputStart + maxHeaderSize, outputStart + headerSize, payloadSize);
        }

        // Add the size of the payload fragment to the total payload size.
        offset += payloadSize;
        // Position the output buffer at the end of the encoded frame.
        output.position(outputStart + headerSize + payloadSize);
        if (fin) {
          // The full message has been encoded and deflated.
          return Encode.done(frame);
        } else {
          // A message fragment was encoded.
          return Encode.done(WsContinuation.of((WsDataFrame<T>) frame, encode, offset));
        }
      }
    }
    if (output.isDone()) {
      return Encode.error(new EncodeException("truncated encode"));
    } else if (output.isError()) {
      return Encode.error(output.getError());
    }
    return new EncodeWsDeflateFrame<T>(encoder, frame, encode, offset);
  }

}
