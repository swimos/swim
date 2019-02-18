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
import swim.util.Builder;

final class PackedDecoder<I, V> extends Decoder<V> {
  final ProtobufDecoder<I, V> protobuf;
  final WireType wireType;
  final Decoder<V> valueDecoder;
  final Builder<I, V> builder;

  PackedDecoder(ProtobufDecoder<I, V> protobuf, WireType wireType,
                Decoder<V> valueDecoder, Builder<I, V> builder) {
    this.protobuf = protobuf;
    this.wireType = wireType;
    this.valueDecoder = valueDecoder;
    this.builder = builder;
  }

  @Override
  public Decoder<V> feed(InputBuffer input) {
    return decode(input, this.protobuf, this.wireType, this.valueDecoder, this.builder);
  }

  static <I, V> Decoder<V> decode(InputBuffer input, ProtobufDecoder<I, V> protobuf,
                                  WireType wireType, Decoder<V> valueDecoder, Builder<I, V> builder) {
    while (input.isCont()) {
      if (valueDecoder == null) {
        valueDecoder = protobuf.decodeValue(wireType, input);
      } else {
        valueDecoder = valueDecoder.feed(input);
      }
      if (valueDecoder.isDone()) {
        if (builder == null) {
          builder = protobuf.messageBuilder();
        }
        builder.add(protobuf.item(valueDecoder.bind()));
        valueDecoder = null;
      } else if (valueDecoder.isError()) {
        return valueDecoder.asError();
      }
    }
    if (input.isDone()) {
      if (valueDecoder == null) {
        if (builder == null) {
          builder = protobuf.messageBuilder();
        }
        return done(builder.bind());
      } else {
        return error(new DecoderException("incomplete"));
      }
    }
    return new PackedDecoder<I, V>(protobuf, wireType, valueDecoder, builder);
  }

  static <I, V> Decoder<V> decode(InputBuffer input, ProtobufDecoder<I, V> protobuf,
                                  WireType wireType) {
    return decode(input, protobuf, wireType, null, null);
  }
}
