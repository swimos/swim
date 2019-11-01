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

import swim.avro.schema.AvroEnumType;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class EnumDecoder<T> extends Decoder<T> {
  final AvroEnumType<T> type;
  final int ordinal;
  final int shift;

  EnumDecoder(AvroEnumType<T> type, int ordinal, int shift) {
    this.type = type;
    this.ordinal = ordinal;
    this.shift = shift;
  }

  EnumDecoder(AvroEnumType<T> type) {
    this(type, 0, 0);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return decode(input, this.type, this.ordinal, this.shift);
  }

  @SuppressWarnings("unchecked")
  static <T> Decoder<T> decode(InputBuffer input, AvroEnumType<T> type, int ordinal, int shift) {
    while (input.isCont()) {
      final int b = input.head();
      if (shift < 32) {
        input = input.step();
        ordinal |= (b & 0x7f) << shift;
      } else {
        return error(new DecoderException("ordinal overflow"));
      }
      if ((b & 0x80) == 0) {
        ordinal = (ordinal >>> 1) ^ (ordinal << 31 >> 31);
        return done(type.cast(ordinal));
      }
      shift += 7;
    }
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new EnumDecoder<T>(type, ordinal, shift);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroEnumType<T> type) {
    return decode(input, type, 0, 0);
  }
}
