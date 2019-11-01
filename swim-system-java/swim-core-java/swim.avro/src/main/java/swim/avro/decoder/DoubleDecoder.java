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

import swim.avro.schema.AvroDoubleType;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class DoubleDecoder<T> extends Decoder<T> {
  final AvroDoubleType<T> type;
  final long value;
  final int shift;

  DoubleDecoder(AvroDoubleType<T> type, long value, int shift) {
    this.type = type;
    this.value = value;
    this.shift = shift;
  }

  DoubleDecoder(AvroDoubleType<T> type) {
    this(type, 0L, 0);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return decode(input, this.type, this.value, this.shift);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroDoubleType<T> type,
                               long value, int shift) {
    while (input.isCont()) {
      value |= (long) input.head() << shift;
      input = input.step();
      shift += 8;
      if (shift == 64) {
        return done(type.cast(Double.longBitsToDouble(value)));
      }
    }
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new DoubleDecoder<T>(type, value, shift);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroDoubleType<T> type) {
    return decode(input, type, 0L, 0);
  }
}
