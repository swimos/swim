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

package swim.security;

import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class DerIntegerDecoder<V> extends Decoder<V> {

  final DerDecoder<V> der;
  final Decoder<byte[]> data;
  final int remaining;
  final int step;

  DerIntegerDecoder(DerDecoder<V> der, Decoder<byte[]> data, int remaining, int step) {
    this.der = der;
    this.data = data;
    this.remaining = remaining;
    this.step = step;
  }

  @Override
  public Decoder<V> feed(InputBuffer input) {
    return DerIntegerDecoder.decode(input, this.der, this.data, this.remaining, this.step);
  }

  static <V> Decoder<V> decode(InputBuffer input, DerDecoder<V> der,
                               Decoder<byte[]> data, int remaining, int step) {
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
    if (step == 5) {
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      if (remaining < inputRemaining) {
        input = input.limit(inputStart + remaining);
      }
      final boolean inputPart = input.isPart();
      input = input.isPart(remaining > inputRemaining);
      if (data == null) {
        data = Binary.parseOutput(input, Binary.byteArrayOutput(remaining));
      } else {
        data = data.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (data.isDone()) {
        return Decoder.done(der.integer(data.bind()));
      } else if (data.isError()) {
        return data.asError();
      }
    }
    if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new DerIntegerDecoder<V>(der, data, remaining, step);
  }

  static <V> Decoder<V> decode(InputBuffer input, DerDecoder<V> der) {
    return DerIntegerDecoder.decode(input, der, null, 0, 1);
  }

}
