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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Codec;
import swim.codec.Decode;
import swim.codec.DecodeException;
import swim.codec.InputBuffer;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public class WsDecoder implements WriteSource {

  protected final boolean masked;

  protected WsDecoder(boolean masked) {
    this.masked = masked;
  }

  public final boolean isMasked() {
    return this.masked;
  }

  public <T> Decode<WsFrame<T>> decodeMessage(InputBuffer input, WsSubprotocol<T> subprotocol) {
    return DecodeWsMessage.decode(input, this, subprotocol, null, null, null);
  }

  public <T> Decode<WsFrame<T>> decodeMessage(WsSubprotocol<T> subprotocol) {
    return new DecodeWsMessage<T>(this, subprotocol, null, null, null);
  }

  public <T> Decode<WsFrame<T>> decodeContinuation(InputBuffer input, WsSubprotocol<T> subprotocol,
                                                   WsFragment<T> fragment) {
    return DecodeWsMessage.decode(input, this, subprotocol, fragment.frameType,
                                  fragment.codec, fragment.decodePayload);
  }

  public <T> Decode<WsFrame<T>> decodeContinuation(WsSubprotocol<T> subprotocol, WsFragment<T> fragment) {
    return new DecodeWsMessage<T>(this, subprotocol, fragment.frameType,
                                  fragment.codec, fragment.decodePayload);
  }

  public <T> Decode<WsFrame<T>> decodeFinRsvOp(InputBuffer input, WsSubprotocol<T> subprotocol,
                                               int finRsvOp, @Nullable WsOpcode frameType,
                                               @Nullable Codec<?> codec,
                                               @Nullable Decode<?> decodePayload) {
    final WsOpcode opcode = WsOpcode.of(finRsvOp & 0xF);
    switch (opcode) {
      case CONTINUATION:
        return this.decodeContinuationFrame(input, subprotocol, finRsvOp,
                                            Assume.nonNull(frameType),
                                            Assume.nonNull(codec),
                                            Assume.nonNull(decodePayload));
      case TEXT:
        return this.decodeTextFrame(input, subprotocol, finRsvOp);
      case BINARY:
        return this.decodeBinaryFrame(input, subprotocol, finRsvOp);
      case CLOSE:
        return this.decodeCloseFrame(input, subprotocol, finRsvOp);
      case PING:
        return this.decodePingFrame(input, subprotocol, finRsvOp);
      case PONG:
        return this.decodePongFrame(input, subprotocol, finRsvOp);
      default:
        return Decode.error(new DecodeException("unsupported opcode: " + opcode.name()));
    }
  }

  public <T> Decode<WsFrame<T>> decodeContinuationFrame(InputBuffer input, WsSubprotocol<T> subprotocol,
                                                        int finRsvOp, WsOpcode frameType,
                                                        Codec<?> codec, Decode<?> decodePayload) {
    return DecodeWsFrame.decode(input, this, subprotocol, frameType, codec, decodePayload, 0L, 0L, 0, 0, 1);
  }

  public <T> Decode<WsFrame<T>> decodeTextFrame(InputBuffer input, WsSubprotocol<T> subprotocol, int finRsvOp) {
    return DecodeWsFrame.decode(input, this, subprotocol, WsOpcode.TEXT, null, null, 0L, 0L, 0, 0, 1);
  }

  public <T> Decode<WsFrame<T>> decodeBinaryFrame(InputBuffer input, WsSubprotocol<T> subprotocol, int finRsvOp) {
    return DecodeWsFrame.decode(input, this, subprotocol, WsOpcode.BINARY, null, null, 0L, 0L, 0, 0, 1);
  }

  public <T> Decode<WsFrame<T>> decodeCloseFrame(InputBuffer input, WsSubprotocol<T> subprotocol, int finRsvOp) {
    return DecodeWsFrame.decode(input, this, subprotocol, WsOpcode.CLOSE, null, null, 0L, 0L, 0, 0, 1);
  }

  public <T> Decode<WsFrame<T>> decodePingFrame(InputBuffer input, WsSubprotocol<T> subprotocol, int finRsvOp) {
    return DecodeWsFrame.decode(input, this, subprotocol, WsOpcode.PING, null, null, 0L, 0L, 0, 0, 1);
  }

  public <T> Decode<WsFrame<T>> decodePongFrame(InputBuffer input, WsSubprotocol<T> subprotocol, int finRsvOp) {
    return DecodeWsFrame.decode(input, this, subprotocol, WsOpcode.PONG, null, null, 0L, 0L, 0, 0, 1);
  }

  public <T> WsDataFrame<T> dataFrame(WsOpcode frameType, @Nullable T payload, Codec<T> codec) throws WsException {
    switch (frameType) {
      case TEXT:
        return WsTextFrame.of(payload, Assume.conforms(codec));
      case BINARY:
        return WsBinaryFrame.of(payload, Assume.conforms(codec));
      default:
        throw new WsException(WsStatus.of(1002), "unsupported data frame type: " + frameType.toString());
    }
  }

  public <T> WsControlFrame<T> controlFrame(WsOpcode frameType, @Nullable T payload, Codec<T> codec) throws WsException {
    switch (frameType) {
      case CLOSE:
        return WsCloseFrame.of(payload, codec);
      case PING:
        return WsPingFrame.of(payload, codec);
      case PONG:
        return WsPongFrame.of(payload, codec);
      default:
        throw new WsException(WsStatus.of(1002), "unsupported control frame type: " + frameType.toString());
    }
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
      notation.beginInvoke("Ws", "serverDecoder").endInvoke();
    } else {
      notation.beginInvoke("Ws", "clientDecoder").endInvoke();
    }
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WsDecoder CLIENT_DECODER = new WsDecoder(false);

  static final WsDecoder SERVER_DECODER = new WsDecoder(true);

}

final class DecodeWsMessage<T> extends Decode<WsFrame<T>> {

  final WsDecoder decoder;
  final WsSubprotocol<T> subprotocol;
  final @Nullable WsOpcode frameType;
  final @Nullable Codec<?> codec;
  final @Nullable Decode<?> decodePayload;

  DecodeWsMessage(WsDecoder decoder, WsSubprotocol<T> subprotocol, @Nullable WsOpcode frameType,
                  @Nullable Codec<?> codec, @Nullable Decode<?> decodePayload) {
    this.decoder = decoder;
    this.subprotocol = subprotocol;
    this.frameType = frameType;
    this.codec = codec;
    this.decodePayload = decodePayload;
  }

  @Override
  public Decode<WsFrame<T>> consume(InputBuffer input) {
    return DecodeWsMessage.decode(input, this.decoder, this.subprotocol, this.frameType,
                                  this.codec, this.decodePayload);
  }

  static <T> Decode<WsFrame<T>> decode(InputBuffer input, WsDecoder decoder,
                                       WsSubprotocol<T> subprotocol,
                                       @Nullable WsOpcode frameType,
                                       @Nullable Codec<?> codec,
                                       @Nullable Decode<?> decodePayload) {
    if (input.isCont()) {
      final int finRsvOp = input.head();
      final WsOpcode opcode = WsOpcode.of(finRsvOp & 0xF);
      if (decodePayload != null && opcode.isData()) {
        return Decode.error(new DecodeException("interleaved message"));
      } else if (opcode.isControl()) {
        return decoder.decodeFinRsvOp(input, subprotocol, finRsvOp, frameType, null, null);
      } else {
        return decoder.decodeFinRsvOp(input, subprotocol, finRsvOp, frameType,
                                      codec, decodePayload);
      }
    } else if (input.isDone()) {
      return Decode.error(new DecodeException("expected websocket frame"));
    } else if (input.isError()) {
      return Decode.error(input.getError());
    }
    return new DecodeWsMessage<T>(decoder, subprotocol, frameType, codec, decodePayload);
  }

}

final class DecodeWsFrame<T> extends Decode<WsFrame<T>> {

  final WsDecoder decoder;
  final WsSubprotocol<T> subprotocol;
  final @Nullable WsOpcode frameType;
  final @Nullable Codec<?> codec;
  final @Nullable Decode<?> decodePayload;
  final long offset;
  final long length;
  final int finRsvOp;
  final int maskingKey;
  final int step;

  DecodeWsFrame(WsDecoder decoder, WsSubprotocol<T> subprotocol, @Nullable WsOpcode frameType,
                @Nullable Codec<?> codec, @Nullable Decode<?> decodePayload,
                long offset, long length, int finRsvOp, int maskingKey, int step) {
    this.decoder = decoder;
    this.subprotocol = subprotocol;
    this.frameType = frameType;
    this.codec = codec;
    this.decodePayload = decodePayload;
    this.offset = offset;
    this.length = length;
    this.finRsvOp = finRsvOp;
    this.maskingKey = maskingKey;
    this.step = step;
  }

  @Override
  public Decode<WsFrame<T>> consume(InputBuffer input) {
    return DecodeWsFrame.decode(input, this.decoder, this.subprotocol, this.frameType, this.codec,
                                this.decodePayload, this.offset, this.length, this.finRsvOp,
                                this.maskingKey, this.step);
  }

  static <T> Decode<WsFrame<T>> decode(InputBuffer input, WsDecoder decoder,
                                       WsSubprotocol<T> subprotocol, @Nullable WsOpcode frameType,
                                       @Nullable Codec<?> codec, @Nullable Decode<?> decodePayload,
                                       long offset, long length, int finRsvOp,
                                       int maskingKey, int step) {
    if (step == 1) { // finRsvOp byte
      if (input.isCont()) {
        finRsvOp = input.head();
        input.step();
        if (frameType == null) {
          frameType = WsOpcode.of(finRsvOp & 0xF);
        }
        step = 2;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("expected finRsvOp"));
      }
    }
    if (step == 2) { // mask-len byte
      if (input.isCont()) {
        final int maskLen = input.head();
        input.step();
        final boolean masked = (maskLen & 0x80) != 0;
        if (masked && !decoder.masked) {
          return Decode.error(new DecodeException("masked server frame"));
        } else if (!masked && decoder.masked) {
          return Decode.error(new DecodeException("unmasked client frame"));
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
        return Decode.error(new DecodeException("expected mask-length"));
      }
    }
    if (step == 3) { // short length byte 0
      if (input.isCont()) {
        length = (long) ((input.head() & 0xFF) << 8);
        input.step();
        step = 4;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("expected short length"));
      }
    }
    if (step == 4) { // short length byte 1
      if (input.isCont()) {
        length |= (long) (input.head() & 0xFF);
        input.step();
        step = decoder.masked ? 13 : 17;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("incomplete short length"));
      }
    }
    if (step == 5) { // long length byte 0
      if (input.isCont()) {
        length = (input.head() & 0xFFL) << 56;
        input.step();
        step = 6;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("expected long length"));
      }
    }
    if (step == 6) { // long length byte 1
      if (input.isCont()) {
        length |= (input.head() & 0xFFL) << 48;
        input.step();
        step = 7;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("incomplete long length"));
      }
    }
    if (step == 7) { // long length byte 2
      if (input.isCont()) {
        length |= (input.head() & 0xFFL) << 40;
        input.step();
        step = 8;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("incomplete long length"));
      }
    }
    if (step == 8) { // long length byte 3
      if (input.isCont()) {
        length |= (input.head() & 0xFFL) << 32;
        input.step();
        step = 9;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("incomplete long length"));
      }
    }
    if (step == 9) { // long length byte 4
      if (input.isCont()) {
        length |= (input.head() & 0xFFL) << 24;
        input.step();
        step = 10;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("incomplete long length"));
      }
    }
    if (step == 10) { // long length byte 5
      if (input.isCont()) {
        length |= (input.head() & 0xFFL) << 16;
        input.step();
        step = 11;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("incomplete long length"));
      }
    }
    if (step == 11) { // long length byte 6
      if (input.isCont()) {
        length |= (input.head() & 0xFFL) << 8;
        input.step();
        step = 12;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("incomplete long length"));
      }
    }
    if (step == 12) { // long length byte 7
      if (input.isCont()) {
        length |= input.head() & 0xFFL;
        input.step();
        step = decoder.masked ? 13 : 17;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("incomplete long length"));
      }
    }
    if (step == 13) { // masking key byte 0
      if (input.isCont()) {
        maskingKey = (input.head() & 0xFF) << 24;
        input.step();
        step = 14;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("expected masking key"));
      }
    }
    if (step == 14) { // masking key byte 1
      if (input.isCont()) {
        maskingKey |= (input.head() & 0xFF) << 16;
        input.step();
        step = 15;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("incomplete masking key"));
      }
    }
    if (step == 15) { // masking key byte 2
      if (input.isCont()) {
        maskingKey |= (input.head() & 0xFF) << 8;
        input.step();
        step = 16;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("incomplete masking key"));
      }
    }
    if (step == 16) { // masking key byte 3
      if (input.isCont()) {
        maskingKey |= input.head() & 0xFF;
        input.step();
        step = 17;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("incomplete masking key"));
      }
    }
    if (step == 17) { // payload
      frameType = Assume.nonNull(frameType);
      final int inputStart = input.position();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      final boolean inputLast = input.isLast();
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

      // Decode the payload.
      input.limit(inputStart + decodeSize);
      input.asLast((finRsvOp & 0x80) != 0 && frameRemaining <= (long) inputRemaining);
      if (decodePayload == null) {
        try {
          codec = subprotocol.messageCodec(WsOpcode.of(finRsvOp & 0xF));
        } catch (WsException cause) {
          return Decode.error(cause);
        }
        decodePayload = codec.decode(input);
      } else {
        decodePayload = decodePayload.consume(input);
      }
      input.limit(inputLimit).asLast(inputLast);
      if (decodePayload.isError()) {
        return decodePayload.asError();
      }

      offset += (long) (input.position() - inputStart);
      if (offset == length) {
        if ((finRsvOp & 0x80) != 0) {
          if (decodePayload.isDone()) {
            final WsFrame<?> frame;
            try {
              final Object payload = decodePayload.getUnchecked();
              if (frameType.code < 0x8) { // data frame
                frame = decoder.dataFrame(frameType, Assume.conformsNullable(payload),
                                          Assume.conformsNonNull(codec));
              } else { // control frame
                frame = decoder.controlFrame(frameType, Assume.conformsNullable(payload),
                                             Assume.nonNull(codec));
              }
            } catch (WsException cause) {
              return Decode.error(cause);
            }
            return Decode.done(Assume.conforms(frame));
          } else {
            return Decode.error(new DecodeException("truncated payload"));
          }
        } else if ((finRsvOp & 0xF) < 0x8) { // fragment frame
          return Decode.done(WsFragment.of(frameType, Assume.conformsNonNull(codec),
                                           Assume.conforms(decodePayload)));
        } else {
          return Decode.error(new DecodeException("fragmented control frame"));
        }
      } else if (decodePayload.isDone()) {
        return Decode.error(new DecodeException("undecoded payload data"));
      }
    }
    if (input.isError()) {
      return Decode.error(input.getError());
    }
    return new DecodeWsFrame<T>(decoder, subprotocol, frameType, codec, decodePayload,
                                offset, length, finRsvOp, maskingKey, step);
  }

}
