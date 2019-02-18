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

import java.util.Comparator;
import java.util.Iterator;
import java.util.Map;

final class OrderedMapView<K, V> implements OrderedMap<K, V> {
  final OrderedMap<K, V> map;
  final K fromKey;
  final K toKey;

  OrderedMapView(OrderedMap<K, V> map, K fromKey, K toKey) {
    this.map = map;
    this.fromKey = fromKey;
    this.toKey = toKey;
  }

  @Override
  public boolean isEmpty() {
    return size() == 0;
  }

  @Override
  public int size() {
    int fromIndex;
    if (this.fromKey != null) {
      fromIndex = this.map.indexOf(this.fromKey);
      if (fromIndex < 0) {
        fromIndex = -(fromIndex + 1);
      }
    } else {
      fromIndex = 0;
    }
    int toIndex;
    if (this.toKey != null) {
      toIndex = this.map.indexOf(this.toKey);
      if (toIndex < 0) {
        toIndex = -(toIndex + 1);
      } else {
        toIndex += 1;
      }
    } else {
      toIndex = this.map.size();
    }
    return toIndex - fromIndex;
  }

  @Override
  public boolean containsKey(Object key) {
    return (this.fromKey == null || compareKey(this.fromKey, key) >= 0)
        && (this.toKey == null || compareKey(key, this.toKey) < 0)
        && this.map.containsKey(key);
  }

  @Override
  public boolean containsValue(Object value) {
    final Cursor<V> cursor = valueIterator();
    while (cursor.hasNext()) {
      if (value == null ? cursor.next() == null : value.equals(cursor.next())) {
        return true;
      }
    }
    return false;
  }

  @Override
  public int indexOf(Object key) {
    if ((this.fromKey == null || compareKey(this.fromKey, key) >= 0)
        && (this.toKey == null || compareKey(key, this.toKey) < 0)) {
      int fromIndex;
      if (this.fromKey != null) {
        fromIndex = this.map.indexOf(this.fromKey);
        if (fromIndex < 0) {
          fromIndex = -(fromIndex + 1);
        }
      } else {
        fromIndex = 0;
      }
      final int keyIndex = this.map.indexOf(key);
      if (keyIndex >= 0) {
        return keyIndex - fromIndex;
      } else {
        return keyIndex + fromIndex;
      }
    } else {
      throw new IllegalArgumentException(key.toString());
    }
  }

  @Override
  public V get(Object key) {
    if ((this.fromKey == null || compareKey(this.fromKey, key) >= 0)
        && (this.toKey == null || compareKey(key, this.toKey) < 0)) {
      return this.map.get(key);
    } else {
      return null;
    }
  }

  @Override
  public Entry<K, V> getEntry(Object key) {
    if ((this.fromKey == null || compareKey(this.fromKey, key) >= 0)
        && (this.toKey == null || compareKey(key, this.toKey) < 0)) {
      return this.map.getEntry(key);
    } else {
      return null;
    }
  }

  @Override
  public Entry<K, V> getIndex(int index) {
    final Cursor<Entry<K, V>> cursor = iterator();
    int i = 0;
    while (i < index && cursor.hasNext()) {
      cursor.step();
      i += 1;
    }
    if (i == index && cursor.hasNext()) {
      return cursor.next();
    } else {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
  }

  @Override
  public Entry<K, V> firstEntry() {
    Entry<K, V> nextEntry;
    if (this.fromKey != null) {
      nextEntry = this.map.getEntry(this.fromKey);
      if (nextEntry != null) {
        return nextEntry;
      } else {
        nextEntry = this.map.nextEntry(this.fromKey);
      }
    } else {
      nextEntry = this.map.firstEntry();
    }
    if (this.toKey == null || nextEntry != null && compareKey(nextEntry.getKey(), this.toKey) < 0) {
      return nextEntry;
    } else {
      return null;
    }
  }

  @Override
  public K firstKey() {
    final K nextKey;
    if (this.fromKey != null) {
      if (this.map.containsKey(this.fromKey)) {
        return this.fromKey;
      } else {
        nextKey = this.map.nextKey(this.fromKey);
      }
    } else {
      nextKey = this.map.firstKey();
    }
    if (this.toKey == null || nextKey != null && compareKey(nextKey, this.toKey) < 0) {
      return nextKey;
    } else {
      return null;
    }
  }

  @Override
  public V firstValue() {
    final K firstKey = firstKey();
    if (firstKey != null) {
      return this.map.get(firstKey);
    } else {
      return null;
    }
  }

  @Override
  public Entry<K, V> lastEntry() {
    final Entry<K, V> previousEntry;
    if (this.toKey != null) {
      previousEntry = this.map.previousEntry(this.toKey);
    } else {
      previousEntry = this.map.lastEntry();
    }
    if (this.fromKey == null || previousEntry != null && compareKey(this.fromKey, previousEntry.getKey()) <= 0) {
      return previousEntry;
    } else {
      return null;
    }
  }

  @Override
  public K lastKey() {
    final K previousKey;
    if (this.toKey != null) {
      previousKey = this.map.previousKey(this.toKey);
    } else {
      previousKey = this.map.lastKey();
    }
    if (this.fromKey == null || previousKey != null && compareKey(this.fromKey, previousKey) <= 0) {
      return previousKey;
    } else {
      return null;
    }
  }

  @Override
  public V lastValue() {
    final K lastKey = lastKey();
    if (lastKey != null) {
      return this.map.get(lastKey);
    } else {
      return null;
    }
  }

  @Override
  public Entry<K, V> nextEntry(K key) {
    final Entry<K, V> nextEntry = this.map.nextEntry(key);
    if (nextEntry != null && (this.toKey == null || compareKey(nextEntry.getKey(), this.toKey) < 0)) {
      return nextEntry;
    } else {
      return null;
    }
  }

  @Override
  public K nextKey(K key) {
    final K nextKey = this.map.nextKey(key);
    if (nextKey != null && (this.toKey == null || compareKey(nextKey, this.toKey) < 0)) {
      return nextKey;
    } else {
      return null;
    }
  }

  @Override
  public V nextValue(K key) {
    final K nextKey = nextKey(key);
    if (nextKey != null) {
      return this.map.get(nextKey);
    } else {
      return null;
    }
  }

  @Override
  public Entry<K, V> previousEntry(K key) {
    final Entry<K, V> previousEntry = this.map.previousEntry(key);
    if (previousEntry != null && (this.fromKey == null || compareKey(this.fromKey, previousEntry.getKey()) <= 0)) {
      return previousEntry;
    } else {
      return null;
    }
  }

  @Override
  public K previousKey(K key) {
    final K previousKey = this.map.previousKey(key);
    if (previousKey != null && (this.fromKey == null || compareKey(this.fromKey, previousKey) <= 0)) {
      return previousKey;
    } else {
      return null;
    }
  }

  @Override
  public V previousValue(K key) {
    final K previousKey = previousKey(key);
    if (previousKey != null) {
      return this.map.get(previousKey);
    } else {
      return null;
    }
  }

  @Override
  public V put(K key, V newValue) {
    if ((this.fromKey == null || compareKey(this.fromKey, key) <= 0)
        && (this.toKey == null || compareKey(key, this.toKey) < 0)) {
      return this.map.put(key, newValue);
    } else {
      throw new IllegalArgumentException(key.toString());
    }
  }

  @Override
  public V remove(Object key) {
    if ((this.fromKey == null || compareKey(this.fromKey, key) <= 0)
        && (this.toKey == null || compareKey(key, this.toKey) < 0)) {
      return this.map.remove(key);
    } else {
      return null;
    }
  }

  @Override
  public void clear() {
    final Cursor<K> cursor = keyIterator();
    while (cursor.hasNext()) {
      cursor.step();
      cursor.remove();
    }
  }

  @Override
  public OrderedMap<K, V> headMap(K toKey) {
    if (compareKey(toKey, this.toKey) > 0) {
      toKey = this.toKey;
    }
    return new OrderedMapView<K, V>(this.map, this.fromKey, toKey);
  }

  @Override
  public OrderedMap<K, V> tailMap(K fromKey) {
    if (compareKey(fromKey, this.fromKey) < 0) {
      fromKey = this.fromKey;
    }
    return new OrderedMapView<K, V>(this.map, fromKey, this.toKey);
  }

  @Override
  public OrderedMap<K, V> subMap(K fromKey, K toKey) {
    if (compareKey(fromKey, this.fromKey) < 0) {
      fromKey = this.fromKey;
    }
    if (compareKey(toKey, this.toKey) > 0) {
      toKey = this.toKey;
    }
    return new OrderedMapView<K, V>(this.map, fromKey, toKey);
  }

  @Override
  public OrderedMapCursor<K, V> iterator() {
    int index = this.map.indexOf(this.fromKey);
    if (index < 0) {
      index = -(index + 1);
    }
    final OrderedMapCursor<K, V> cursor = this.map.iterator();
    cursor.skip(index - 1);
    return new OrderedMapViewCursor<K, V>(this.map, cursor, this.fromKey, this.toKey);
  }

  @Override
  public Comparator<? super K> comparator() {
    return this.map.comparator();
  }

  @SuppressWarnings("unchecked")
  private int compareKey(Object x, Object y) {
    final Comparator<Object> comparator = (Comparator<Object>) (Comparator<?>) this.map.comparator();
    if (comparator != null) {
      return comparator.compare(x, y);
    } else {
      return ((Comparable<Object>) x).compareTo(y);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map<?, ?>) {
      final Map<K, V> that = (Map<K, V>) other;
      if (size() == that.size()) {
        final Iterator<Entry<K, V>> those = that.entrySet().iterator();
        while (those.hasNext()) {
          final Entry<K, V> entry = those.next();
          final V value = get(entry.getKey());
          final V v = entry.getValue();
          if (value == null ? v != null : !value.equals(v)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  @Override
  public int hashCode() {
    int code = 0;
    final Iterator<Entry<K, V>> these = iterator();
    while (these.hasNext()) {
      code += these.next().hashCode();
    }
    return code;
  }

  @Override
  public String toString() {
    final StringBuilder sb = new StringBuilder();
    sb.append('{');
    final Iterator<Entry<K, V>> these = iterator();
    if (these.hasNext()) {
      sb.append(these.next());
      while (these.hasNext()) {
        sb.append(", ").append(these.next());
      }
    }
    sb.append('}');
    return sb.toString();
  }
}
