// Copyright 2015-2021 Swim Inc.
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

package swim.security;

import swim.codec.Decoder;
import swim.codec.InputBuffer;
import swim.util.Builder;

abstract class DerDecoder<V> {

  public abstract V integer(byte[] data);

  public abstract Builder<V, V> sequenceBuilder();

  public Decoder<V> valueDecoder() {
    return new DerValueDecoder<V>(this);
  }

  public Decoder<V> decodeValue(InputBuffer input) {
    return DerValueDecoder.decode(input, this);
  }

  public Decoder<V> decodeInteger(InputBuffer input) {
    return DerIntegerDecoder.decode(input, this);
  }

  public Decoder<V> decodeSequence(InputBuffer input) {
    return DerSequenceDecoder.decode(input, this);
  }

}
