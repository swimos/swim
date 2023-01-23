// Copyright 2015-2023 Swim.inc
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
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class DerValueDecoder<V> extends Decoder<V> {

  final DerDecoder<V> der;

  DerValueDecoder(DerDecoder<V> der) {
    this.der = der;
  }

  @Override
  public Decoder<V> feed(InputBuffer input) {
    return DerValueDecoder.decode(input, this.der);
  }

  static <V> Decoder<V> decode(InputBuffer input, DerDecoder<V> der) {
    if (input.isCont()) {
      final int tag = input.head();
      input = input.step();
      switch (tag) {
        case 0x02: return der.decodeInteger(input);
        case 0x30: return der.decodeSequence(input);
        default: return Decoder.error(new DecoderException("Unsupported DER tag: 0x" + Integer.toHexString(tag)));
      }
    }
    if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new DerValueDecoder<V>(der);
  }

}
