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

import swim.avro.schema.AvroType;
import swim.avro.schema.AvroUnionType;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class UnionDecoder<T> extends Decoder<T> {
  final AvroDecoder avro;
  final AvroUnionType<T> type;
  final int variant;
  final int shift;

  UnionDecoder(AvroDecoder avro, AvroUnionType<T> type, int variant, int shift) {
    this.avro = avro;
    this.type = type;
    this.variant = variant;
    this.shift = shift;
  }

  UnionDecoder(AvroDecoder avro, AvroUnionType<T> type) {
    this(avro, type, 0, 0);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return decode(input, this.avro, this.type, this.variant, this.shift);
  }

  @SuppressWarnings("unchecked")
  static <T> Decoder<T> decode(InputBuffer input, AvroDecoder avro,
                               AvroUnionType<T> type, int variant, int shift) {
    while (input.isCont()) {
      final int b = input.head();
      if (shift < 32) {
        input = input.step();
        variant |= (b & 0x7f) << shift;
      } else {
        return error(new DecoderException("variant overflow"));
      }
      if ((b & 0x80) == 0) {
        variant = (variant >>> 1) ^ (variant << 31 >> 31);
        if (0 <= variant && variant < type.variantCount()) {
          final AvroType<T> variantType = (AvroType<T>) type.getVariant(variant);
          return avro.decodeType(variantType, input);
        } else {
          return error(new DecoderException("unknown union variant: " + variant));
        }
      }
      shift += 7;
    }
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new UnionDecoder<T>(avro, type, variant, shift);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroDecoder avro, AvroUnionType<T> type) {
    return decode(input, avro, type, 0, 0);
  }
}
