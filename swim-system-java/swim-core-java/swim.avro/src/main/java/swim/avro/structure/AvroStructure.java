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
    if (nullType == null) {
      nullType = new NullStructure();
    }
    return nullType;
  }

  public static AvroBooleanType<Value> booleanType() {
    if (booleanType == null) {
      booleanType = new BooleanStructure();
    }
    return booleanType;
  }

  public static AvroIntType<Value> intType() {
    if (intType == null) {
      intType = new IntStructure();
    }
    return intType;
  }

  public static AvroLongType<Value> longType() {
    if (longType == null) {
      longType = new LongStructure();
    }
    return longType;
  }

  public static AvroFloatType<Value> floatType() {
    if (floatType == null) {
      floatType = new FloatStructure();
    }
    return floatType;
  }

  public static AvroDoubleType<Value> doubleType() {
    if (doubleType == null) {
      doubleType = new DoubleStructure();
    }
    return doubleType;
  }

  public static AvroDataType<Value> dataType() {
    if (dataType == null) {
      dataType = new DataStructure();
    }
    return dataType;
  }

  public static AvroStringType<Value> stringType() {
    if (stringType == null) {
      stringType = new StringStructure();
    }
    return stringType;
  }

  public static AvroRecordType<Item, Value> recordType(AvroName fullName) {
    return new RecordStructure(fullName);
  }

  public static AvroRecordType<Item, Value> recordType(String fullName) {
    return recordType(AvroName.parse(fullName));
  }

  public static AvroEnumType<Value> enumType(AvroName fullName) {
    return new EnumStructure(fullName);
  }

  public static AvroEnumType<Value> enumType(String fullName) {
    return enumType(AvroName.parse(fullName));
  }

  public static AvroEnumType<Value> enumType(AvroName fullName, String... symbols) {
    final Builder<Text, FingerTrieSeq<Text>> builder = FingerTrieSeq.builder();
    for (int i = 0, n = symbols.length; i < n; i += 1) {
      builder.add(Text.from(symbols[i]));
    }
    return new EnumStructure(fullName, builder.bind());
  }

  public static AvroEnumType<Value> enumType(String fullName, String... symbols) {
    return enumType(AvroName.parse(fullName), symbols);
  }

  public static AvroArrayType<Value, Value> arrayType(AvroType<Value> itemType) {
    return new ArrayStructure(itemType);
  }

  public static AvroMapType<Value, Value, Value> mapType(AvroType<Value> valueType) {
    return new MapStructure(valueType);
  }

  public static AvroUnionType<Value> unionType() {
    return UnionStructure.empty();
  }

  public static AvroFixedType<Value> fixedType(AvroName fullName, int size) {
    return new FixedStructure(fullName, size);
  }

  public static AvroFixedType<Value> fixedType(String fullName, int size) {
    return fixedType(AvroName.parse(fullName), size);
  }

  public static AvroFieldType<Item, Item> field(String name, AvroType<? extends Item> valueType) {
    return new FieldStructure(name, valueType);
  }
}
