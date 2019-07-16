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

package swim.protobuf;

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class SizedDecoder<V> extends Decoder<V> {
  final Decoder<V> payloadDecoder;
  final long length;
  final int lengthShift;
  final int step;

  SizedDecoder(Decoder<V> payloadDecoder, long length, int lengthShift, int step) {
    this.payloadDecoder = payloadDecoder;
    this.length = length;
    this.lengthShift = lengthShift;
    this.step = step;
  }

  @Override
  public Decoder<V> feed(InputBuffer input) {
    return decode(input, this.payloadDecoder, this.length, this.lengthShift, this.step);
  }

  static <V> Decoder<V> decode(InputBuffer input, Decoder<V> payloadDecoder,
                               long length, int lengthShift, int step) {
    if (step == 1) {
      while (input.isCont()) {
        final int b = input.head();
        if (lengthShift < 64) {
          input = input.step();
          length |= (long) (b & 0x7f) << lengthShift;
        } else {
          return error(new DecoderException("varint overflow"));
        }
        if ((b & 0x80) == 0) {
          step = 2;
          break;
        }
        lengthShift += 7;
      }
    }
    if (step == 2) {
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      final boolean inputPart = input.isPart();
      if (length < inputRemaining) {
        input.limit(inputStart + (int) length);
      }
      if (length <= inputRemaining) {
        input = input.isPart(false);
      }
      payloadDecoder = payloadDecoder.feed(input);
      input = input.limit(inputLimit).isPart(inputPart);
      length -= input.index() - inputStart;
      if (payloadDecoder.isDone()) {
        if (length == 0L) {
          return payloadDecoder;
        } else {
          return error(new DecoderException("unconsumed input"));
        }
      } else if (payloadDecoder.isError()) {
        return payloadDecoder.asError();
      }
    }
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new SizedDecoder<V>(payloadDecoder, length, lengthShift, step);
  }

  static <V> Decoder<V> decode(InputBuffer input, Decoder<V> payloadDecoder) {
    return decode(input, payloadDecoder, 0L, 0, 1);
  }
}
