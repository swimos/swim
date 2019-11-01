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

final class Fixed64Decoder<V> extends Decoder<V> {
  final ProtobufDecoder<?, V> protobuf;
  final long value;
  final int shift;

  Fixed64Decoder(ProtobufDecoder<?, V> protobuf, long value, int shift) {
    this.protobuf = protobuf;
    this.value = value;
    this.shift = shift;
  }

  @Override
  public Decoder<V> feed(InputBuffer input) {
    return decode(input, this.protobuf, this.value, this.shift);
  }

  static <V> Decoder<V> decode(InputBuffer input, ProtobufDecoder<?, V> protobuf,
                               long value, int shift) {
    while (input.isCont()) {
      value |= (long) input.head() << shift;
      input = input.step();
      shift += 8;
      if (shift == 64) {
        return done(protobuf.fixed(value));
      }
    }
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new Fixed64Decoder<V>(protobuf, value, shift);
  }

  static <V> Decoder<V> decode(InputBuffer input, ProtobufDecoder<?, V> protobuf) {
    return decode(input, protobuf, 0L, 0);
  }
}
