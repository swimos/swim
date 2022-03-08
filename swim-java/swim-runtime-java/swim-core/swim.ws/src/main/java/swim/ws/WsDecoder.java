// Copyright 2015-2022 Swim.inc
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
import swim.codec.Encoder;
import swim.codec.InputBuffer;
import swim.structure.Data;

public abstract class WsDecoder {

  public WsDecoder() {
    // nop
  }

  public <T> WsFrame<T> fragmentFrame(WsOpcode frameType, Decoder<T> payloadDecoder) {
    return new WsFragmentFrame<T>(frameType, payloadDecoder);
  }

  public <T> WsDataFrame<T> dataFrame(WsOpcode frameType, T payloadValue) {
    switch (frameType) {
      case TEXT: return this.textFrame(payloadValue);
      case BINARY: return this.binaryFrame(payloadValue);
      default: throw new IllegalArgumentException(frameType.toString());
    }
  }

  public <T> WsTextFrame<T> textFrame(T payloadValue) {
    return new WsTextFrame<T>(payloadValue, Encoder.done());
  }

  public <T> WsBinaryFrame<T> binaryFrame(T payloadValue) {
    return new WsBinaryFrame<T>(payloadValue, Encoder.done());
  }

  public <P, T> WsControlFrame<P, T> controlFrame(WsOpcode frameType, P payloadValue) {
    switch (frameType) {
      case CLOSE: return this.closeFrame(payloadValue);
      case PING: return this.pingFrame(payloadValue);
      case PONG: return this.pongFrame(payloadValue);
      default: throw new IllegalArgumentException(frameType.toString());
    }
  }

  @SuppressWarnings("unchecked")
  public <P, T> WsCloseFrame<P, T> closeFrame(P payloadValue) {
    return WsCloseFrame.create(payloadValue);
  }

  @SuppressWarnings("unchecked")
  public <P, T> WsPingFrame<P, T> pingFrame(P payloadValue) {
    return WsPingFrame.create(payloadValue);
  }

  @SuppressWarnings("unchecked")
  public <P, T> WsPongFrame<P, T> pongFrame(P payloadValue) {
    return WsPongFrame.create(payloadValue);
  }

  public <T> Decoder<T> textDecoder(Decoder<T> payloadDecoder) {
    return payloadDecoder.fork(WsOpcode.TEXT);
  }

  public <T> Decoder<T> binaryDecoder(Decoder<T> payloadDecoder) {
    return payloadDecoder.fork(WsOpcode.BINARY);
  }

  public <T> Decoder<?> closeDecoder(Decoder<T> payloadDecoder) {
    return WsStatus.decoder();
  }

  public <T> Decoder<?> pingDecoder(Decoder<T> payloadDecoder) {
    return Binary.outputParser(Data.output());
  }

  public <T> Decoder<?> pongDecoder(Decoder<T> payloadDecoder) {
    return Binary.outputParser(Data.output());
  }

  public <T> Decoder<WsFrame<T>> messageDecoder(Decoder<T> payloadDecoder) {
    return new WsMessageDecoder<T>(this, null, payloadDecoder);
  }

  public <T> Decoder<WsFrame<T>> decodeMessage(InputBuffer input, Decoder<T> payloadDecoder) {
    return WsMessageDecoder.decode(input, this, null, payloadDecoder);
  }

  public <T> Decoder<WsFrame<T>> continuationDecoder(WsOpcode frameType, Decoder<T> payloadDecoder) {
    return new WsMessageDecoder<T>(this, frameType, payloadDecoder);
  }

  public <T> Decoder<WsFrame<T>> decodeContinuation(InputBuffer input, WsOpcode frameType, Decoder<T> payloadDecoder) {
    return WsMessageDecoder.decode(input, this, frameType, payloadDecoder);
  }

  public <T> Decoder<WsFrame<T>> decodeFinRsvOp(InputBuffer input, int finRsvOp, WsOpcode frameType, Decoder<T> payloadDecoder) {
    final int opcode = finRsvOp & 0xf;
    switch (opcode) {
      case 0x0: return this.decodeContinuationFrame(input, finRsvOp, frameType, payloadDecoder);
      case 0x1: return this.decodeTextFrame(input, finRsvOp, this.textDecoder(payloadDecoder));
      case 0x2: return this.decodeBinaryFrame(input, finRsvOp, this.binaryDecoder(payloadDecoder));
      case 0x8: return this.decodeCloseFrame(input, finRsvOp, this.closeDecoder(payloadDecoder));
      case 0x9: return this.decodePingFrame(input, finRsvOp, this.pingDecoder(payloadDecoder));
      case 0xa: return this.decodePongFrame(input, finRsvOp, this.pongDecoder(payloadDecoder));
      default: return Decoder.error(new DecoderException("reserved opcode: " + WsOpcode.from(opcode)));
    }
  }

  public <T> Decoder<WsFrame<T>> decodeContinuationFrame(InputBuffer input, int finRsvOp, WsOpcode frameType, Decoder<T> payloadDecoder) {
    return WsFrameDecoder.decode(input, this, frameType, payloadDecoder);
  }

  public <T> Decoder<WsFrame<T>> decodeTextFrame(InputBuffer input, int finRsvOp, Decoder<T> payloadDecoder) {
    return WsFrameDecoder.decode(input, this, WsOpcode.TEXT, payloadDecoder);
  }

  public <T> Decoder<WsFrame<T>> decodeBinaryFrame(InputBuffer input, int finRsvOp, Decoder<T> payloadDecoder) {
    return WsFrameDecoder.decode(input, this, WsOpcode.BINARY, payloadDecoder);
  }

  @SuppressWarnings("unchecked")
  public <P, T> Decoder<WsFrame<T>> decodeCloseFrame(InputBuffer input, int finRsvOp, Decoder<P> payloadDecoder) {
    return (Decoder<WsFrame<T>>) (Decoder<?>) WsFrameDecoder.decode(input, this, WsOpcode.CLOSE, payloadDecoder);
  }

  @SuppressWarnings("unchecked")
  public <P, T> Decoder<WsFrame<T>> decodePingFrame(InputBuffer input, int finRsvOp, Decoder<P> payloadDecoder) {
    return (Decoder<WsFrame<T>>) (Decoder<?>) WsFrameDecoder.decode(input, this, WsOpcode.PING, payloadDecoder);
  }

  @SuppressWarnings("unchecked")
  public <P, T> Decoder<WsFrame<T>> decodePongFrame(InputBuffer input, int finRsvOp, Decoder<P> payloadDecoder) {
    return (Decoder<WsFrame<T>>) (Decoder<?>) WsFrameDecoder.decode(input, this, WsOpcode.PONG, payloadDecoder);
  }

}
