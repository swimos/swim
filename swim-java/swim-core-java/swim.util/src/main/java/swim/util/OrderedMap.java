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

package swim.util;

import java.util.Collection;
import java.util.Comparator;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;

public interface OrderedMap<K, V> extends IterableMap<K, V>, SortedMap<K, V> {
  @Override
  boolean isEmpty();

  @Override
  int size();

  @Override
  boolean containsKey(Object key);

  @Override
  boolean containsValue(Object value);

  int indexOf(Object key);

  @Override
  V get(Object key);

  Entry<K, V> getEntry(Object key);

  Entry<K, V> getIndex(int index);

  Entry<K, V> firstEntry();

  @Override
  K firstKey();

  V firstValue();

  Entry<K, V> lastEntry();

  @Override
  K lastKey();

  V lastValue();

  Entry<K, V> nextEntry(K key);

  K nextKey(K key);

  V nextValue(K key);

  Entry<K, V> previousEntry(K key);

  K previousKey(K key);

  V previousValue(K key);

  @Override
  V put(K key, V newValue);

  @Override
  default void putAll(Map<? extends K, ? extends V> map) {
    for (Entry<? extends K, ? extends V> entry : map.entrySet()) {
      put(entry.getKey(), entry.getValue());
    }
  }

  @Override
  V remove(Object key);

  @Override
  void clear();

  @Override
  default OrderedMap<K, V> headMap(K toKey) {
    return new OrderedMapView<K, V>(this, null, toKey);
  }

  @Override
  default OrderedMap<K, V> tailMap(K fromKey) {
    return new OrderedMapView<K, V>(this, fromKey, null);
  }

  @Override
  default OrderedMap<K, V> subMap(K fromKey, K toKey) {
    return new OrderedMapView<K, V>(this, fromKey, toKey);
  }

  @Override
  default Set<Entry<K, V>> entrySet() {
    return IterableMap.super.entrySet();
  }

  @Override
  default Set<K> keySet() {
    return IterableMap.super.keySet();
  }

  @Override
  default Collection<V> values() {
    return IterableMap.super.values();
  }

  @Override
  OrderedMapCursor<K, V> iterator();

  @Override
  default Cursor<K> keyIterator() {
    return IterableMap.super.keyIterator();
  }

  @Override
  default Cursor<V> valueIterator() {
    return IterableMap.super.valueIterator();
  }

  @Override
  Comparator<? super K> comparator();
}
