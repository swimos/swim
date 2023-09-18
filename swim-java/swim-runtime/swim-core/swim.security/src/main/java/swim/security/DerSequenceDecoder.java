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

package swim.security;

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.util.Builder;

final class DerSequenceDecoder<V> extends Decoder<V> {

  final DerDecoder<V> der;
  final Builder<V, V> sequence;
  final Decoder<V> element;
  final int remaining;
  final int step;

  DerSequenceDecoder(DerDecoder<V> der, Builder<V, V> sequence,
                     Decoder<V> element, int remaining, int step) {
    this.der = der;
    this.sequence = sequence;
    this.element = element;
    this.remaining = remaining;
    this.step = step;
  }

  @Override
  public Decoder<V> feed(InputBuffer input) {
    return DerSequenceDecoder.decode(input, this.der, this.sequence,
                                     this.element, this.remaining, this.step);
  }

  static <V> Decoder<V> decode(InputBuffer input, DerDecoder<V> der, Builder<V, V> sequence,
                               Decoder<V> element, int remaining, int step) {
    int b;
    if (step == 1 && input.isCont()) {
      b = input.head();
      input = input.step();
      if (b < 128) {
        remaining = b;
        step = 5;
      } else {
        step = 5 - (b & 0x7f);
        if (step < 2) {
          return Decoder.error(new DecoderException("length overflow"));
        } else if (step > 4) {
          return Decoder.error(new DecoderException("length underflow"));
        }
      }
    }
    while (step >= 2 && step <= 4 && input.isCont()) {
      b = input.head();
      input = input.step();
      remaining = remaining << 8 | b;
      step += 1;
    }
    while (step == 5 && remaining > 0 && input.isCont()) {
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      if (remaining < inputRemaining) {
        input = input.limit(inputStart + remaining);
      }
      final boolean inputPart = input.isPart();
      input = input.isPart(remaining > inputRemaining);
      if (element == null) {
        element = der.decodeValue(input);
      } else {
        element = element.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (element.isDone()) {
        if (sequence == null) {
          sequence = der.sequenceBuilder();
        }
        sequence.add(element.bind());
        element = null;
        if (remaining == 0) {
          step = 6;
          break;
        }
      } else if (element.isError()) {
        return element.asError();
      }
    }
    if (step == 6 && remaining == 0) {
      return Decoder.done(sequence.bind());
    }
    if (remaining < 0) {
      return Decoder.error(new DecoderException("length too short"));
    } else if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new DerSequenceDecoder<V>(der, sequence, element, remaining, step);
  }

  static <V> Decoder<V> decode(InputBuffer input, DerDecoder<V> der) {
    return DerSequenceDecoder.decode(input, der, null, null, 0, 1);
  }

}
