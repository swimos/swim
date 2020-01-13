// Copyright 2015-2020 SWIM.AI inc.
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

final class VarintDecoder<V> extends Decoder<V> {

  final ProtobufDecoder<?, V> protobuf;
  final boolean signed;
  final long value;
  final int shift;

  VarintDecoder(ProtobufDecoder<?, V> protobuf, boolean signed, long value, int shift) {
    this.protobuf = protobuf;
    this.signed = signed;
    this.value = value;
    this.shift = shift;
  }

  static <V> Decoder<V> decode(InputBuffer input, ProtobufDecoder<?, V> protobuf,
                               boolean signed, long value, int shift) {
    while (input.isCont()) {
      final int b = input.head();
      if (shift < 64) {
        input = input.step();
        value |= (long) (b & 0x7f) << shift;
      } else {
        return error(new DecoderException("varint overflow"));
      }
      if ((b & 0x80) == 0) {
        if (signed) {
          value = (value >>> 1) ^ (value << 63 >> 63);
          return done(protobuf.sint(value));
        } else {
          return done(protobuf.uint(value));
        }
      }
      shift += 7;
    }
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new VarintDecoder<V>(protobuf, signed, value, shift);
  }

  static <V> Decoder<V> decode(InputBuffer input, ProtobufDecoder<?, V> protobuf) {
    return decode(input, protobuf, false, 0L, 0);
  }

  static <V> Decoder<V> decodeSigned(InputBuffer input, ProtobufDecoder<?, V> protobuf) {
    return decode(input, protobuf, true, 0L, 0);
  }

  @Override
  public Decoder<V> feed(InputBuffer input) {
    return decode(input, this.protobuf, this.signed, this.value, this.shift);
  }

}
