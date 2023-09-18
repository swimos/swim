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

package swim.protobuf.decoder;

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.protobuf.schema.ProtobufFixed64Type;

final class Fixed64Decoder<T> extends Decoder<T> {

  final ProtobufFixed64Type<T> type;
  final long value;
  final int shift;

  Fixed64Decoder(ProtobufFixed64Type<T> type, long value, int shift) {
    this.type = type;
    this.value = value;
    this.shift = shift;
  }

  Fixed64Decoder(ProtobufFixed64Type<T> type) {
    this(type, 0L, 0);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return Fixed64Decoder.decode(input, this.type, this.value, this.shift);
  }

  static <T> Decoder<T> decode(InputBuffer input, ProtobufFixed64Type<T> type, long value, int shift) {
    while (input.isCont()) {
      value |= (long) input.head() << shift;
      input = input.step();
      shift += 8;
      if (shift == 64) {
        return Decoder.done(type.cast(value));
      }
    }
    if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new Fixed64Decoder<T>(type, value, shift);
  }

  static <T> Decoder<T> decode(InputBuffer input, ProtobufFixed64Type<T> type) {
    return Fixed64Decoder.decode(input, type, 0L, 0);
  }

}
