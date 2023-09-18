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

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class WsFrameDecoder<O> extends Decoder<WsFrame<O>> {

  final WsDecoder ws;
  final WsOpcode frameType;
  final Decoder<O> payloadDecoder;
  final int finRsvOp;
  final long offset;
  final long length;
  final byte[] maskingKey;
  final int position;
  final int step;

  WsFrameDecoder(WsDecoder ws, WsOpcode frameType, Decoder<O> payloadDecoder, int finRsvOp,
                 long offset, long length, byte[] maskingKey, int position, int step) {
    this.ws = ws;
    this.frameType = frameType;
    this.payloadDecoder = payloadDecoder;
    this.finRsvOp = finRsvOp;
    this.offset = offset;
    this.length = length;
    this.maskingKey = maskingKey;
    this.position = position;
    this.step = step;
  }

  WsFrameDecoder(WsDecoder ws, WsOpcode frameType, Decoder<O> payloadDecoder) {
    this(ws, frameType, payloadDecoder, 0, 0L, 0L, null, 0, 1);
  }

  @Override
  public Decoder<WsFrame<O>> feed(InputBuffer input) {
    return WsFrameDecoder.decode(input, this.ws, this.frameType, this.payloadDecoder, this.finRsvOp,
                                 this.offset, this.length, this.maskingKey, this.position, this.step);
  }

  static <O> Decoder<WsFrame<O>> decode(InputBuffer input, WsDecoder ws, WsOpcode frameType,
                                        Decoder<O> payloadDecoder, int finRsvOp, long offset,
                                        long length, byte[] maskingKey, int position, int step) {
    if (step == 1 && input.isCont()) { // decode finRsvOp
      finRsvOp = input.head();
      input = input.step();
      if (frameType == null) {
        frameType = WsOpcode.from(finRsvOp & 0xf);
      }
      step = 2;
    }
    if (step == 2 && input.isCont()) { // decode maskLength
      final int maskLength = input.head();
      input = input.step();
      if ((maskLength & 0x80) != 0) {
        maskingKey = new byte[4];
      }
      final int len = maskLength & 0x7f;
      if (len == 126) { // short length
        step = 3;
      } else if (len == 127) { // long length
        step = 5;
      } else {
        length = (long) len;
        step = maskingKey != null ? 13 : 17;
      }
    }
    if (step >= 3 && step <= 4) { // decode short length
      while (input.isCont()) {
        length = (length << 8) | (long) input.head();
        input = input.step();
        if (step < 4) {
          step += 1;
        } else {
          step = maskingKey != null ? 13 : 17;
          break;
        }
      }
    }
    if (step >= 5 && step <= 12) { // decode long length
      while (input.isCont()) {
        length = (length << 8) | (long) input.head();
        input = input.step();
        if (step < 12) {
          step += 1;
        } else {
          step = maskingKey != null ? 13 : 17;
          break;
        }
      }
    }
    if (step >= 13 && step <= 16) { // decode masking key
      while (input.isCont()) {
        maskingKey[step - 13] = (byte) input.head();
        input = input.step();
        if (step < 16) {
          step += 1;
        } else {
          step = 17;
          break;
        }
      }
    }
    if (step == 17) { // decode payload
      final int base = input.index();
      final int size = (int) Math.min(length - offset, input.remaining());
      if (maskingKey != null) {
        for (int i = 0; i < size; i += 1) {
          input.set(base + i, (input.get(base + i) ^ maskingKey[position + i & 0x3]) & 0xff);
        }
      }
      offset += size;
      position += size;

      final boolean eof = offset == length && (finRsvOp & 0x80) != 0;
      final boolean inputPart = input.isPart();
      input = input.isPart(!eof);
      if (input.remaining() < size) {
        payloadDecoder = payloadDecoder.feed(input);
      } else {
        final int inputLimit = input.limit();
        input = input.limit(base + size);
        payloadDecoder = payloadDecoder.feed(input);
        input = input.limit(inputLimit);
      }
      input = input.isPart(inputPart);

      if (payloadDecoder.isError()) {
        return payloadDecoder.asError();
      } else if (input.index() != base + size) {
        return Decoder.error(new DecoderException("WsFrameDecoder undecoded websocket data"));
      } else if (payloadDecoder.isDone()) {
        if (offset == length) {
          if ((finRsvOp & 0x80) != 0) {
            if (frameType.code < 0x8) { // decoded data frame
              return Decoder.done(ws.dataFrame(frameType, payloadDecoder.bind()));
            } else { // decoded control frame
              return Decoder.done(ws.controlFrame(frameType, payloadDecoder.bind()));
            }
          } else {
            return Decoder.error(new DecoderException("decoded unfinished websocket message"));
          }
        } else {
          return Decoder.error(new DecoderException("decoded incomplete websocket frame"));
        }
      } else if (offset == length) {
        if ((finRsvOp & 0x80) == 0) {
          if ((finRsvOp & 0xf) < 0x8) { // decoded fragment
            return Decoder.done(ws.fragmentFrame(frameType, payloadDecoder));
          } else {
            return Decoder.error(new DecoderException("decoded fragmented control frame"));
          }
        } else {
          return Decoder.error(new DecoderException("undecoded websocket message"));
        }
      }
    }
    if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new WsFrameDecoder<O>(ws, frameType, payloadDecoder, finRsvOp,
                                 offset, length, maskingKey, position, step);
  }

  static <O> Decoder<WsFrame<O>> decode(InputBuffer input, WsDecoder ws,
                                        WsOpcode frameType, Decoder<O> payloadDecoder) {
    return WsFrameDecoder.decode(input, ws, frameType, payloadDecoder, 0, 0L, 0L, null, 0, 1);
  }

}
