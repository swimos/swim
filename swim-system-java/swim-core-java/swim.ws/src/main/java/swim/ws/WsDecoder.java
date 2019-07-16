// Copyright 2015-2019 SWIM.AI inc.
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

import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.structure.Data;

public abstract class WsDecoder {
  public <T> WsFrame<T> fragment(WsOpcode opcode, Decoder<T> content) {
    return new WsFragment<T>(opcode, content);
  }

  public <T> WsFrame<T> message(T value) {
    return new WsValue<T>(value);
  }

  public <P, T> WsFrame<T> control(WsOpcode opcode, P payload) {
    switch (opcode) {
      case CLOSE: return close(payload);
      case PING: return ping(payload);
      case PONG: return pong(payload);
      default: throw new IllegalArgumentException(opcode.toString());
    }
  }

  @SuppressWarnings("unchecked")
  public <P, T> WsFrame<T> close(P payload) {
    return (WsFrame<T>) WsClose.from(payload);
  }

  @SuppressWarnings("unchecked")
  public <P, T> WsFrame<T> ping(P payload) {
    return (WsFrame<T>) WsPing.from(payload);
  }

  @SuppressWarnings("unchecked")
  public <P, T> WsFrame<T> pong(P payload) {
    return (WsFrame<T>) WsPong.from(payload);
  }

  public <T> Decoder<T> continuationDecoder(Decoder<T> content) {
    return content;
  }

  public <T> Decoder<T> textDecoder(Decoder<T> content) {
    return content.fork(WsOpcode.TEXT);
  }

  public <T> Decoder<T> binaryDecoder(Decoder<T> content) {
    return content.fork(WsOpcode.BINARY);
  }

  public <T> Decoder<?> closeDecoder(Decoder<T> content) {
    return WsStatus.decoder();
  }

  public <T> Decoder<?> pingDecoder(Decoder<T> content) {
    return Binary.outputParser(Data.output());
  }

  public <T> Decoder<?> pongDecoder(Decoder<T> content) {
    return Binary.outputParser(Data.output());
  }

  public <T> Decoder<WsFrame<T>> frameDecoder(Decoder<T> content) {
    return new WsOpcodeDecoder<T>(this, content);
  }

  public <T> Decoder<WsFrame<T>> decodeFrame(Decoder<T> content, InputBuffer input) {
    return WsOpcodeDecoder.decode(input, this, content);
  }

  public <T> Decoder<WsFrame<T>> decodeFrame(int finRsvOp, Decoder<T> content, InputBuffer input) {
    final int opcode = finRsvOp & 0xf;
    switch (opcode) {
      case 0x0: return decodeContinuationFrame(finRsvOp, continuationDecoder(content), input);
      case 0x1: return decodeTextFrame(finRsvOp, textDecoder(content), input);
      case 0x2: return decodeBinaryFrame(finRsvOp, binaryDecoder(content), input);
      case 0x8: return decodeCloseFrame(finRsvOp, closeDecoder(content), input);
      case 0x9: return decodePingFrame(finRsvOp, pingDecoder(content), input);
      case 0xa: return decodePongFrame(finRsvOp, pongDecoder(content), input);
      default: return Decoder.error(new DecoderException("reserved opcode: " + WsOpcode.from(opcode)));
    }
  }

  public <T> Decoder<WsFrame<T>> decodeContinuationFrame(int finRsvOp, Decoder<T> content, InputBuffer input) {
    return WsFrameDecoder.decode(input, this, content);
  }

  public <T> Decoder<WsFrame<T>> decodeTextFrame(int finRsvOp, Decoder<T> content, InputBuffer input) {
    return WsFrameDecoder.decode(input, this, content);
  }

  public <T> Decoder<WsFrame<T>> decodeBinaryFrame(int finRsvOp, Decoder<T> content, InputBuffer input) {
    return WsFrameDecoder.decode(input, this, content);
  }

  @SuppressWarnings("unchecked")
  public <P, T> Decoder<WsFrame<T>> decodeCloseFrame(int finRsvOp, Decoder<P> content, InputBuffer input) {
    return (Decoder<WsFrame<T>>) (Decoder<?>) WsFrameDecoder.decode(input, this, content);
  }

  @SuppressWarnings("unchecked")
  public <P, T> Decoder<WsFrame<T>> decodePingFrame(int finRsvOp, Decoder<P> content, InputBuffer input) {
    return (Decoder<WsFrame<T>>) (Decoder<?>) WsFrameDecoder.decode(input, this, content);
  }

  @SuppressWarnings("unchecked")
  public <P, T> Decoder<WsFrame<T>> decodePongFrame(int finRsvOp, Decoder<P> content, InputBuffer input) {
    return (Decoder<WsFrame<T>>) (Decoder<?>) WsFrameDecoder.decode(input, this, content);
  }
}
