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

final class MessageDecoder<I, V> extends Decoder<V> {
  final ProtobufDecoder<I, V> protobuf;
  final Decoder<V> payloadDecoder;
  final Decoder<I> fieldDecoder;
  final Builder<I, V> builder;

  MessageDecoder(ProtobufDecoder<I, V> protobuf, Decoder<V> payloadDecoder,
                 Decoder<I> fieldDecoder, Builder<I, V> builder) {
    this.protobuf = protobuf;
    this.payloadDecoder = payloadDecoder;
    this.fieldDecoder = fieldDecoder;
    this.builder = builder;
  }

  @Override
  public Decoder<V> feed(InputBuffer input) {
    return decode(input, this.protobuf, this.payloadDecoder, this.fieldDecoder, this.builder);
  }

  static <I, V> Decoder<V> decode(InputBuffer input, ProtobufDecoder<I, V> protobuf,
                                  Decoder<V> payloadDecoder, Decoder<I> fieldDecoder,
                                  Builder<I, V> builder) {
    while (input.isCont()) {
      if (fieldDecoder == null) {
        fieldDecoder = protobuf.decodeField(payloadDecoder, input);
      } else {
        fieldDecoder = fieldDecoder.feed(input);
      }
      if (fieldDecoder.isDone()) {
        if (builder == null) {
          builder = protobuf.messageBuilder();
        }
        builder.add(fieldDecoder.bind());
        fieldDecoder = null;
      } else if (fieldDecoder.isError()) {
        return fieldDecoder.asError();
      }
    }
    if (input.isDone()) {
      if (fieldDecoder == null) {
        if (builder == null) {
          builder = protobuf.messageBuilder();
        }
        return done(builder.bind());
      } else {
        return error(new DecoderException("incomplete"));
      }
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new MessageDecoder<I, V>(protobuf, payloadDecoder, fieldDecoder, builder);
  }

  static <I, V> Decoder<V> decode(InputBuffer input, ProtobufDecoder<I, V> protobuf,
                                  Decoder<V> payloadDecoder) {
    return decode(input, protobuf, payloadDecoder, null, null);
  }
}
