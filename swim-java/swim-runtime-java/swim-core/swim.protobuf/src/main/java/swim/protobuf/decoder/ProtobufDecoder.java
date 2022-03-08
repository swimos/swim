// Copyright 2015-2022 Swim.inc
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
import swim.protobuf.schema.ProtobufComplexType;
import swim.protobuf.schema.ProtobufDataType;
import swim.protobuf.schema.ProtobufFixed32Type;
import swim.protobuf.schema.ProtobufFixed64Type;
import swim.protobuf.schema.ProtobufMessageType;
import swim.protobuf.schema.ProtobufPrimitiveType;
import swim.protobuf.schema.ProtobufRepeatedType;
import swim.protobuf.schema.ProtobufStringType;
import swim.protobuf.schema.ProtobufType;
import swim.protobuf.schema.ProtobufVarintType;
import swim.protobuf.schema.ProtobufZigZagType;

public class ProtobufDecoder {

  public ProtobufDecoder() {
    // nop
  }

  public <T> Decoder<T> decodeType(InputBuffer input, ProtobufType<T> type) {
    if (type instanceof ProtobufPrimitiveType<?>) {
      return this.decodePrimitive(input, (ProtobufPrimitiveType<T>) type);
    } else if (type instanceof ProtobufComplexType<?>) {
      return this.decodeComplex(input, (ProtobufComplexType<T>) type);
    } else {
      return Decoder.error(new DecoderException("unsupported protobuf type: " + type));
    }
  }

  public <T> Decoder<T> decodePrimitive(InputBuffer input, ProtobufPrimitiveType<T> type) {
    if (type instanceof ProtobufVarintType<?>) {
      return this.decodeVarint(input, (ProtobufVarintType<T>) type);
    } else if (type instanceof ProtobufZigZagType<?>) {
      return this.decodeZigZag(input, (ProtobufZigZagType<T>) type);
    } else if (type instanceof ProtobufFixed32Type<?>) {
      return this.decodeFixed32(input, (ProtobufFixed32Type<T>) type);
    } else if (type instanceof ProtobufFixed64Type<?>) {
      return this.decodeFixed64(input, (ProtobufFixed64Type<T>) type);
    } else {
      return Decoder.error(new DecoderException("unsupported protobuf type: " + type));
    }
  }

  public <T> Decoder<T> decodeComplex(InputBuffer input, ProtobufComplexType<T> type) {
    if (type instanceof ProtobufDataType<?>) {
      return this.decodeData(input, (ProtobufDataType<T>) type);
    } else if (type instanceof ProtobufStringType<?>) {
      return this.decodeString(input, (ProtobufStringType<T>) type);
    } else if (type instanceof ProtobufMessageType<?, ?>) {
      return this.decodeMessage(input, (ProtobufMessageType<T, ?>) type);
    } else if (type instanceof ProtobufRepeatedType<?, ?>) {
      return this.decodeRepeated(input, (ProtobufRepeatedType<?, T>) type);
    } else {
      return Decoder.error(new DecoderException("unsupported protobuf type: " + type));
    }
  }

  public <T> Decoder<T> decodeVarint(InputBuffer input, ProtobufVarintType<T> type) {
    return VarintDecoder.decode(input, type);
  }

  public <T> Decoder<T> decodeZigZag(InputBuffer input, ProtobufZigZagType<T> type) {
    return ZigZagDecoder.decode(input, type);
  }

  public <T> Decoder<T> decodeFixed32(InputBuffer input, ProtobufFixed32Type<T> type) {
    return Fixed32Decoder.decode(input, type);
  }

  public <T> Decoder<T> decodeFixed64(InputBuffer input, ProtobufFixed64Type<T> type) {
    return Fixed64Decoder.decode(input, type);
  }

  public <T> Decoder<T> decodeData(InputBuffer input, ProtobufDataType<T> type) {
    return DataDecoder.decode(input, type);
  }

  public <T> Decoder<T> decodeString(InputBuffer input, ProtobufStringType<T> type) {
    return StringDecoder.decode(input, type);
  }

  public <T, M> Decoder<T> decodeMessage(InputBuffer input, ProtobufMessageType<T, M> type) {
    return MessageDecoder.decode(input, this, type, 0L);
  }

  public <T, M> Decoder<T> decodePayload(InputBuffer input, ProtobufMessageType<T, M> type) {
    return MessageDecoder.decode(input, this, type, -1L);
  }

  public <I, T> Decoder<T> decodeRepeated(InputBuffer input, ProtobufRepeatedType<I, T> type) {
    return RepeatedDecoder.decode(input, this, type);
  }

  public <T> Decoder<T> typeDecoder(ProtobufType<T> type) {
    if (type instanceof ProtobufPrimitiveType<?>) {
      return this.primitiveDecoder((ProtobufPrimitiveType<T>) type);
    } else if (type instanceof ProtobufComplexType<?>) {
      return this.complexDecoder((ProtobufComplexType<T>) type);
    } else {
      return Decoder.error(new DecoderException("unsupported protobuf type: " + type));
    }
  }

  public <T> Decoder<T> primitiveDecoder(ProtobufPrimitiveType<T> type) {
    if (type instanceof ProtobufVarintType<?>) {
      return this.varintDecoder((ProtobufVarintType<T>) type);
    } else if (type instanceof ProtobufZigZagType<?>) {
      return this.zigZagDecoder((ProtobufZigZagType<T>) type);
    } else if (type instanceof ProtobufFixed32Type<?>) {
      return this.fixed32Decoder((ProtobufFixed32Type<T>) type);
    } else if (type instanceof ProtobufFixed64Type<?>) {
      return this.fixed64Decoder((ProtobufFixed64Type<T>) type);
    } else {
      return Decoder.error(new DecoderException("unsupported protobuf type: " + type));
    }
  }

  public <T> Decoder<T> complexDecoder(ProtobufComplexType<T> type) {
    if (type instanceof ProtobufDataType<?>) {
      return this.dataDecoder((ProtobufDataType<T>) type);
    } else if (type instanceof ProtobufStringType<?>) {
      return this.stringDecoder((ProtobufStringType<T>) type);
    } else if (type instanceof ProtobufMessageType<?, ?>) {
      return this.messageDecoder((ProtobufMessageType<T, ?>) type);
    } else if (type instanceof ProtobufRepeatedType<?, ?>) {
      return this.repeatedDecoder((ProtobufRepeatedType<?, T>) type);
    } else {
      return Decoder.error(new DecoderException("unsupported protobuf type: " + type));
    }
  }

  public <T> Decoder<T> varintDecoder(ProtobufVarintType<T> type) {
    return new VarintDecoder<T>(type);
  }

  public <T> Decoder<T> zigZagDecoder(ProtobufZigZagType<T> type) {
    return new ZigZagDecoder<T>(type);
  }

  public <T> Decoder<T> fixed32Decoder(ProtobufFixed32Type<T> type) {
    return new Fixed32Decoder<T>(type);
  }

  public <T> Decoder<T> fixed64Decoder(ProtobufFixed64Type<T> type) {
    return new Fixed64Decoder<T>(type);
  }

  public <T> Decoder<T> dataDecoder(ProtobufDataType<T> type) {
    return new DataDecoder<T>(type);
  }

  public <T> Decoder<T> stringDecoder(ProtobufStringType<T> type) {
    return new StringDecoder<T>(type);
  }

  public <T, M> Decoder<T> messageDecoder(ProtobufMessageType<T, M> type) {
    return new MessageDecoder<T, M>(this, type, 0L);
  }

  public <T, M> Decoder<T> payloadDecoder(ProtobufMessageType<T, M> type) {
    return new MessageDecoder<T, M>(this, type, -1L);
  }

  public <I, T> Decoder<T> repeatedDecoder(ProtobufRepeatedType<I, T> type) {
    return new RepeatedDecoder<I, T>(this, type);
  }

}
