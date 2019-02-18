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

package swim.collections;

import java.util.AbstractMap;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Murmur3;

final class ArrayMap<K, V> implements Debug {
  final Object[] slots;

  ArrayMap(Object[] slots) {
    this.slots = slots;
  }

  ArrayMap(K key, V value) {
    slots = new Object[2];
    slots[0] = key;
    slots[1] = value;
  }

  ArrayMap(K key0, V value0, K key1, V value1) {
    slots = new Object[4];
    slots[0] = key0;
    slots[1] = value0;
    slots[2] = key1;
    slots[3] = value1;
  }

  public boolean isEmpty() {
    return slots.length == 0;
  }

  public int size() {
    return slots.length >> 1;
  }

  public boolean containsKey(Object key) {
    final int n = slots.length;
    for (int i = 0; i < n; i += 2) {
      if (key.equals(slots[i])) {
        return true;
      }
    }
    return false;
  }

  public boolean containsValue(Object value) {
    final int n = slots.length;
    for (int i = 0; i < n; i += 2) {
      final Object v = slots[i + 1];
      if (value == null ? v == null : value.equals(v)) {
        return true;
      }
    }
    return false;
  }

  @SuppressWarnings("unchecked")
  public Map.Entry<K, V> head() {
    if (slots.length > 1) {
      return new AbstractMap.SimpleImmutableEntry<K, V>((K) slots[0], (V) slots[1]);
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  public K headKey() {
    if (slots.length > 1) {
      return (K) slots[0];
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  public V headValue() {
    if (slots.length > 1) {
      return (V) slots[1];
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  public Map.Entry<K, V> next(Object key) {
    final int n = slots.length;
    if (n > 1 && key == null) {
      return new AbstractMap.SimpleImmutableEntry<K, V>((K) slots[0], (V) slots[1]);
    }
    for (int i = 0; i < n; i += 2) {
      if (key.equals(slots[i]) && i + 3 < n) {
        return new AbstractMap.SimpleImmutableEntry<K, V>((K) slots[i + 2], (V) slots[i + 3]);
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  public K nextKey(Object key) {
    final int n = slots.length;
    if (n > 1 && key == null) {
      return (K) slots[0];
    }
    for (int i = 0; i < n; i += 2) {
      if (key.equals(slots[i]) && i + 3 < n) {
        return (K) slots[i + 2];
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  public V nextValue(Object key) {
    final int n = slots.length;
    if (n > 1 && key == null) {
      return (V) slots[1];
    }
    for (int i = 0; i < n; i += 2) {
      if (key.equals(slots[i]) && i + 3 < n) {
        return (V) slots[i + 3];
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  public V get(Object key) {
    final int n = slots.length;
    for (int i = 0; i < n; i += 2) {
      if (key.equals(slots[i])) {
        return (V) slots[i + 1];
      }
    }
    return null;
  }

  public ArrayMap<K, V> updated(K key, V value) {
    final int n = slots.length;
    for (int i = 0; i < n; i += 2) {
      if (key.equals(slots[i])) {
        final Object v = slots[i + 1];
        if (value == null ? v == null : value.equals(v)) {
          return this;
        } else {
          final Object[] newSlots = new Object[n];
          System.arraycopy(slots, 0, newSlots, 0, n);
          newSlots[i] = key;
          newSlots[i + 1] = value;
          return new ArrayMap<K, V>(newSlots);
        }
      }
    }
    final Object[] newSlots = new Object[n + 2];
    System.arraycopy(slots, 0, newSlots, 0, n);
    newSlots[n] = key;
    newSlots[n + 1] = value;
    return new ArrayMap<K, V>(newSlots);
  }

  public ArrayMap<K, V> removed(Object key) {
    final int n = slots.length;
    for (int i = 0; i < n; i += 1) {
      if (key.equals(slots[i])) {
        if (n == 2) {
          return empty();
        } else {
          final Object[] newSlots = new Object[n - 2];
          System.arraycopy(slots, 0, newSlots, 0, i);
          System.arraycopy(slots, i + 2, newSlots, i, (n - 2) - i);
          return new ArrayMap<K, V>(newSlots);
        }
      }
    }
    return this;
  }

  boolean isUnary() {
    return slots.length == 2;
  }

  @SuppressWarnings("unchecked")
  K unaryKey() {
    return (K) slots[0];
  }

  @SuppressWarnings("unchecked")
  V unaryValue() {
    return (V) slots[1];
  }

  @SuppressWarnings("unchecked")
  K keyAt(int index) {
    return (K) slots[index << 1];
  }

  @SuppressWarnings("unchecked")
  V valueAt(int index) {
    return (V) slots[(index << 1) + 1];
  }

  public Iterator<Map.Entry<K, V>> iterator() {
    return new ArrayMapIterator<K, V>(slots);
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ArrayMap<?, ?>) {
      final ArrayMap<K, V> that = (ArrayMap<K, V>) other;
      if (size() == that.size()) {
        final Iterator<Map.Entry<K, V>> those = that.iterator();
        while (those.hasNext()) {
          final Map.Entry<K, V> entry = those.next();
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
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(ArrayMap.class);
    }
    int a = 0;
    int b = 0;
    int c = 1;
    final Iterator<Map.Entry<K, V>> these = iterator();
    while (these.hasNext()) {
      final Map.Entry<K, V> entry = these.next();
      final int h = Murmur3.mix(Murmur3.hash(entry.getKey()), Murmur3.hash(entry.getValue()));
      a ^= h;
      b += h;
      if (h != 0) {
        c *= h;
      }
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed, a), b), c));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("ArrayMap").write('.');
    final Iterator<Map.Entry<K, V>> these = iterator();
    if (these.hasNext()) {
      Map.Entry<K, V> entry = these.next();
      output = output.write("of").write('(')
          .debug(entry.getKey()).write(", ").debug(entry.getValue());
      while (these.hasNext()) {
        entry = these.next();
        output = output.write(')').write('.').write("put").write('(')
            .debug(entry.getKey()).write(", ").debug(entry.getValue());
      }
    } else {
      output = output.write("empty").write('(');
    }
    output = output.write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;
  private static ArrayMap<Object, Object> empty;

  @SuppressWarnings("unchecked")
  public static <K, V> ArrayMap<K, V> empty() {
    if (empty == null) {
      empty = new ArrayMap<Object, Object>(new Object[0]);
    }
    return (ArrayMap<K, V>) empty;
  }

  @SuppressWarnings("unchecked")
  public static <K, V> ArrayMap<K, V> of(K key, V value) {
    return new ArrayMap<K, V>(key, value);
  }
}

final class ArrayMapIterator<K, V> implements Iterator<Map.Entry<K, V>> {
  final Object[] slots;
  int index;

  ArrayMapIterator(Object[] slots) {
    this.slots = slots;
  }

  @Override
  public boolean hasNext() {
    return index < slots.length;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Map.Entry<K, V> next() {
    if (index >= slots.length) {
      throw new NoSuchElementException();
    }
    final K key = (K) slots[index];
    final V value = (V) slots[index + 1];
    index += 2;
    return new AbstractMap.SimpleImmutableEntry<K, V>(key, value);
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}
