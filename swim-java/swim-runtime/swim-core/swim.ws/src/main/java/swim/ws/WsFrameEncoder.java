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

final class WsFrameEncoder<O> extends Encoder<Object, WsFrame<O>> {

  final WsEncoder ws;
  final WsFrame<O> frame;
  final Encoder<?, ?> payloadEncoder;
  final long offset;

  WsFrameEncoder(WsEncoder ws, WsFrame<O> frame, Encoder<?, ?> payloadEncoder, long offset) {
    this.ws = ws;
    this.frame = frame;
    this.payloadEncoder = payloadEncoder;
    this.offset = offset;
  }

  WsFrameEncoder(WsEncoder ws, WsFrame<O> frame) {
    this(ws, frame, null, 0L);
  }

  @Override
  public Encoder<Object, WsFrame<O>> pull(OutputBuffer<?> output) {
    return WsFrameEncoder.encode(output, this.ws, this.frame, this.payloadEncoder, this.offset);
  }

  static <O> Encoder<Object, WsFrame<O>> encode(OutputBuffer<?> output, WsEncoder ws, WsFrame<O> frame,
                                                Encoder<?, ?> payloadEncoder, long offset) {
    final boolean isMasked = ws.isMasked();
    final int outputSize = output.remaining();
    final int maskSize = isMasked ? 4 : 0;
    final int maxHeaderSize = (outputSize <= 127 ? 2 : outputSize <= 65539 ? 4 : 10) + maskSize;
    final WsOpcode frameType = frame.frameType();

    if (outputSize >= maxHeaderSize + (frameType.isControl() ? 0 : ws.minDataFrameBufferSize())) {
      // prepare output buffer for payload
      final int outputBase = output.index();
      final int maxPayloadBase = outputBase + maxHeaderSize;
      output = output.index(maxPayloadBase);

      // encode payload
      final Encoder<?, ?> nextContent;
      if (payloadEncoder == null) {
        nextContent = frame.payloadEncoder(ws).pull(output);
      } else {
        nextContent = payloadEncoder.pull(output);
      }
      final int payloadSize = output.index() - maxPayloadBase;
      final int headerSize = (payloadSize <= 125 ? 2 : payloadSize <= 65535 ? 4 : 10) + maskSize;

      // encode header
      final int finRsvOp;
      if (nextContent.isDone()) {
        if (offset == 0L) {
          finRsvOp = 0x80 | frameType.code;
        } else {
          finRsvOp = 0x80;
        }
      } else if (nextContent.isError()) {
        return nextContent.asError();
      } else if (offset == 0L) {
        finRsvOp = frameType.code;
      } else {
        finRsvOp = 0x00;
      }
      output = output.index(outputBase);
      if (!frameType.isControl() || (finRsvOp & 0x80) != 0) {
        // not a fragmented control frame
        payloadEncoder = nextContent;
        output = output.write(finRsvOp);
        if (payloadSize < 126) {
          output = output.write(isMasked ? 0x80 | payloadSize : payloadSize);
        } else if (payloadSize < 1 << 16) {
          output = output.write(isMasked ? 254 : 126)
                         .write(payloadSize >>> 8)
                         .write(payloadSize);
        } else {
          output = output.write(isMasked ? 255 : 127)
                         .write(0)
                         .write(0)
                         .write(0)
                         .write(0)
                         .write(payloadSize >>> 24)
                         .write(payloadSize >>> 16)
                         .write(payloadSize >>> 8)
                         .write(payloadSize);
        }

        if (isMasked) {
          // generate and encode masking key
          final byte[] maskingKey = new byte[4];
          ws.maskingKey(maskingKey);
          output = output.write(maskingKey[0] & 0xff)
                         .write(maskingKey[1] & 0xff)
                         .write(maskingKey[2] & 0xff)
                         .write(maskingKey[3] & 0xff);

          // mask payload, shifting if header smaller than anticipated
          for (int i = 0; i < payloadSize; i += 1) {
            output.set(outputBase + headerSize + i, (output.get(outputBase + maxHeaderSize + i) ^ maskingKey[i & 0x3]) & 0xff);
          }
        } else if (headerSize < maxHeaderSize) {
          // shift payload if header smaller than anticipated
          output = output.move(outputBase + maxHeaderSize, outputBase + headerSize, payloadSize);
        }
        offset += payloadSize;
        output = output.index(outputBase + headerSize + payloadSize);

        if (payloadEncoder.isDone()) {
          return Encoder.done(frame);
        }
      }
    }
    if (output.isDone()) {
      return Encoder.error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return Encoder.error(output.trap());
    }
    return new WsFrameEncoder<O>(ws, frame, payloadEncoder, offset);
  }

  static <O> Encoder<Object, WsFrame<O>> encode(OutputBuffer<?> output, WsEncoder ws, WsFrame<O> frame) {
    return WsFrameEncoder.encode(output, ws, frame, null, 0L);
  }

}
