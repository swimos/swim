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
import swim.deflate.Deflate;
import swim.deflate.DeflateException;

final class WsFrameDeflater<O> extends Encoder<Object, WsFrame<O>> {

  final WsDeflateEncoder ws;
  final WsFrame<O> frame;
  final Encoder<?, ?> payloadEncoder;
  final long offset;

  WsFrameDeflater(WsDeflateEncoder ws, WsFrame<O> frame, Encoder<?, ?> payloadEncoder, long offset) {
    this.ws = ws;
    this.frame = frame;
    this.payloadEncoder = payloadEncoder;
    this.offset = offset;
  }

  WsFrameDeflater(WsDeflateEncoder ws, WsFrame<O> frame) {
    this(ws, frame, null, 0L);
  }

  @Override
  public Encoder<Object, WsFrame<O>> pull(OutputBuffer<?> output) {
    return WsFrameDeflater.encode(output, this.ws, this.frame, this.payloadEncoder, this.offset);
  }

  @SuppressWarnings("unchecked")
  static <O> Encoder<Object, WsFrame<O>> encode(OutputBuffer<?> output, WsDeflateEncoder ws,
                                                WsFrame<O> frame, Encoder<?, ?> payloadEncoder, long offset) {
    final boolean isMasked = ws.isMasked();
    final int outputSize = output.remaining();
    final int maskSize = isMasked ? 4 : 0;
    final int maxHeaderSize = (outputSize <= 127 ? 2 : outputSize <= 65539 ? 4 : 10) + maskSize;

    if (outputSize >= maxHeaderSize + ws.minDataFrameBufferSize()) {
      // prepare output buffer for payload
      final int outputBase = output.index();
      final int maxPayloadBase = outputBase + maxHeaderSize;
      if (payloadEncoder == null) {
        ((Deflate<Object>) ws.deflate).input = (Encoder<?, Object>) frame.payloadEncoder(ws);
      } else {
        ((Deflate<Object>) ws.deflate).input = (Encoder<?, Object>) payloadEncoder;
      }
      ws.deflate.next_out = output.array();
      ws.deflate.next_out_index = output.arrayOffset() + maxPayloadBase;
      ws.deflate.avail_out = outputSize - maxHeaderSize;

      try {
        // deflate payload
        final boolean needsMore = ws.deflate.deflate(ws.flush);
        payloadEncoder = ws.deflate.input;
        final boolean eof = payloadEncoder.isDone() && !needsMore;
        final int payloadSize = ws.deflate.next_out_index - (output.arrayOffset() + maxPayloadBase) - (eof ? 4 : 0);
        final int headerSize = (payloadSize <= 125 ? 2 : payloadSize <= 65535 ? 4 : 10) + maskSize;

        // encode header
        final WsOpcode frameType = frame.frameType();
        final int finRsvOp;
        if (eof) {
          if (offset == 0L) {
            finRsvOp = 0xc0 | frameType.code;
          } else {
            finRsvOp = 0x80;
          }
        } else if (payloadEncoder.isError()) {
          return payloadEncoder.asError();
        } else if (offset == 0L) {
          finRsvOp = 0x40 | frameType.code;
        } else {
          finRsvOp = 0x00;
        }
        output = output.index(outputBase);
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

        if (eof) {
          return Encoder.done(frame);
        }
      } catch (DeflateException cause) {
        return Encoder.error(new EncoderException(cause));
      } finally {
        ws.deflate.input = null;
        ws.deflate.next_out = null;
        ws.deflate.next_out_index = 0;
        ws.deflate.avail_out = 0;
      }
    }
    if (output.isDone()) {
      return Encoder.error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return Encoder.error(output.trap());
    }
    return new WsFrameDeflater<O>(ws, frame, payloadEncoder, offset);
  }

  static <O> Encoder<Object, WsFrame<O>> encode(OutputBuffer<?> output, WsDeflateEncoder ws, WsFrame<O> frame) {
    return WsFrameDeflater.encode(output, ws, frame, null, 0L);
  }

}
