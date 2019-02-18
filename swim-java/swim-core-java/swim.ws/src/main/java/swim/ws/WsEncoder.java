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

import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;

public abstract class WsEncoder {
  public abstract boolean isMasked();

  public abstract void maskingKey(byte[] maskingKey);

  public <T> Encoder<?, WsFrame<T>> frameEncoder(WsFrame<T> frame) {
    final WsOpcode opcode = frame.opcode();
    switch (opcode) {
      case CONTINUATION: return Encoder.error(new EncoderException("invalid opcode: " + opcode));
      case TEXT: return textFrameEncoder(frame);
      case BINARY: return binaryFrameEncoder(frame);
      case CLOSE: return closeFrameEncoder(frame);
      case PING: return pingFrameEncoder(frame);
      case PONG: return pongFrameEncoder(frame);
      default: return Encoder.error(new EncoderException("reserved opcode: " + opcode));
    }
  }

  public <T> Encoder<?, WsFrame<T>> encodeFrame(WsFrame<T> frame, OutputBuffer<?> output) {
    final WsOpcode opcode = frame.opcode();
    switch (opcode) {
      case CONTINUATION: return Encoder.error(new EncoderException("invalid opcode: " + opcode));
      case TEXT: return encodeTextFrame(frame, output);
      case BINARY: return encodeBinaryFrame(frame, output);
      case CLOSE: return encodeCloseFrame(frame, output);
      case PING: return encodePingFrame(frame, output);
      case PONG: return encodePongFrame(frame, output);
      default: return Encoder.error(new EncoderException("reserved opcode: " + opcode));
    }
  }

  public <T> Encoder<?, WsFrame<T>> textFrameEncoder(WsFrame<T> frame) {
    return new WsFrameEncoder<T>(this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> encodeTextFrame(WsFrame<T> frame, OutputBuffer<?> output) {
    return WsFrameEncoder.encode(output, this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> binaryFrameEncoder(WsFrame<T> frame) {
    return new WsFrameEncoder<T>(this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> encodeBinaryFrame(WsFrame<T> frame, OutputBuffer<?> output) {
    return WsFrameEncoder.encode(output, this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> closeFrameEncoder(WsFrame<T> frame) {
    return new WsFrameEncoder<T>(this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> encodeCloseFrame(WsFrame<T> frame, OutputBuffer<?> output) {
    return WsFrameEncoder.encode(output, this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> pingFrameEncoder(WsFrame<T> frame) {
    return new WsFrameEncoder<T>(this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> encodePingFrame(WsFrame<T> frame, OutputBuffer<?> output) {
    return WsFrameEncoder.encode(output, this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> pongFrameEncoder(WsFrame<T> frame) {
    return new WsFrameEncoder<T>(this, frame);
  }

  public <T> Encoder<?, WsFrame<T>> encodePongFrame(WsFrame<T> frame, OutputBuffer<?> output) {
    return WsFrameEncoder.encode(output, this, frame);
  }
}
