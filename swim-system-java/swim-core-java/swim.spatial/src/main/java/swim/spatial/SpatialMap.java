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

package swim.spatial;

import java.util.Iterator;
import java.util.Map;

public interface SpatialMap<K, S, V> extends Iterable<SpatialMap.Entry<K, S, V>> {
  boolean isEmpty();

  int size();

  boolean containsKey(K key, S shape);

  boolean containsKey(Object key);

  boolean containsValue(Object value);

  V get(K key, S shape);

  V get(Object key);

  V put(K key, S shape, V newValue);

  V move(K key, S oldShape, S newShape, V newValue);

  V remove(K key, S shape);

  void clear();

  Iterator<Entry<K, S, V>> iterator(S shape);

  Iterator<K> keyIterator();

  Iterator<V> valueIterator();

  interface Entry<K, S, V> extends Map.Entry<K, V> {
    S getShape();
  }

  class SimpleEntry<K, S, V> implements Entry<K, S, V> {
    protected K key;
    protected S shape;
    protected V value;

    public SimpleEntry(K key, S shape, V value) {
      this.key = key;
      this.shape = shape;
      this.value = value;
    }

    @Override
    public K getKey() {
      return key;
    }

    @Override
    public S getShape() {
      return shape;
    }

    @Override
    public V getValue() {
      return value;
    }

    @Override
    public V setValue(V newValue) {
      throw new UnsupportedOperationException();
    }

    @Override
    public boolean equals(Object other) {
      if (this == other) {
        return true;
      } else if (other instanceof Map.Entry<?, ?>) {
        final Map.Entry<?, ?> that = (Map.Entry<?, ?>) other;
        final K key = getKey();
        if (key == null ? that.getKey() != null : !key.equals(that.getKey())) {
          return false;
        }
        final V value = getValue();
        if (value == null ? that.getValue() != null : !value.equals(that.getValue())) {
          return false;
        }
        return true;
      }
      return false;
    }

    @Override
    public int hashCode() {
      final K key = getKey();
      final V value = getValue();
      return (key == null ? 0 : key.hashCode()) ^ (value == null ? 0 : value.hashCode());
    }

    @Override
    public String toString() {
      return new StringBuilder().append(getKey()).append('=').append(getValue()).toString();
    }
  }
}
