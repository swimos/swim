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
import java.util.zip.DataFormatException;
import java.util.zip.Inflater;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.BinaryInputBuffer;
import swim.codec.Decode;
import swim.codec.DecodeException;
import swim.codec.InputBuffer;
import swim.codec.Transcoder;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;

@Public
@Since("5.0")
public class WsDeflateDecoder extends WsDecoder {

  protected final WsEngineOptions options;
  protected final BinaryInputBuffer inflateBuffer;
  protected final Inflater inflater;
  protected boolean decompressing;

  protected WsDeflateDecoder(boolean masked, WsEngineOptions options) {
    super(masked);
    this.options = options;
    this.inflateBuffer = BinaryInputBuffer.allocate(options.inflateBufferSize()).asLast(false);
    this.inflater = new Inflater(true);
    this.decompressing = false;
  }

  public final WsEngineOptions options() {
    return this.options;
  }

  public final Inflater inflater() {
    return this.inflater;
  }

  /**
   * Returns {@code true} if the next decoded continuation frame needs to be
   * decompressed. Used to coordinate decompression of fragmented messages.
   */
  public final boolean decompressing() {
    return this.decompressing;
  }

  @Override
  public <T> Decode<WsFrame<T>> decodeContinuationFrame(InputBuffer input, WsCodec<T> codec,
                                                        int finRsvOp, WsOpcode frameType,
                                                        Transcoder<?> transcoder,
                                                        Decode<?> decodePayload) {
    if (this.decompressing) { // compressed message continuation
      return DecodeWsDeflateFrame.decode(input, this, codec, frameType, transcoder,
                                         decodePayload, 0L, 0L, 0, 0, 1);
    } else { // uncompressed message continuation
      return super.decodeContinuationFrame(input, codec, finRsvOp, frameType,
                                           transcoder, decodePayload);
    }
  }

  @Override
  public <T> Decode<WsFrame<T>> decodeTextFrame(InputBuffer input, WsCodec<T> codec, int finRsvOp) {
    if ((finRsvOp & 0x40) != 0) { // compressed message
      this.decompressing = (finRsvOp & 0x80) == 0;
      return DecodeWsDeflateFrame.decode(input, this, codec, WsOpcode.TEXT,
                                         null, null, 0L, 0L, 0, 0, 1);
    } else { // uncompressed message
      this.decompressing = false;
      return super.decodeTextFrame(input, codec, finRsvOp);
    }
  }

  @Override
  public <T> Decode<WsFrame<T>> decodeBinaryFrame(InputBuffer input, WsCodec<T> codec, int finRsvOp) {
    if ((finRsvOp & 0x40) != 0) { // compressed message
      this.decompressing = (finRsvOp & 0x80) == 0;
      return DecodeWsDeflateFrame.decode(input, this, codec, WsOpcode.BINARY,
                                         null, null, 0L, 0L, 0, 0, 1);
    } else { // uncompressed message
      this.decompressing = false;
      return super.decodeBinaryFrame(input, codec, finRsvOp);
    }
  }

  @Override
  public void reset() {
    this.inflateBuffer.clear().asLast(false);
    this.inflater.reset();
    this.decompressing = false;
  }

  @Override
  public void close() {
    this.inflater.end();
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.masked) {
      notation.beginInvoke("Ws", "deflateServerDecoder")
              .appendArgument(this.options)
              .endInvoke();
    } else {
      notation.beginInvoke("Ws", "deflateClientDecoder")
              .appendArgument(this.options)
              .endInvoke();
    }
  }

}

final class DecodeWsDeflateFrame<T> extends Decode<WsFrame<T>> {

  final WsDeflateDecoder decoder;
  final WsCodec<T> codec;
  final @Nullable WsOpcode frameType;
  final @Nullable Transcoder<?> transcoder;
  final @Nullable Decode<?> decodePayload;
  final long offset;
  final long length;
  final int finRsvOp;
  final int maskingKey;
  final int step;

  DecodeWsDeflateFrame(WsDeflateDecoder decoder, WsCodec<T> codec,
                       @Nullable WsOpcode frameType, @Nullable Transcoder<?> transcoder,
                       @Nullable Decode<?> decodePayload, long offset, long length,
                       int finRsvOp, int maskingKey, int step) {
    this.decoder = decoder;
    this.codec = codec;
    this.frameType = frameType;
    this.transcoder = transcoder;
    this.decodePayload = decodePayload;
    this.offset = offset;
    this.length = length;
    this.finRsvOp = finRsvOp;
    this.maskingKey = maskingKey;
    this.step = step;
  }

  @Override
  public Decode<WsFrame<T>> consume(InputBuffer input) {
    return DecodeWsDeflateFrame.decode(input, this.decoder, this.codec,
                                       this.frameType, this.transcoder,
                                       this.decodePayload, this.offset,
                                       this.length, this.finRsvOp,
                                       this.maskingKey, this.step);
  }

  static <T> Decode<WsFrame<T>> decode(InputBuffer input, WsDeflateDecoder decoder,
                                       WsCodec<T> codec, @Nullable WsOpcode frameType,
                                       @Nullable Transcoder<?> transcoder,
                                       @Nullable Decode<?> decodePayload,
                                       long offset, long length, int finRsvOp,
                                       int maskingKey, int step) {
    if (step == 1) { // finRsvOp byte
      if (input.isCont()) {
        finRsvOp = input.head();
        input.step();
        final WsOpcode opcode = WsOpcode.of(finRsvOp & 0xF);
        if (opcode != WsOpcode.CONTINUATION && (finRsvOp & 0x40) == 0) {
          return Decode.error(new DecodeException("Expected compressed message"));
        }
        if (frameType == null) {
          frameType = opcode;
        }
        step = 2;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Expected finRsvOp"));
      }
    }
    if (step == 2) { // mask-len byte
      if (input.isCont()) {
        final int maskLen = input.head();
        input.step();
        final boolean masked = (maskLen & 0x80) != 0;
        if (masked && !decoder.masked) {
          return Decode.error(new DecodeException("Masked server frame"));
        } else if (!masked && decoder.masked) {
          return Decode.error(new DecodeException("Unmasked client frame"));
        }
        final int len = maskLen & 0x7F;
        if (len == 126) { // short length
          step = 3;
        } else if (len == 127) { // long length
          step = 5;
        } else {
          length = (long) len;
          step = decoder.masked ? 13 : 17;
        }
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Expected mask-length"));
      }
    }
    if (step == 3) { // short length byte 0
      if (input.isCont()) {
        length = (long) ((input.head() & 0xFF) << 8);
        input.step();
        step = 4;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Expected short length"));
      }
    }
    if (step == 4) { // short length byte 1
      if (input.isCont()) {
        length |= (long) (input.head() & 0xFF);
        input.step();
        step = decoder.masked ? 13 : 17;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Incomplete short length"));
      }
    }
    if (step == 5) { // long length byte 0
      if (input.isCont()) {
        length = (input.head() & 0xFFL) << 56;
        input.step();
        step = 6;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Expected long length"));
      }
    }
    if (step == 6) { // long length byte 1
      if (input.isCont()) {
        length |= (input.head() & 0xFFL) << 48;
        input.step();
        step = 7;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Incomplete long length"));
      }
    }
    if (step == 7) { // long length byte 2
      if (input.isCont()) {
        length |= (input.head() & 0xFFL) << 40;
        input.step();
        step = 8;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Incomplete long length"));
      }
    }
    if (step == 8) { // long length byte 3
      if (input.isCont()) {
        length |= (input.head() & 0xFFL) << 32;
        input.step();
        step = 9;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Incomplete long length"));
      }
    }
    if (step == 9) { // long length byte 4
      if (input.isCont()) {
        length |= (input.head() & 0xFFL) << 24;
        input.step();
        step = 10;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Incomplete long length"));
      }
    }
    if (step == 10) { // long length byte 5
      if (input.isCont()) {
        length |= (input.head() & 0xFFL) << 16;
        input.step();
        step = 11;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Incomplete long length"));
      }
    }
    if (step == 11) { // long length byte 6
      if (input.isCont()) {
        length |= (input.head() & 0xFFL) << 8;
        input.step();
        step = 12;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Incomplete long length"));
      }
    }
    if (step == 12) { // long length byte 7
      if (input.isCont()) {
        length |= input.head() & 0xFFL;
        input.step();
        step = decoder.masked ? 13 : 17;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Incomplete long length"));
      }
    }
    if (step == 13) { // masking key byte 0
      if (input.isCont()) {
        maskingKey = (input.head() & 0xFF) << 24;
        input.step();
        step = 14;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Expected masking key"));
      }
    }
    if (step == 14) { // masking key byte 1
      if (input.isCont()) {
        maskingKey |= (input.head() & 0xFF) << 16;
        input.step();
        step = 15;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Incomplete masking key"));
      }
    }
    if (step == 15) { // masking key byte 2
      if (input.isCont()) {
        maskingKey |= (input.head() & 0xFF) << 8;
        input.step();
        step = 16;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Incomplete masking key"));
      }
    }
    if (step == 16) { // masking key byte 3
      if (input.isCont()) {
        maskingKey |= input.head() & 0xFF;
        input.step();
        step = 17;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("Incomplete masking key"));
      }
    }
    if (step == 17) { // payload
      frameType = Assume.nonNull(frameType);
      final int inputStart = input.position();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      final long frameRemaining = length - offset;
      final int decodeSize = (int) Math.min((long) inputRemaining, frameRemaining);

      if (decoder.masked) {
        // Unmask the payload.
        for (int i = 0; i < decodeSize; i += 1) {
          final int maskShift = 24 - ((((int) offset + i) & 0x3) << 3);
          final int maskByte = maskingKey >>> maskShift & 0xFF;
          input.set(inputStart + i, input.get(inputStart + i) ^ maskByte);
        }
      }

      // Inflate and decode the payload.
      final BinaryInputBuffer inflateBuffer = decoder.inflateBuffer;
      input.limit(inputStart + decodeSize);
      do {
        // Inflate the payload from the input buffer into the inflate buffer.
        final ByteBuffer inputBuffer = input.asByteBuffer();
        decoder.inflater.setInput(inputBuffer);
        try {
          decoder.inflater.inflate(inflateBuffer.byteBuffer());
        } catch (DataFormatException cause) {
          return Decode.error(new DecodeException("Inflate error", cause));
        }
        input.position(inputBuffer.position());

        // Decode the payload from the inflate buffer.
        inflateBuffer.flip();
        if (decodePayload == null) {
          try {
            transcoder = codec.getPayloadTranscoder(WsOpcode.of(finRsvOp & 0xF));
          } catch (Throwable cause) {
            if (Result.isNonFatal(cause)) {
              return Decode.error(new DecodeException("Unable to get payload transcoder", cause));
            } else {
              throw cause;
            }
          }
          decodePayload = transcoder.decode(inflateBuffer);
        } else {
          decodePayload = decodePayload.consume(inflateBuffer);
        }
        inflateBuffer.compact();
        if (decodePayload.isCont() && input.hasRemaining()) {
          continue;
        }
        break;
      } while (true);
      input.limit(inputLimit);

      if ((finRsvOp & 0x80) != 0 && frameRemaining <= (long) inputRemaining) {
        // Inject the implicit empty block.
        decoder.inflater.setInput(EMPTY_BLOCK);
        try {
          decoder.inflater.inflate(inflateBuffer.byteBuffer());
        } catch (DataFormatException cause) {
          return Decode.error(new DecodeException("Inflate error", cause));
        }

        // Decode the final input.
        inflateBuffer.flip().asLast(true);
        decodePayload = decodePayload.consume(inflateBuffer);
        inflateBuffer.compact().asLast(false);
      }

      offset += (long) (input.position() - inputStart);
      if (offset == length) {
        if ((finRsvOp & 0x80) != 0) {
          if (frameType.code < 0x8) { // data frame
            try {
              return Decode.done(codec.createDataFrame(
                  frameType, Assume.conformsNullable(decodePayload.get()),
                  Assume.conformsNonNull(transcoder)));
            } catch (Throwable cause) {
              if (Result.isNonFatal(cause)) {
                return Decode.error(new DecodeException("Unable to construct data frame", cause));
              } else {
                throw cause;
              }
            }
          } else { // control frame
            try {
              return Decode.done(Assume.conforms(codec.createControlFrame(
                  frameType, Assume.conformsNullable(decodePayload.get()),
                  Assume.nonNull(transcoder))));
            } catch (Throwable cause) {
              if (Result.isNonFatal(cause)) {
                return Decode.error(new DecodeException("Unable to construct control frame", cause));
              } else {
                throw cause;
              }
            }
          }
        } else if ((finRsvOp & 0xF) < 0x8) { // fragment frame
          return Decode.done(WsFragmentFrame.of(frameType, Assume.conformsNonNull(transcoder),
                                                Assume.conforms(decodePayload)));
        } else {
          return Decode.error(new DecodeException("Fragmented control frame"));
        }
      } else if (decodePayload.isDone()) {
        return Decode.error(new DecodeException("Undecoded payload data"));
      } else if (decodePayload.isError()) {
        return decodePayload.asError();
      }
    }
    if (input.isError()) {
      return Decode.error(input.getError());
    }
    return new DecodeWsDeflateFrame<T>(decoder, codec, frameType, transcoder, decodePayload,
                                       offset, length, finRsvOp, maskingKey, step);
  }

  private static final byte[] EMPTY_BLOCK = {(byte) 0x00, (byte) 0x00, (byte) 0xff, (byte) 0xff};

}
