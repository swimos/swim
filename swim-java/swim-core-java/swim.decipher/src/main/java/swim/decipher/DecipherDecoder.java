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

package swim.decipher;

import swim.codec.Decoder;
import swim.codec.Input;
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.codec.Parser;

/**
 * Factory for constructing Format-detecting decoders.
 */
public abstract class DecipherDecoder<I, V> {
  public abstract Parser<V> xmlParser();

  public abstract Parser<V> parseXml(Input input);

  public abstract Parser<V> jsonParser();

  public abstract Parser<V> parseJson(Input input);

  public abstract Parser<V> reconParser();

  public abstract Parser<V> parseRecon(Input input);

  public abstract Decoder<V> protobufDecoder();

  public abstract Decoder<V> decodeProtobuf(InputBuffer input);

  public abstract Output<V> textOutput();

  public abstract Output<V> dataOutput();

  public Decoder<V> decodeAny(InputBuffer input) {
    return AnyDecoder.decode(input, this);
  }

  public Decoder<V> anyDecoder() {
    return new AnyDecoder<I, V>(this);
  }
}
