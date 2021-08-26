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

package swim.protobuf.reflection;

import java.lang.reflect.Constructor;
import java.util.Collection;
import java.util.Map;
import swim.protobuf.ProtobufException;
import swim.protobuf.schema.ProtobufMapEntryType;
import swim.protobuf.schema.ProtobufMapType;
import swim.util.Builder;

final class MapReflection<K, V> extends ProtobufMapType<K, V, Map.Entry<K, V>, Map<K, V>> {

  final Constructor<? extends Map<K, V>> constructor;
  final ProtobufMapEntryType<? extends K, ? extends V, ? extends Map.Entry<K, V>> itemType;

  MapReflection(Constructor<Map<K, V>> constructor, ProtobufMapEntryType<? extends K, ? extends V, ? extends Map.Entry<K, V>> itemType) {
    this.constructor = constructor;
    this.itemType = itemType;
  }

  @Override
  public ProtobufMapEntryType<? extends K, ? extends V, ? extends Map.Entry<K, V>> itemType() {
    return this.itemType;
  }

  @Override
  public Builder<Map.Entry<K, V>, Map<K, V>> valueBuilder() {
    return new MapReflectionBuilder<K, V>(this.constructor);
  }

  @Override
  public Map<K, V> appended(Map<K, V> map, Map.Entry<K, V> entry) {
    if (map == null) {
      try {
        map = this.constructor.newInstance();
      } catch (ReflectiveOperationException cause) {
        throw new ProtobufException(cause);
      }
    }
    map.put(entry.getKey(), entry.getValue());
    return map;
  }

}

final class MapReflectionBuilder<K, V> implements Builder<Map.Entry<K, V>, Map<K, V>> {

  final Constructor<? extends Map<K, V>> constructor;
  Map<K, V> map;

  MapReflectionBuilder(Constructor<? extends Map<K, V>> constructor) {
    this.constructor = constructor;
  }

  @Override
  public boolean add(Map.Entry<K, V> entry) {
    Map<K, V> map = this.map;
    if (map == null) {
      try {
        map = this.constructor.newInstance();
      } catch (ReflectiveOperationException cause) {
        throw new ProtobufException(cause);
      }
      this.map = map;
    }
    final V oldValue = map.put(entry.getKey(), entry.getValue());
    return oldValue != null;
  }

  @Override
  public boolean addAll(Collection<? extends Map.Entry<K, V>> entries) {
    Map<K, V> map = this.map;
    if (map == null) {
      try {
        map = this.constructor.newInstance();
      } catch (ReflectiveOperationException cause) {
        throw new ProtobufException(cause);
      }
      this.map = map;
    }
    boolean modified = false;
    for (Map.Entry<K, V> entry : entries) {
      modified = map.put(entry.getKey(), entry.getValue()) != null || modified;
    }
    return modified;
  }

  @Override
  public Map<K, V> bind() {
    Map<K, V> map = this.map;
    if (map != null) {
      this.map = null;
    } else {
      try {
        map = this.constructor.newInstance();
      } catch (ReflectiveOperationException cause) {
        throw new ProtobufException(cause);
      }
    }
    return map;
  }

}
