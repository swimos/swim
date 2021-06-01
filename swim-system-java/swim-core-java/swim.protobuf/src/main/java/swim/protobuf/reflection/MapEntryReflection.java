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

package swim.protobuf.reflection;

import java.util.AbstractMap;
import java.util.Map;
import swim.protobuf.schema.ProtobufFieldType;
import swim.protobuf.schema.ProtobufMapEntryType;
import swim.protobuf.schema.ProtobufType;

final class MapEntryReflection<K, V> extends ProtobufMapEntryType<K, V, Map.Entry<K, V>> {

  final ProtobufFieldType<K, Map.Entry<K, V>> keyField;
  final ProtobufFieldType<V, Map.Entry<K, V>> valueField;

  MapEntryReflection(ProtobufFieldType<K, Map.Entry<K, V>> keyField, ProtobufFieldType<V, Map.Entry<K, V>> valueField) {
    this.keyField = keyField;
    this.valueField = valueField;
  }

  @Override
  public ProtobufFieldType<K, Map.Entry<K, V>> keyField() {
    return this.keyField;
  }

  @Override
  public ProtobufFieldType<V, Map.Entry<K, V>> valueField() {
    return this.valueField;
  }

  @Override
  public Map.Entry<K, V> create() {
    return null;
  }

  @Override
  public Map.Entry<K, V> cast(Map.Entry<K, V> entry) {
    return entry;
  }

  static <K, V> ProtobufFieldType<K, Map.Entry<K, V>> keyField(ProtobufType<? extends K> keyType) {
    return new MapKeyReflection<K, V>(keyType);
  }

  static <K, V> ProtobufFieldType<V, Map.Entry<K, V>> valueField(ProtobufType<? extends V> valueType) {
    return new MapValueReflection<K, V>(valueType);
  }

  static <K, V> MapEntryReflection<K, V> create(ProtobufType<? extends K> keyType, ProtobufType<? extends V> valueType) {
    final ProtobufFieldType<K, Map.Entry<K, V>> keyField = new MapKeyReflection<K, V>(keyType);
    final ProtobufFieldType<V, Map.Entry<K, V>> valueField = new MapValueReflection<K, V>(valueType);
    return new MapEntryReflection<K, V>(keyField, valueField);
  }

}

final class MapKeyReflection<K, V> extends ProtobufFieldType<K, Map.Entry<K, V>> {

  final ProtobufType<? extends K> keyType;

  MapKeyReflection(ProtobufType<? extends K> keyType) {
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
  public Map.Entry<K, V> updated(Map.Entry<K, V> entry, K key) {
    if (entry == null) {
      entry = new AbstractMap.SimpleEntry<K, V>(key, null);
    } else {
      entry = new AbstractMap.SimpleEntry<K, V>(key, entry.getValue());
    }
    return entry;
  }

  @Override
  public ProtobufFieldType<?, Map.Entry<K, V>> packedType() {
    return null;
  }

}

final class MapValueReflection<K, V> extends ProtobufFieldType<V, Map.Entry<K, V>> {

  final ProtobufType<? extends V> valueType;

  MapValueReflection(ProtobufType<? extends V> valueType) {
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
  public Map.Entry<K, V> updated(Map.Entry<K, V> entry, V value) {
    if (entry != null) {
      entry.setValue(value);
    } else {
      entry = new AbstractMap.SimpleEntry<K, V>(null, value);
    }
    return entry;
  }

  @Override
  public ProtobufFieldType<?, Map.Entry<K, V>> packedType() {
    return null;
  }

}
