// Copyright 2015-2023 Nstream, inc.
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

import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;

public abstract class WsEncoder {

  public WsEncoder() {
    // nop
  }

  public abstract boolean isMasked();

  public abstract void maskingKey(byte[] maskingKey);

  public int minDataFrameBufferSize() {
    return 128;
  }

  public <T> Encoder<?, WsFrame<T>> frameEncoder(WsFrame<T> frame) {
    final WsOpcode frameType = frame.frameType();
    switch (frameType) {
      case CONTINUATION: return Encoder.error(new EncoderException("invalid opcode: " + frameType));
      case TEXT: return this.textFrameEncoder(frame);
      case BINARY: return this.binaryFrameEncoder(frame);
      case CLOSE: return this.closeFrameEncoder(frame);
      case PING: return this.pingFrameEncoder(frame);
      case PONG: return this.pongFrameEncoder(frame);
      default: return Encoder.error(new EncoderException("reserved opcode: " + frameType));
    }
  }

  public <T> Encoder<?, WsFrame<T>> encodeFrame(OutputBuffer<?> output, WsFrame<T> frame) {
    final WsOpcode frameType = frame.frameType();
    switch (frameType) {
      case CONTINUATION: return Encoder.error(new EncoderException("invalid opcode: " + frameType));
      case TEXT: return this.encodeTextFrame(output, frame);
      case BINARY: return this.encodeBinaryFrame(output, frame);
      case CLOSE: return this.encodeCloseFrame(output, frame);
      case PING: return this.encodePingFrame(output, frame);
      case PONG: return this.encodePongFrame(output, frame);
      default: return Encoder.error(new EncoderException("reserved opcode: " + frameType));
    }
  }

  public <T> Encoder<?, WsFrame<T>> textFrameEncoder(WsFrame<T> frame) {
    return new WsFrameEncoder<T>(this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> encodeTextFrame(OutputBuffer<?> output, WsFrame<T> frame) {
    return WsFrameEncoder.encode(output, this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> binaryFrameEncoder(WsFrame<T> frame) {
    return new WsFrameEncoder<T>(this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> encodeBinaryFrame(OutputBuffer<?> output, WsFrame<T> frame) {
    return WsFrameEncoder.encode(output, this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> closeFrameEncoder(WsFrame<T> frame) {
    return new WsFrameEncoder<T>(this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> encodeCloseFrame(OutputBuffer<?> output, WsFrame<T> frame) {
    return WsFrameEncoder.encode(output, this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> pingFrameEncoder(WsFrame<T> frame) {
    return new WsFrameEncoder<T>(this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> encodePingFrame(OutputBuffer<?> output, WsFrame<T> frame) {
    return WsFrameEncoder.encode(output, this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> pongFrameEncoder(WsFrame<T> frame) {
    return new WsFrameEncoder<T>(this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> encodePongFrame(OutputBuffer<?> output, WsFrame<T> frame) {
    return WsFrameEncoder.encode(output, this, frame);
  }

}
