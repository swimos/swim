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

package swim.avro.decoder;

import swim.avro.schema.AvroFloatType;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class FloatDecoder<T> extends Decoder<T> {
  final AvroFloatType<T> type;
  final int value;
  final int shift;

  FloatDecoder(AvroFloatType<T> type, int value, int shift) {
    this.type = type;
    this.value = value;
    this.shift = shift;
  }

  FloatDecoder(AvroFloatType<T> type) {
    this(type, 0, 0);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return decode(input, this.type, this.value, this.shift);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroFloatType<T> type,
                               int value, int shift) {
    while (input.isCont()) {
      value |= input.head() << shift;
      input = input.step();
      shift += 8;
      if (shift == 32) {
        return done(type.cast(Float.intBitsToFloat(value)));
      }
    }
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new FloatDecoder<T>(type, value, shift);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroFloatType<T> type) {
    return decode(input, type, 0, 0);
  }
}
