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

package swim.protobuf.decoder;

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.protobuf.ProtobufWireType;
import swim.protobuf.schema.ProtobufFieldType;
import swim.protobuf.schema.ProtobufMessageType;

final class MessageDecoder<T, M> extends Decoder<T> {

  final ProtobufDecoder protobuf;
  final ProtobufMessageType<T, M> type;
  final long size;
  final M message;
  final ProtobufFieldType<?, M> fieldType;
  final Decoder<?> valueDecoder;
  final long tag;
  final int shift;
  final int step;

  MessageDecoder(ProtobufDecoder protobuf, ProtobufMessageType<T, M> type, long size,
                 M message, ProtobufFieldType<?, M> fieldType, Decoder<?> valueDecoder,
                 long tag, int shift, int step) {
    this.protobuf = protobuf;
    this.type = type;
    this.size = size;
    this.message = message;
    this.fieldType = fieldType;
    this.valueDecoder = valueDecoder;
    this.tag = tag;
    this.shift = shift;
    this.step = step;
  }

  MessageDecoder(ProtobufDecoder protobuf, ProtobufMessageType<T, M> type, long size) {
    this(protobuf, type, size, null, null, null, 0L, 0, size >= 0 ? 1 : 2);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return MessageDecoder.decode(input, this.protobuf, this.type, this.size, this.message,
                                 this.fieldType, this.valueDecoder, this.tag, this.shift, this.step);
  }

  @SuppressWarnings("unchecked")
  static <T, M> Decoder<T> decode(InputBuffer input, ProtobufDecoder protobuf,
                                  ProtobufMessageType<T, M> type, long size,
                                  M message, ProtobufFieldType<?, M> fieldType,
                                  Decoder<?> valueDecoder, long tag, int shift, int step) {
    if (step == 1) {
      while (input.isCont()) {
        final int b = input.head();
        if (shift < 64) {
          input = input.step();
          size |= (long) (b & 0x7f) << shift;
        } else {
          return Decoder.error(new DecoderException("varint overflow"));
        }
        if ((b & 0x80) == 0) {
          shift = 0;
          step = 2;
          break;
        } else {
          shift += 7;
        }
      }
    }

    final int inputStart = input.index();
    final int inputLimit = input.limit();
    final int inputRemaining = inputLimit - inputStart;
    final boolean inputPart = input.isPart();
    try {
      if (step > 1 && size >= 0) {
        if (size < inputRemaining) {
          input.limit(inputStart + (int) size);
        }
        if (size <= inputRemaining) {
          input = input.isPart(false);
        }
      }
      do {
        if (step == 2) {
          if (input.isDone()) {
            if (message == null) {
              message = type.create();
            }
            return Decoder.done(type.cast(message));
          }
          while (input.isCont()) {
            final int b = input.head();
            if (shift < 64) {
              input = input.step();
              tag |= (long) (b & 0x7f) << shift;
            } else {
              return Decoder.error(new DecoderException("varint overflow"));
            }
            if ((b & 0x80) == 0) {
              shift = 0;
              final ProtobufWireType wireType = ProtobufWireType.from((int) tag & 0x7);
              final long fieldNumber = tag >>> 3;
              fieldType = type.getField(fieldNumber);
              if (fieldType != null) {
                if (wireType.isSized() && fieldType.valueType().wireType().isPrimitive()) {
                  fieldType = fieldType.packedType();
                  if (fieldType == null) {
                    return Decoder.error(new DecoderException("unsupported packed field: " + fieldNumber));
                  }
                }
                step = 3;
                break;
              } else {
                return Decoder.error(new DecoderException("unknown field: " + fieldNumber));
              }
            } else {
              shift += 7;
            }
          }
        }
        if (step == 3) {
          if (valueDecoder == null) {
            valueDecoder = protobuf.decodeType(input, fieldType.valueType());
          } else {
            valueDecoder = valueDecoder.feed(input);
          }
          if (valueDecoder.isDone()) {
            if (message == null) {
              message = type.create();
            }
            message = ((ProtobufFieldType<Object, M>) fieldType).updated(message, valueDecoder.bind());
            fieldType = null;
            valueDecoder = null;
            tag = 0L;
            step = 2;
            continue;
          } else if (valueDecoder.isError()) {
            return valueDecoder.asError();
          }
        }
        break;
      } while (true);
    } finally {
      input = input.limit(inputLimit).isPart(inputPart);
      size -= input.index() - inputStart;
    }
    if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new MessageDecoder<T, M>(protobuf, type, size, message, fieldType,
                                    valueDecoder, tag, shift, step);
  }

  static <T, M> Decoder<T> decode(InputBuffer input, ProtobufDecoder protobuf,
                                  ProtobufMessageType<T, M> type, long size) {
    return MessageDecoder.decode(input, protobuf, type, size, null, null, null, 0L, 0, size >= 0 ? 1 : 2);
  }

}
