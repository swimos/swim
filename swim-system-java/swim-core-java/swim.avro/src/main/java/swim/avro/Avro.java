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

package swim.avro;

import swim.avro.decoder.AvroDecoder;
import swim.avro.schema.AvroArrayType;
import swim.avro.schema.AvroBooleanType;
import swim.avro.schema.AvroDataType;
import swim.avro.schema.AvroDoubleType;
import swim.avro.schema.AvroEnumType;
import swim.avro.schema.AvroFieldType;
import swim.avro.schema.AvroFixedType;
import swim.avro.schema.AvroFloatType;
import swim.avro.schema.AvroIntType;
import swim.avro.schema.AvroLongType;
import swim.avro.schema.AvroMapType;
import swim.avro.schema.AvroNullType;
import swim.avro.schema.AvroRecordType;
import swim.avro.schema.AvroStringType;
import swim.avro.schema.AvroType;
import swim.avro.schema.AvroUnionType;
import swim.avro.structure.AvroStructure;
import swim.codec.Decoder;
import swim.codec.InputBuffer;
import swim.structure.Item;
import swim.structure.Value;

/**
 * Factory for constructing Avro decoders and encoders.
 */
public final class Avro {
  private Avro() {
    // static
  }

  private static AvroDecoder decoder;

  public static AvroDecoder decoder() {
    if (decoder == null) {
      decoder = new AvroDecoder();
    }
    return decoder;
  }

  public static <T> Decoder<T> decodeType(AvroType<T> type, InputBuffer input) {
    return decoder().decodeType(type, input);
  }

  public static <T> Decoder<T> typeDecoder(AvroType<T> type) {
    return decoder().typeDecoder(type);
  }

  public static AvroNullType<Value> nullType() {
    return AvroStructure.nullType();
  }

  public static AvroBooleanType<Value> booleanType() {
    return AvroStructure.booleanType();
  }

  public static AvroIntType<Value> intType() {
    return AvroStructure.intType();
  }

  public static AvroLongType<Value> longType() {
    return AvroStructure.longType();
  }

  public static AvroFloatType<Value> floatType() {
    return AvroStructure.floatType();
  }

  public static AvroDoubleType<Value> doubleType() {
    return AvroStructure.doubleType();
  }

  public static AvroDataType<Value> dataType() {
    return AvroStructure.dataType();
  }

  public static AvroStringType<Value> stringType() {
    return AvroStructure.stringType();
  }

  public static AvroRecordType<Item, Value> recordType(AvroName fullName) {
    return AvroStructure.recordType(fullName);
  }

  public static AvroRecordType<Item, Value> recordType(String fullName) {
    return AvroStructure.recordType(fullName);
  }

  public static AvroEnumType<Value> enumType(AvroName fullName) {
    return AvroStructure.enumType(fullName);
  }

  public static AvroEnumType<Value> enumType(String fullName) {
    return AvroStructure.enumType(fullName);
  }

  public static AvroEnumType<Value> enumType(AvroName fullName, String... symbols) {
    return AvroStructure.enumType(fullName, symbols);
  }

  public static AvroEnumType<Value> enumType(String fullName, String... symbols) {
    return AvroStructure.enumType(fullName, symbols);
  }

  public static AvroArrayType<Value, Value> arrayType(AvroType<Value> itemType) {
    return AvroStructure.arrayType(itemType);
  }

  public static AvroMapType<Value, Value, Value> mapType(AvroType<Value> valueType) {
    return AvroStructure.mapType(valueType);
  }

  public static AvroUnionType<Value> unionType() {
    return AvroStructure.unionType();
  }

  public static AvroFixedType<Value> fixedType(AvroName fullName, int size) {
    return AvroStructure.fixedType(fullName, size);
  }

  public static AvroFixedType<Value> fixedType(String fullName, int size) {
    return AvroStructure.fixedType(fullName, size);
  }

  public static AvroFieldType<Item, Item> field(String name, AvroType<? extends Item> valueType) {
    return AvroStructure.field(name, valueType);
  }

  public static boolean isNameStartChar(int c) {
    return 'A' <= c && c <= 'Z'
        || 'a' <= c && c <= 'z'
        || c == '_';
  }

  public static boolean isNameChar(int c) {
    return 'A' <= c && c <= 'Z'
        || 'a' <= c && c <= 'z'
        || '0' <= c && c <= '9'
        || c == '_';
  }
}
