// Copyright 2015-2021 Swim inc.
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

import swim.protobuf.schema.ProtobufFieldType;
import swim.protobuf.schema.ProtobufMapEntryType;
import swim.protobuf.schema.ProtobufType;
import swim.structure.Slot;
import swim.structure.Value;

final class MapEntryStructure<K extends Value, V extends Value> extends ProtobufMapEntryType<K, V, Slot> {

  final ProtobufFieldType<? extends K, Slot> keyField;
  final ProtobufFieldType<? extends V, Slot> valueField;

  MapEntryStructure(ProtobufFieldType<? extends K, Slot> keyField, ProtobufFieldType<? extends V, Slot> valueField) {
    this.keyField = keyField;
    this.valueField = valueField;
  }

  @Override
  public ProtobufFieldType<? extends K, Slot> keyField() {
    return this.keyField;
  }

  @Override
  public ProtobufFieldType<? extends V, Slot> valueField() {
    return this.valueField;
  }

  @Override
  public Slot create() {
    return null;
  }

  @Override
  public Slot cast(Slot slot) {
    return slot;
  }

  static <K extends Value> ProtobufFieldType<K, Slot> keyField(ProtobufType<? extends K> keyType) {
    return new MapKeyStructure<K>(keyType);
  }

  static <V extends Value> ProtobufFieldType<V, Slot> valueField(ProtobufType<? extends V> valueType) {
    return new MapValueStructure<V>(valueType);
  }

  static <K extends Value, V extends Value> MapEntryStructure<K, V> create(ProtobufType<? extends K> keyType, ProtobufType<? extends V> valueType) {
    final ProtobufFieldType<K, Slot> keyField = new MapKeyStructure<K>(keyType);
    final ProtobufFieldType<V, Slot> valueField = new MapValueStructure<V>(valueType);
    return new MapEntryStructure<K, V>(keyField, valueField);
  }

}

final class MapKeyStructure<K extends Value> extends ProtobufFieldType<K, Slot> {

  final ProtobufType<? extends K> keyType;

  MapKeyStructure(ProtobufType<? extends K> keyType) {
    this.keyType = keyType;
  }

  @Override
  public long fieldNumber() {
    return 1L;
  }

  @Override
  public ProtobufType<? extends K> valueType() {
    return this.keyType;
  }

  @Override
  public Slot updated(Slot slot, Value key) {
    if (slot == null) {
      slot = Slot.of(key);
    } else {
      slot = Slot.of(key, slot.getValue());
    }
    return slot;
  }

  @Override
  public ProtobufFieldType<?, Slot> packedType() {
    return null;
  }

}

final class MapValueStructure<V extends Value> extends ProtobufFieldType<V, Slot> {

  final ProtobufType<? extends V> valueType;

  MapValueStructure(ProtobufType<? extends V> valueType) {
    this.valueType = valueType;
  }

  @Override
  public long fieldNumber() {
    return 2L;
  }

  @Override
  public ProtobufType<? extends V> valueType() {
    return this.valueType;
  }

  @Override
  public Slot updated(Slot slot, Value value) {
    if (slot != null) {
      slot = slot.updatedValue(value);
    } else {
      slot = Slot.of(Value.extant(), value);
    }
    return slot;
  }

  @Override
  public ProtobufFieldType<?, Slot> packedType() {
    return null;
  }

}
