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

package swim.avro.decoder;

import swim.avro.schema.AvroArrayType;
import swim.avro.schema.AvroBooleanType;
import swim.avro.schema.AvroComplexType;
import swim.avro.schema.AvroDataType;
import swim.avro.schema.AvroDoubleType;
import swim.avro.schema.AvroEnumType;
import swim.avro.schema.AvroFixedType;
import swim.avro.schema.AvroFloatType;
import swim.avro.schema.AvroMapType;
import swim.avro.schema.AvroNullType;
import swim.avro.schema.AvroPrimitiveType;
import swim.avro.schema.AvroRecordType;
import swim.avro.schema.AvroStringType;
import swim.avro.schema.AvroType;
import swim.avro.schema.AvroUnionType;
import swim.avro.schema.AvroVarintType;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

public class AvroDecoder {
  public <T> Decoder<T> decodeType(AvroType<T> type, InputBuffer input) {
    if (type instanceof AvroPrimitiveType<?>) {
      return decodePrimitive((AvroPrimitiveType<T>) type, input);
    } else if (type instanceof AvroComplexType<?>) {
      return decodeComplex((AvroComplexType<T>) type, input);
    } else {
      return Decoder.error(new DecoderException("unsupported avro type: " + type));
    }
  }

  public <T> Decoder<T> decodePrimitive(AvroPrimitiveType<T> type, InputBuffer input) {
    if (type instanceof AvroNullType<?>) {
      return decodeNull((AvroNullType<T>) type, input);
    } else if (type instanceof AvroBooleanType<?>) {
      return decodeBoolean((AvroBooleanType<T>) type, input);
    } else if (type instanceof AvroVarintType<?>) {
      return decodeVarint((AvroVarintType<T>) type, input);
    } else if (type instanceof AvroFloatType<?>) {
      return decodeFloat((AvroFloatType<T>) type, input);
    } else if (type instanceof AvroDoubleType<?>) {
      return decodeDouble((AvroDoubleType<T>) type, input);
    } else if (type instanceof AvroDataType<?>) {
      return decodeData((AvroDataType<T>) type, input);
    } else if (type instanceof AvroStringType<?>) {
      return decodeString((AvroStringType<T>) type, input);
    } else {
      return Decoder.error(new DecoderException("unsupported avro type: " + type));
    }
  }

  public <T> Decoder<T> decodeComplex(AvroComplexType<T> type, InputBuffer input) {
    if (type instanceof AvroRecordType<?, ?>) {
      return decodeRecord((AvroRecordType<T, ?>) type, input);
    } else if (type instanceof AvroEnumType<?>) {
      return decodeEnum((AvroEnumType<T>) type, input);
    } else if (type instanceof AvroArrayType<?, ?>) {
      return decodeArray((AvroArrayType<?, T>) type, input);
    } else if (type instanceof AvroMapType<?, ?, ?>) {
      return decodeMap((AvroMapType<?, ?, T>) type, input);
    } else if (type instanceof AvroUnionType<?>) {
      return decodeUnion((AvroUnionType<T>) type, input);
    } else if (type instanceof AvroFixedType<?>) {
      return decodeFixed((AvroFixedType<T>) type, input);
    } else {
      return Decoder.error(new DecoderException("unsupported avro type: " + type));
    }
  }

  public <T> Decoder<T> decodeNull(AvroNullType<T> type, InputBuffer input) {
    return NullDecoder.decode(input, type);
  }

  public <T> Decoder<T> decodeBoolean(AvroBooleanType<T> type, InputBuffer input) {
    return BooleanDecoder.decode(input, type);
  }

  public <T> Decoder<T> decodeVarint(AvroVarintType<T> type, InputBuffer input) {
    return VarintDecoder.decode(input, type);
  }

  public <T> Decoder<T> decodeFloat(AvroFloatType<T> type, InputBuffer input) {
    return FloatDecoder.decode(input, type);
  }

  public <T> Decoder<T> decodeDouble(AvroDoubleType<T> type, InputBuffer input) {
    return DoubleDecoder.decode(input, type);
  }

  public <T> Decoder<T> decodeData(AvroDataType<T> type, InputBuffer input) {
    return DataDecoder.decode(input, type);
  }

  public <T> Decoder<T> decodeString(AvroStringType<T> type, InputBuffer input) {
    return StringDecoder.decode(input, type);
  }

  public <T, R> Decoder<T> decodeRecord(AvroRecordType<T, R> type, InputBuffer input) {
    return RecordDecoder.decode(input, this, type);
  }

  public <T> Decoder<T> decodeEnum(AvroEnumType<T> type, InputBuffer input) {
    return EnumDecoder.decode(input, type);
  }

  public <I, T> Decoder<T> decodeArray(AvroArrayType<I, T> type, InputBuffer input) {
    return ArrayDecoder.decode(input, this, type);
  }

  public <K, V, T> Decoder<T> decodeMap(AvroMapType<K, V, T> type, InputBuffer input) {
    return MapDecoder.decode(input, this, type);
  }

  public <T> Decoder<T> decodeUnion(AvroUnionType<T> type, InputBuffer input) {
    return UnionDecoder.decode(input, this, type);
  }

  public <T> Decoder<T> decodeFixed(AvroFixedType<T> type, InputBuffer input) {
    return FixedDecoder.decode(input, type);
  }

  public <T> Decoder<T> typeDecoder(AvroType<T> type) {
    if (type instanceof AvroPrimitiveType<?>) {
      return primitiveDecoder((AvroPrimitiveType<T>) type);
    } else if (type instanceof AvroComplexType<?>) {
      return complexDecoder((AvroComplexType<T>) type);
    } else {
      return Decoder.error(new DecoderException("unsupported avro type: " + type));
    }
  }

  public <T> Decoder<T> primitiveDecoder(AvroPrimitiveType<T> type) {
    if (type instanceof AvroNullType<?>) {
      return nullDecoder((AvroNullType<T>) type);
    } else if (type instanceof AvroBooleanType<?>) {
      return booleanDecoder((AvroBooleanType<T>) type);
    } else if (type instanceof AvroVarintType<?>) {
      return varintDecoder((AvroVarintType<T>) type);
    } else if (type instanceof AvroFloatType<?>) {
      return floatDecoder((AvroFloatType<T>) type);
    } else if (type instanceof AvroDoubleType<?>) {
      return doubleDecoder((AvroDoubleType<T>) type);
    } else if (type instanceof AvroDataType<?>) {
      return dataDecoder((AvroDataType<T>) type);
    } else if (type instanceof AvroStringType<?>) {
      return stringDecoder((AvroStringType<T>) type);
    } else {
      return Decoder.error(new DecoderException("unsupported avro type: " + type));
    }
  }

  public <T> Decoder<T> complexDecoder(AvroComplexType<T> type) {
    if (type instanceof AvroRecordType<?, ?>) {
      return recordDecoder((AvroRecordType<T, ?>) type);
    } else if (type instanceof AvroEnumType<?>) {
      return enumDecoder((AvroEnumType<T>) type);
    } else if (type instanceof AvroArrayType<?, ?>) {
      return arrayDecoder((AvroArrayType<?, T>) type);
    } else if (type instanceof AvroMapType<?, ?, ?>) {
      return mapDecoder((AvroMapType<?, ?, T>) type);
    } else if (type instanceof AvroUnionType<?>) {
      return unionDecoder((AvroUnionType<T>) type);
    } else if (type instanceof AvroFixedType<?>) {
      return fixedDecoder((AvroFixedType<T>) type);
    } else {
      return Decoder.error(new DecoderException("unsupported avro type: " + type));
    }
  }

  public <T> Decoder<T> nullDecoder(AvroNullType<T> type) {
    return new NullDecoder<T>(type);
  }

  public <T> Decoder<T> booleanDecoder(AvroBooleanType<T> type) {
    return new BooleanDecoder<T>(type);
  }

  public <T> Decoder<T> varintDecoder(AvroVarintType<T> type) {
    return new VarintDecoder<T>(type);
  }

  public <T> Decoder<T> floatDecoder(AvroFloatType<T> type) {
    return new FloatDecoder<T>(type);
  }

  public <T> Decoder<T> doubleDecoder(AvroDoubleType<T> type) {
    return new DoubleDecoder<T>(type);
  }

  public <T> Decoder<T> dataDecoder(AvroDataType<T> type) {
    return new DataDecoder<T>(type);
  }

  public <T> Decoder<T> stringDecoder(AvroStringType<T> type) {
    return new StringDecoder<T>(type);
  }

  public <T, R> Decoder<T> recordDecoder(AvroRecordType<T, R> type) {
    return new RecordDecoder<T, R>(this, type);
  }

  public <T> Decoder<T> enumDecoder(AvroEnumType<T> type) {
    return new EnumDecoder<T>(type);
  }

  public <I, T> Decoder<T> arrayDecoder(AvroArrayType<I, T> type) {
    return new ArrayDecoder<I, T>(this, type);
  }

  public <K, V, T> Decoder<T> mapDecoder(AvroMapType<K, V, T> type) {
    return new MapDecoder<K, V, T>(this, type);
  }

  public <T> Decoder<T> unionDecoder(AvroUnionType<T> type) {
    return new UnionDecoder<T>(this, type);
  }

  public <T> Decoder<T> fixedDecoder(AvroFixedType<T> type) {
    return new FixedDecoder<T>(type);
  }
}
