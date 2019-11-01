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

import swim.avro.schema.AvroVarintType;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class VarintDecoder<T> extends Decoder<T> {
  final AvroVarintType<T> type;
  final long value;
  final int shift;

  VarintDecoder(AvroVarintType<T> type, long value, int shift) {
    this.type = type;
    this.value = value;
    this.shift = shift;
  }

  VarintDecoder(AvroVarintType<T> type) {
    this(type, 0L, 0);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return decode(input, this.type, this.value, this.shift);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroVarintType<T> type,
                               long value, int shift) {
    while (input.isCont()) {
      final int b = input.head();
      if (shift < 64) {
        input = input.step();
        value |= (long) (b & 0x7f) << shift;
      } else {
        return error(new DecoderException("varint overflow"));
      }
      if ((b & 0x80) == 0) {
        value = (value >>> 1) ^ (value << 63 >> 63);
        return done(type.cast(value));
      }
      shift += 7;
    }
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new VarintDecoder<T>(type, value, shift);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroVarintType<T> type) {
    return decode(input, type, 0L, 0);
  }
}
