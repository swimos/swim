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

final class FieldDecoder<I, V> extends Decoder<I> {
  final ProtobufDecoder<I, V> protobuf;
  final Decoder<V> payloadDecoder;
  final Decoder<V> valueDecoder;
  final long tag;
  final int tagShift;
  final int step;

  FieldDecoder(ProtobufDecoder<I, V> protobuf, Decoder<V> payloadDecoder,
               Decoder<V> valueDecoder, long tag, int tagShift, int step) {
    this.protobuf = protobuf;
    this.payloadDecoder = payloadDecoder;
    this.tag = tag;
    this.tagShift = tagShift;
    this.valueDecoder = valueDecoder;
    this.step = step;
  }

  @Override
  public Decoder<I> feed(InputBuffer input) {
    return decode(input, this.protobuf, this.payloadDecoder, this.valueDecoder,
                  this.tag, this.tagShift, this.step);
  }

  static <I, V> Decoder<I> decode(InputBuffer input, ProtobufDecoder<I, V> protobuf,
                                  Decoder<V> payloadDecoder, Decoder<V> valueDecoder,
                                  long tag, int tagShift, int step) {
    if (step == 1) {
      while (input.isCont()) {
        final int b = input.head();
        if (tagShift < 64) {
          input = input.step();
          tag |= (long) (b & 0x7f) << tagShift;
        } else {
          return error(new DecoderException("varint overflow"));
        }
        if ((b & 0x80) == 0) {
          step = 2;
          break;
        }
        tagShift += 7;
      }
    }
    if (step == 2) {
      if (valueDecoder == null) {
        final WireType wireType = WireType.apply((int) tag & 0x7);
        valueDecoder = protobuf.decodeValue(wireType, payloadDecoder, input);
      } else {
        valueDecoder = valueDecoder.feed(input);
      }
      if (valueDecoder.isDone()) {
        return done(protobuf.field(tag >>> 3, valueDecoder.bind()));
      } else if (valueDecoder.isError()) {
        return valueDecoder.asError();
      }
    }
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new FieldDecoder<I, V>(protobuf, payloadDecoder, valueDecoder, tag, tagShift, step);
  }

  static <I, V> Decoder<I> decode(InputBuffer input, ProtobufDecoder<I, V> protobuf,
                                  Decoder<V> payloadDecoder) {
    return decode(input, protobuf, payloadDecoder, null, 0L, 0, 1);
  }
}
