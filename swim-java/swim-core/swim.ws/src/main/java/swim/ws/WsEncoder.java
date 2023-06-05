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

import java.util.concurrent.ThreadLocalRandom;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Encode;
import swim.codec.EncodeException;
import swim.codec.OutputBuffer;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public class WsEncoder implements ToSource {

  protected final boolean masked;

  protected WsEncoder(boolean masked) {
    this.masked = masked;
  }

  public final boolean isMasked() {
    return this.masked;
  }

  public int maskingKey() {
    return ThreadLocalRandom.current().nextInt();
  }

  public int minPayloadCapacity() {
    return 128;
  }

  public <T> Encode<WsFrame<T>> encodeMessage(OutputBuffer<?> output, WsFrame<T> frame) {
    final WsOpcode frameType = frame.frameType();
    switch (frameType) {
      case CONTINUATION:
        return Encode.error(new EncodeException("unexpected fragment frame"));
      case TEXT:
        return this.encodeTextFrame(output, frame);
      case BINARY:
        return this.encodeBinaryFrame(output, frame);
      case CLOSE:
        return this.encodeCloseFrame(output, frame);
      case PING:
        return this.encodePingFrame(output, frame);
      case PONG:
        return this.encodePongFrame(output, frame);
      default:
        return Encode.error(new EncodeException("unsupported frame type: " + frameType.name()));
    }
  }

  public <T> Encode<WsFrame<T>> encodeMessage(WsFrame<T> frame) {
    final WsOpcode frameType = frame.frameType();
    switch (frameType) {
      case CONTINUATION:
        return Encode.error(new EncodeException("unexpected fragment frame"));
      case TEXT:
        return this.encodeTextFrame(frame);
      case BINARY:
        return this.encodeBinaryFrame(frame);
      case CLOSE:
        return this.encodeCloseFrame(frame);
      case PING:
        return this.encodePingFrame(frame);
      case PONG:
        return this.encodePongFrame(frame);
      default:
        return Encode.error(new EncodeException("unsupported frame type: " + frameType.name()));
    }
  }

  public <T> Encode<WsFrame<T>> encodeContinuation(OutputBuffer<?> output, WsContinuation<T> frame) {
    return EncodeWsFrame.encode(output, this, frame.frame, frame.encodePayload, frame.offset);
  }

  public <T> Encode<WsFrame<T>> encodeContinuation(WsContinuation<T> frame) {
    return new EncodeWsFrame<T>(this, frame.frame, frame.encodePayload, frame.offset);
  }

  public <T> Encode<WsFrame<T>> encodeTextFrame(OutputBuffer<?> output, WsFrame<T> frame) {
    return EncodeWsFrame.encode(output, this, frame, null, 0L);
  }

  public <T> Encode<WsFrame<T>> encodeTextFrame(WsFrame<T> frame) {
    return new EncodeWsFrame<T>(this, frame, null, 0L);
  }

  public <T> Encode<WsFrame<T>> encodeBinaryFrame(OutputBuffer<?> output, WsFrame<T> frame) {
    return EncodeWsFrame.encode(output, this, frame, null, 0L);
  }

  public <T> Encode<WsFrame<T>> encodeBinaryFrame(WsFrame<T> frame) {
    return new EncodeWsFrame<T>(this, frame, null, 0L);
  }

  public <T> Encode<WsFrame<T>> encodeCloseFrame(OutputBuffer<?> output, WsFrame<T> frame) {
    return EncodeWsFrame.encode(output, this, frame, null, 0L);
  }

  public <T> Encode<WsFrame<T>> encodeCloseFrame(WsFrame<T> frame) {
    return new EncodeWsFrame<T>(this, frame, null, 0L);
  }

  public <T> Encode<WsFrame<T>> encodePingFrame(OutputBuffer<?> output, WsFrame<T> frame) {
    return EncodeWsFrame.encode(output, this, frame, null, 0L);
  }

  public <T> Encode<WsFrame<T>> encodePingFrame(WsFrame<T> frame) {
    return new EncodeWsFrame<T>(this, frame, null, 0L);
  }

  public <T> Encode<WsFrame<T>> encodePongFrame(OutputBuffer<?> output, WsFrame<T> frame) {
    return EncodeWsFrame.encode(output, this, frame, null, 0L);
  }

  public <T> Encode<WsFrame<T>> encodePongFrame(WsFrame<T> frame) {
    return new EncodeWsFrame<T>(this, frame, null, 0L);
  }

  public void reset() {
    // nop
  }

  public void close() {
    // nop
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.masked) {
      notation.beginInvoke("Ws", "clientEncoder").endInvoke();
    } else {
      notation.beginInvoke("Ws", "serverEncoder").endInvoke();
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final WsEncoder CLIENT_ENCODER = new WsEncoder(true);

  static final WsEncoder SERVER_ENCODER = new WsEncoder(false);

}

final class EncodeWsFrame<T> extends Encode<WsFrame<T>> {

  final WsEncoder encoder;
  final WsFrame<T> frame;
  final @Nullable Encode<?> encode;
  final long offset;

  EncodeWsFrame(WsEncoder encoder, WsFrame<T> frame, @Nullable Encode<?> encode, long offset) {
    this.encoder = encoder;
    this.frame = frame;
    this.encode = encode;
    this.offset = offset;
  }

  @Override
  public Encode<WsFrame<T>> produce(OutputBuffer<?> output) {
    return EncodeWsFrame.encode(output, this.encoder, this.frame, this.encode, this.offset);
  }

  static <T> Encode<WsFrame<T>> encode(OutputBuffer<?> output, WsEncoder encoder,
                                       WsFrame<T> frame, @Nullable Encode<?> encode, long offset) {
    final WsOpcode frameType = frame.frameType();

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

    // To avoid generating small message fragments and fragmented control frames,
    // check if the output buffer has sufficient available capacity to attempt
    // to encode a frame.
    if (outputRemaining >= maxHeaderSize + encoder.minPayloadCapacity()) {
      // Leave space at the start of the buffer for the frame header.
      final int payloadStart = outputStart + maxHeaderSize;
      output.position(payloadStart);
      // Encode a payload fragment into the output buffer.
      final Encode<?> encodePayload;
      if (encode == null) {
        encodePayload = frame.codec().encode(output, Assume.conformsNullable(frame.get()));
      } else {
        encodePayload = encode.produce(output);
      }
      if (encodePayload.isError()) {
        return encodePayload.asError();
      }

      // Capture the size of the encoded payload fragment.
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
      if (encodePayload.isDone()) {
        if (offset == 0L) {
          finRsvOp = 0x80 | frameType.code;
        } else {
          finRsvOp = 0x80;
        }
      } else if (offset == 0L) {
        finRsvOp = frameType.code;
      } else {
        finRsvOp = 0x00;
      }

      // Rewind the output buffer to write the frame header.
      output.position(outputStart);
      // Check for fragmented control frames.
      if (frameType.isControl() && (finRsvOp & 0x80) == 0) {
        // Control frame didn't fit in the buffer;
        // discard the frame and wait for more buffer capacity.
        if (output.isLast() || outputStart == 0) {
          return Encode.error(new EncodeException("oversized control frame"));
        }
      } else if (payloadSize == 0 && !encodePayload.isDone()) {
        // Don't write empty fragments.
      } else {
        // Not a fragmented control frame; accept the encoded fragment.
        encode = encodePayload;
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
        if (encode.isDone()) {
          // The full message has been encoded.
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
    return new EncodeWsFrame<T>(encoder, frame, encode, offset);
  }

}
