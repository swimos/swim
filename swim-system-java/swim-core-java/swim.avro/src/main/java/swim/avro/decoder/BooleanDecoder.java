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

import swim.avro.schema.AvroBooleanType;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class BooleanDecoder<T> extends Decoder<T> {
  final AvroBooleanType<T> type;

  BooleanDecoder(AvroBooleanType<T> type) {
    this.type = type;
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return decode(input, this.type);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroBooleanType<T> type) {
    if (input.isCont()) {
      final int b = input.head();
      if (b == 0 || b == 1) {
        input = input.step();
        return done(type.cast(b != 0));
      } else {
        return error(new DecoderException("invalid boolean value: " + b));
      }
    }
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new BooleanDecoder<T>(type);
  }
}
