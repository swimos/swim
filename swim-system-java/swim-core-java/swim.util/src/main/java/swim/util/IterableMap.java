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

import java.util.AbstractCollection;
import java.util.AbstractSet;
import java.util.Collection;
import java.util.Map;
import java.util.Set;

public interface IterableMap<K, V> extends Iterable<Map.Entry<K, V>>, Map<K, V> {
  @Override
  boolean isEmpty();

  @Override
  int size();

  @Override
  boolean containsKey(Object key);

  @Override
  boolean containsValue(Object value);

  @Override
  V get(Object key);

  @Override
  V put(K key, V newValue);

  @Override
  void putAll(Map<? extends K, ? extends V> map);

  @Override
  V remove(Object key);

  @Override
  void clear();

  @Override
  default Set<Entry<K, V>> entrySet() {
    return new IterableMapEntrySet<K, V>(this);
  }

  @Override
  default Set<K> keySet() {
    return new IterableMapKeySet<K, V>(this);
  }

  @Override
  default Collection<V> values() {
    return new IterableMapValues<K, V>(this);
  }

  @Override
  Cursor<Entry<K, V>> iterator();

  default Cursor<K> keyIterator() {
    return new CursorKeys<K>(iterator());
  }

  default Cursor<V> valueIterator() {
    return new CursorValues<V>(iterator());
  }
}

final class IterableMapEntrySet<K, V> extends AbstractSet<Map.Entry<K, V>> {
  private final IterableMap<K, V> map;

  IterableMapEntrySet(IterableMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Cursor<Map.Entry<K, V>> iterator() {
    return this.map.iterator();
  }
}

final class IterableMapKeySet<K, V> extends AbstractSet<K> {
  private final IterableMap<K, V> map;

  IterableMapKeySet(IterableMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Cursor<K> iterator() {
    return this.map.keyIterator();
  }
}

final class IterableMapValues<K, V> extends AbstractCollection<V> {
  private final IterableMap<K, V> map;

  IterableMapValues(IterableMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Cursor<V> iterator() {
    return this.map.valueIterator();
  }
}
