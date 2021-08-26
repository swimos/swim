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

package swim.protobuf.structure;

import swim.protobuf.schema.ProtobufDataType;
import swim.protobuf.schema.ProtobufFieldType;
import swim.protobuf.schema.ProtobufFixed32Type;
import swim.protobuf.schema.ProtobufFixed64Type;
import swim.protobuf.schema.ProtobufMapEntryType;
import swim.protobuf.schema.ProtobufMapType;
import swim.protobuf.schema.ProtobufMessageType;
import swim.protobuf.schema.ProtobufRepeatedType;
import swim.protobuf.schema.ProtobufStringType;
import swim.protobuf.schema.ProtobufType;
import swim.protobuf.schema.ProtobufVarintType;
import swim.protobuf.schema.ProtobufZigZagType;
import swim.structure.Field;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;

public final class ProtobufStructure {

  private static BooleanStructure booleanType;
  private static VarintStructure varintType;
  private static ZigZagStructure zigZagType;
  private static Fixed32Structure fixed32Type;
  private static FloatStructure floatType;
  private static Fixed64Structure fixed64Type;
  private static DoubleStructure doubleType;
  private static DataStructure dataType;
  private static StringStructure stringType;

  private ProtobufStructure() {
    // static
  }

  public static ProtobufVarintType<Value> booleanType() {
    if (ProtobufStructure.booleanType == null) {
      ProtobufStructure.booleanType = new BooleanStructure();
    }
    return ProtobufStructure.booleanType;
  }

  public static ProtobufVarintType<Value> varintType() {
    if (ProtobufStructure.varintType == null) {
      ProtobufStructure.varintType = new VarintStructure();
    }
    return ProtobufStructure.varintType;
  }

  public static ProtobufZigZagType<Value> zigZagType() {
    if (ProtobufStructure.zigZagType == null) {
      ProtobufStructure.zigZagType = new ZigZagStructure();
    }
    return ProtobufStructure.zigZagType;
  }

  public static ProtobufFixed32Type<Value> fixed32Type() {
    if (ProtobufStructure.fixed32Type == null) {
      ProtobufStructure.fixed32Type = new Fixed32Structure();
    }
    return ProtobufStructure.fixed32Type;
  }

  public static ProtobufFixed32Type<Value> floatType() {
    if (ProtobufStructure.floatType == null) {
      ProtobufStructure.floatType = new FloatStructure();
    }
    return ProtobufStructure.floatType;
  }

  public static ProtobufFixed64Type<Value> fixed64Type() {
    if (ProtobufStructure.fixed64Type == null) {
      ProtobufStructure.fixed64Type = new Fixed64Structure();
    }
    return ProtobufStructure.fixed64Type;
  }

  public static ProtobufFixed64Type<Value> doubleType() {
    if (ProtobufStructure.doubleType == null) {
      ProtobufStructure.doubleType = new DoubleStructure();
    }
    return ProtobufStructure.doubleType;
  }

  public static ProtobufDataType<Value> dataType() {
    if (ProtobufStructure.dataType == null) {
      ProtobufStructure.dataType = new DataStructure();
    }
    return ProtobufStructure.dataType;
  }

  public static ProtobufStringType<Value> stringType() {
    if (ProtobufStructure.stringType == null) {
      ProtobufStructure.stringType = new StringStructure();
    }
    return ProtobufStructure.stringType;
  }

  public static ProtobufMessageType<Record, Record> messageType() {
    return new MessageStructure();
  }

  public static <K extends Value, V extends Value> ProtobufMapEntryType<K, V, Slot> mapEntryType(ProtobufType<? extends K> keyType, ProtobufType<? extends V> valueType) {
    return MapEntryStructure.create(keyType, valueType);
  }

  public static <K extends Value, V extends Value> ProtobufMapType<K, V, Field, Record> mapType(ProtobufMapEntryType<? extends K, ? extends V, ? extends Field> entryType) {
    return new MapStructure<K, V>(entryType);
  }

  public static <K extends Value, V extends Value> ProtobufMapType<K, V, Field, Record> mapType(ProtobufType<? extends K> keyType, ProtobufType<? extends V> valueType) {
    final ProtobufMapEntryType<K, V, Slot> entryType = MapEntryStructure.create(keyType, valueType);
    return new MapStructure<K, V>(entryType);
  }

  public static <I extends Item> ProtobufRepeatedType<I, Record> repeatedType(ProtobufType<I> itemType) {
    return new RepeatedStructure<I>(itemType);
  }

  public static ProtobufFieldType<Value, Record> field(Value key, long fieldNumber,
                                                       ProtobufType<? extends Value> valueType) {
    return new FieldStructure(key, fieldNumber, valueType);
  }

  public static ProtobufFieldType<Value, Record> field(String key, long fieldNumber,
                                                       ProtobufType<? extends Value> valueType) {
    return new FieldStructure(Text.from(key), fieldNumber, valueType);
  }

  public static ProtobufFieldType<Item, Record> repeatedField(Value key, long fieldNumber,
                                                              ProtobufRepeatedType<? extends Item, ? extends Value> valueType) {
    return new RepeatedFieldStructure(key, fieldNumber, valueType);
  }

  public static ProtobufFieldType<Item, Record> repeatedField(String key, long fieldNumber,
                                                              ProtobufRepeatedType<? extends Item, ? extends Value> repeatedType) {
    return new RepeatedFieldStructure(Text.from(key), fieldNumber, repeatedType);
  }

}
