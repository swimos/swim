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

import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.codec.Utf8;
import swim.codec.UtfErrorMode;
import swim.util.Builder;

public abstract class ProtobufDecoder<I, V> {
  public abstract I item(V value);

  public abstract V value(I item);

  public abstract I field(long key, V value);

  public abstract V uint(long value);

  public abstract V sint(long value);

  public abstract V fixed(int value);

  public abstract V fixed(long value);

  public abstract Builder<I, V> messageBuilder();

  public abstract Output<V> dataOutput();

  public abstract Output<V> textOutput();

  public Decoder<V> decodeValue(WireType wireType, Decoder<V> payloadDecoder, InputBuffer input) {
    switch (wireType.code) {
      case 0: return decodeVarint(input);
      case 1: return decodeFixed64(input);
      case 2: return decodeSized(payloadDecoder, input);
      case 5: return decodeFixed32(input);
      default: return Decoder.error(new DecoderException("unsupported wire type: " + wireType.name()));
    }
  }

  public Decoder<V> decodeValue(WireType wireType, InputBuffer input) {
    switch (wireType.code) {
      case 0: return decodeVarint(input);
      case 1: return decodeFixed64(input);
      case 2: return decodeSized(payloadDecoder(), input);
      case 5: return decodeFixed32(input);
      default: return Decoder.error(new DecoderException("unsupported wire type: " + wireType.name()));
    }
  }

  public Decoder<V> decodeVarint(InputBuffer input) {
    return VarintDecoder.decode(input, this);
  }

  public Decoder<V> decodeSignedVarint(InputBuffer input) {
    return VarintDecoder.decodeSigned(input, this);
  }

  public Decoder<V> decodeFixed64(InputBuffer input) {
    return Fixed64Decoder.decode(input, this);
  }

  public Decoder<V> decodeSized(Decoder<V> payloadDecoder, InputBuffer input) {
    return SizedDecoder.decode(input, payloadDecoder);
  }

  public Decoder<V> decodeSized(InputBuffer input) {
    return decodeSized(payloadDecoder(), input);
  }

  public Decoder<V> decodeFixed32(InputBuffer input) {
    return Fixed32Decoder.decode(input, this);
  }

  public Decoder<I> decodeField(Decoder<V> payloadDecoder, InputBuffer input) {
    return FieldDecoder.decode(input, this, payloadDecoder);
  }

  public Decoder<V> decodeMessage(Decoder<V> payloadDecoder, InputBuffer input) {
    return MessageDecoder.decode(input, this, payloadDecoder);
  }

  public Decoder<V> decodeMessage(InputBuffer input) {
    return decodeMessage(payloadDecoder(), input);
  }

  public Decoder<V> decodePacked(WireType wireType, InputBuffer input) {
    return PackedDecoder.decode(input, this, wireType);
  }

  public Decoder<V> decodeText(InputBuffer input) {
    return Utf8.decodeOutput(textOutput(), input, UtfErrorMode.fatalNonZero());
  }

  public Decoder<V> decodeData(InputBuffer input) {
    return Binary.parseOutput(dataOutput(), input);
  }

  public Decoder<V> decodePayload(InputBuffer input) {
    return PayloadDecoder.decode(input, this);
  }

  public Decoder<V> payloadDecoder() {
    return new PayloadDecoder<V>(this);
  }
}
