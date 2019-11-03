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

package swim.avro.reflection;

import java.lang.reflect.Constructor;
import java.util.Map;
import swim.avro.AvroException;
import swim.avro.schema.AvroMapType;
import swim.avro.schema.AvroType;
import swim.codec.Input;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.util.PairBuilder;

final class MapReflection<V> extends AvroMapType<String, V, Map<String, V>> {
  final Constructor<Map<String, V>> constructor;
  final AvroType<V> valueType;

  MapReflection(Constructor<Map<String, V>> constructor, AvroType<V> valueType) {
    this.constructor = constructor;
    this.valueType = valueType;
  }

  @Override
  public Parser<String> parseKey(Input input) {
    return Unicode.parseString(input);
  }

  @Override
  public AvroType<V> valueType() {
    return this.valueType;
  }

  @Override
  public PairBuilder<String, V, Map<String, V>> mapBuilder() {
    return new MapReflectionBuilder<V>(this.constructor);
  }
}

final class MapReflectionBuilder<V> implements PairBuilder<String, V, Map<String, V>> {
  final Constructor<Map<String, V>> constructor;
  Map<String, V> map;

  MapReflectionBuilder(Constructor<Map<String, V>> constructor) {
    this.constructor = constructor;
  }

  @Override
  public boolean add(String key, V newValue) {
    Map<String, V> map = this.map;
    if (map == null) {
      try {
        map = this.constructor.newInstance();
      } catch (ReflectiveOperationException cause) {
        throw new AvroException(cause);
      }
      this.map = map;
    }
    final V oldValue = map.put(key, newValue);
    return oldValue != null;
  }

  @Override
  public Map<String, V> bind() {
    Map<String, V> map = this.map;
    if (map != null) {
      this.map = null;
    } else {
      try {
        map = this.constructor.newInstance();
      } catch (ReflectiveOperationException cause) {
        throw new AvroException(cause);
      }
    }
    return map;
  }
}
