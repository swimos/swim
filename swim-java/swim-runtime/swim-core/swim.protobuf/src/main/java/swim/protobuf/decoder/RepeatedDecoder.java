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
import swim.protobuf.schema.ProtobufRepeatedType;
import swim.util.Builder;

final class RepeatedDecoder<I, T> extends Decoder<T> {

  final ProtobufDecoder protobuf;
  final ProtobufRepeatedType<I, T> type;
  final Builder<I, T> builder;
  final Decoder<? extends I> itemDecoder;

  RepeatedDecoder(ProtobufDecoder protobuf, ProtobufRepeatedType<I, T> type,
                  Builder<I, T> builder, Decoder<? extends I> itemDecoder) {
    this.protobuf = protobuf;
    this.type = type;
    this.builder = builder;
    this.itemDecoder = itemDecoder;
  }

  RepeatedDecoder(ProtobufDecoder protobuf, ProtobufRepeatedType<I, T> type) {
    this(protobuf, type, null, null);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return RepeatedDecoder.decode(input, this.protobuf, this.type, this.builder, this.itemDecoder);
  }

  @SuppressWarnings("unchecked")
  static <I, T> Decoder<T> decode(InputBuffer input, ProtobufDecoder protobuf,
                                  ProtobufRepeatedType<I, T> type, Builder<I, T> builder,
                                  Decoder<? extends I> itemDecoder) {
    do {
      if (input.isDone()) {
        if (builder == null) {
          builder = type.valueBuilder();
        }
        return Decoder.done(builder.bind());
      }
      if (itemDecoder == null) {
        itemDecoder = protobuf.decodeType(input, type.itemType());
      } else {
        itemDecoder = itemDecoder.feed(input);
      }
      if (itemDecoder.isDone()) {
        if (builder == null) {
          builder = type.valueBuilder();
        }
        builder.add(itemDecoder.bind());
        itemDecoder = null;
        continue;
      } else if (itemDecoder.isError()) {
        return itemDecoder.asError();
      }
      break;
    } while (true);
    if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new RepeatedDecoder<I, T>(protobuf, type, builder, itemDecoder);
  }

  static <I, T> Decoder<T> decode(InputBuffer input, ProtobufDecoder protobuf,
                                  ProtobufRepeatedType<I, T> type) {
    return RepeatedDecoder.decode(input, protobuf, type, null, null);
  }

}
