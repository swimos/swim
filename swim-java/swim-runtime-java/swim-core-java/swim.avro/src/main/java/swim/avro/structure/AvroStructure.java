// Copyright 2015-2021 Swim Inc.
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

package swim.avro.structure;

import swim.avro.AvroName;
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
import swim.collections.FingerTrieSeq;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Builder;

public final class AvroStructure {

  private AvroStructure() {
    // static
  }

  private static NullStructure nullType;
  private static BooleanStructure booleanType;
  private static IntStructure intType;
  private static LongStructure longType;
  private static FloatStructure floatType;
  private static DoubleStructure doubleType;
  private static DataStructure dataType;
  private static StringStructure stringType;

  public static AvroNullType<Value> nullType() {
    if (AvroStructure.nullType == null) {
      AvroStructure.nullType = new NullStructure();
    }
    return AvroStructure.nullType;
  }

  public static AvroBooleanType<Value> booleanType() {
    if (AvroStructure.booleanType == null) {
      AvroStructure.booleanType = new BooleanStructure();
    }
    return AvroStructure.booleanType;
  }

  public static AvroIntType<Value> intType() {
    if (AvroStructure.intType == null) {
      AvroStructure.intType = new IntStructure();
    }
    return AvroStructure.intType;
  }

  public static AvroLongType<Value> longType() {
    if (AvroStructure.longType == null) {
      AvroStructure.longType = new LongStructure();
    }
    return AvroStructure.longType;
  }

  public static AvroFloatType<Value> floatType() {
    if (AvroStructure.floatType == null) {
      AvroStructure.floatType = new FloatStructure();
    }
    return AvroStructure.floatType;
  }

  public static AvroDoubleType<Value> doubleType() {
    if (AvroStructure.doubleType == null) {
      AvroStructure.doubleType = new DoubleStructure();
    }
    return AvroStructure.doubleType;
  }

  public static AvroDataType<Value> dataType() {
    if (AvroStructure.dataType == null) {
      AvroStructure.dataType = new DataStructure();
    }
    return AvroStructure.dataType;
  }

  public static AvroStringType<Value> stringType() {
    if (AvroStructure.stringType == null) {
      AvroStructure.stringType = new StringStructure();
    }
    return AvroStructure.stringType;
  }

  public static AvroRecordType<Record, Record> recordType(AvroName fullName) {
    return new RecordStructure(fullName);
  }

  public static AvroRecordType<Record, Record> recordType(String fullName) {
    return AvroStructure.recordType(AvroName.parse(fullName));
  }

  public static AvroEnumType<Value> enumType(AvroName fullName) {
    return new EnumStructure(fullName);
  }

  public static AvroEnumType<Value> enumType(String fullName) {
    return AvroStructure.enumType(AvroName.parse(fullName));
  }

  public static AvroEnumType<Value> enumType(AvroName fullName, String... symbols) {
    final Builder<Text, FingerTrieSeq<Text>> builder = FingerTrieSeq.builder();
    for (int i = 0, n = symbols.length; i < n; i += 1) {
      builder.add(Text.from(symbols[i]));
    }
    return new EnumStructure(fullName, builder.bind());
  }

  public static AvroEnumType<Value> enumType(String fullName, String... symbols) {
    return AvroStructure.enumType(AvroName.parse(fullName), symbols);
  }

  public static <I extends Item> AvroArrayType<I, Record> arrayType(AvroType<? extends I> itemType) {
    return new ArrayStructure<I>(itemType);
  }

  public static <V extends Value> AvroMapType<Value, V, Record> mapType(AvroType<? extends V> valueType) {
    return new MapStructure<V>(valueType);
  }

  public static AvroUnionType<Value> unionType() {
    return UnionStructure.empty();
  }

  public static AvroFixedType<Value> fixedType(AvroName fullName, int size) {
    return new FixedStructure(fullName, size);
  }

  public static AvroFixedType<Value> fixedType(String fullName, int size) {
    return AvroStructure.fixedType(AvroName.parse(fullName), size);
  }

  public static AvroFieldType<Value, Record> field(String name, AvroType<? extends Value> valueType) {
    return new FieldStructure(name, valueType);
  }

}
