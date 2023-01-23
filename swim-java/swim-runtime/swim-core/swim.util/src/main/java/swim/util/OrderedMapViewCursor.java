// Copyright 2015-2023 Swim.inc
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
import java.util.Map;
import java.util.NoSuchElementException;

final class OrderedMapViewCursor<K, V> implements OrderedMapCursor<K, V> {

  final OrderedMap<K, V> map;
  final OrderedMapCursor<K, V> cursor;
  final K fromKey;
  final K toKey;

  OrderedMapViewCursor(OrderedMap<K, V> map, OrderedMapCursor<K, V> cursor, K fromKey, K toKey) {
    this.map = map;
    this.cursor = cursor;
    this.fromKey = fromKey;
    this.toKey = toKey;
  }

  @Override
  public boolean isEmpty() {
    return this.cursor.isEmpty() || this.toKey != null && this.compareKey(this.cursor.nextKey(), this.toKey) >= 0;
  }

  @Override
  public Map.Entry<K, V> head() {
    if (!this.isEmpty()) {
      return this.cursor.head();
    } else {
      throw new NoSuchElementException();
    }
  }

  @Override
  public void step() {
    if (!this.isEmpty()) {
      this.cursor.step();
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public void skip(long count) {
    this.cursor.skip(count);
  }

  @Override
  public boolean hasNext() {
    return this.cursor.hasNext() && (this.toKey == null || this.compareKey(this.cursor.nextKey(), this.toKey) < 0);
  }

  @Override
  public long nextIndexLong() {
    return this.cursor.nextIndexLong();
  }

  @Override
  public K nextKey() {
    if (this.cursor.hasNext()) {
      final K nextKey = this.cursor.nextKey();
      if (this.toKey == null || this.compareKey(nextKey, this.toKey) < 0) {
        return nextKey;
      }
    }
    return null;
  }

  @Override
  public Map.Entry<K, V> next() {
    if (this.hasNext()) {
      return this.cursor.next();
    } else {
      throw new NoSuchElementException();
    }
  }

  @Override
  public boolean hasPrevious() {
    return this.cursor.hasPrevious() && (this.fromKey == null || this.compareKey(this.fromKey, this.cursor.previousKey()) <= 0);
  }

  @Override
  public long previousIndexLong() {
    return this.cursor.previousIndexLong();
  }

  @Override
  public K previousKey() {
    if (this.cursor.hasPrevious()) {
      final K previousKey = this.cursor.previousKey();
      if (this.fromKey == null || this.compareKey(this.fromKey, previousKey) <= 0) {
        return previousKey;
      }
    }
    return null;
  }

  @Override
  public Map.Entry<K, V> previous() {
    if (this.hasPrevious()) {
      return this.cursor.previous();
    } else {
      throw new NoSuchElementException();
    }
  }

  @Override
  public void set(Map.Entry<K, V> newValue) {
    this.cursor.set(newValue);
  }

  @Override
  public void remove() {
    this.cursor.remove();
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

}
