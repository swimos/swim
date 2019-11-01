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

import swim.avro.schema.AvroNullType;
import swim.codec.Decoder;
import swim.codec.InputBuffer;

final class NullDecoder<T> extends Decoder<T> {
  final AvroNullType<T> type;

  NullDecoder(AvroNullType<T> type) {
    this.type = type;
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return decode(input, this.type);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroNullType<T> type) {
    return done(type.cast());
  }
}
