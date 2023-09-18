// Copyright 2015-2023 Nstream, inc.
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

  public boolean isEmpty() {
    return this.slots.length == 0;
  }

  public int size() {
    return this.slots.length >> 1;
  }

  public boolean containsKey(Object key) {
    final int n = this.slots.length;
    for (int i = 0; i < n; i += 2) {
      if (key.equals(this.slots[i])) {
        return true;
      }
    }
    return false;
  }

  public boolean containsValue(Object value) {
    final int n = this.slots.length;
    for (int i = 0; i < n; i += 2) {
      final Object v = this.slots[i + 1];
      if (value == null ? v == null : value.equals(v)) {
        return true;
      }
    }
    return false;
  }

  @SuppressWarnings("unchecked")
  public Map.Entry<K, V> head() {
    if (this.slots.length > 1) {
      return new AbstractMap.SimpleImmutableEntry<K, V>((K) this.slots[0], (V) this.slots[1]);
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  public K headKey() {
    if (this.slots.length > 1) {
      return (K) this.slots[0];
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  public V headValue() {
    if (this.slots.length > 1) {
      return (V) this.slots[1];
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  public Map.Entry<K, V> next(Object key) {
    final int n = this.slots.length;
    if (n > 1 && key == null) {
      return new AbstractMap.SimpleImmutableEntry<K, V>((K) this.slots[0], (V) this.slots[1]);
    }
    for (int i = 0; i < n; i += 2) {
      if (key.equals(this.slots[i]) && i + 3 < n) {
        return new AbstractMap.SimpleImmutableEntry<K, V>((K) this.slots[i + 2], (V) this.slots[i + 3]);
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  public K nextKey(Object key) {
    final int n = this.slots.length;
    if (n > 1 && key == null) {
      return (K) this.slots[0];
    }
    for (int i = 0; i < n; i += 2) {
      if (key.equals(this.slots[i]) && i + 3 < n) {
        return (K) this.slots[i + 2];
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  public V nextValue(Object key) {
    final int n = this.slots.length;
    if (n > 1 && key == null) {
      return (V) this.slots[1];
    }
    for (int i = 0; i < n; i += 2) {
      if (key.equals(this.slots[i]) && i + 3 < n) {
        return (V) this.slots[i + 3];
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  public V get(Object key) {
    final int n = this.slots.length;
    for (int i = 0; i < n; i += 2) {
      if (key.equals(this.slots[i])) {
        return (V) this.slots[i + 1];
      }
    }
    return null;
  }

  public ArrayMap<K, V> updated(K key, V value) {
    final Object[] oldSlots = this.slots;
    final int n = oldSlots.length;
    for (int i = 0; i < n; i += 2) {
      if (key.equals(oldSlots[i])) {
        final Object v = oldSlots[i + 1];
        if (value == null ? v == null : value.equals(v)) {
          return this;
        } else {
          final Object[] newSlots = new Object[n];
          System.arraycopy(oldSlots, 0, newSlots, 0, n);
          newSlots[i] = key;
          newSlots[i + 1] = value;
          return new ArrayMap<K, V>(newSlots);
        }
      }
    }
    final Object[] newSlots = new Object[n + 2];
    System.arraycopy(oldSlots, 0, newSlots, 0, n);
    newSlots[n] = key;
    newSlots[n + 1] = value;
    return new ArrayMap<K, V>(newSlots);
  }

  public ArrayMap<K, V> removed(Object key) {
    final Object[] oldSlots = this.slots;
    final int n = oldSlots.length;
    for (int i = 0; i < n; i += 1) {
      if (key.equals(oldSlots[i])) {
        if (n == 2) {
          return empty();
        } else {
          final Object[] newSlots = new Object[n - 2];
          System.arraycopy(oldSlots, 0, newSlots, 0, i);
          System.arraycopy(oldSlots, i + 2, newSlots, i, (n - 2) - i);
          return new ArrayMap<K, V>(newSlots);
        }
      }
    }
    return this;
  }

  boolean isUnary() {
    return this.slots.length == 2;
  }

  @SuppressWarnings("unchecked")
  K unaryKey() {
    return (K) this.slots[0];
  }

  @SuppressWarnings("unchecked")
  V unaryValue() {
    return (V) this.slots[1];
  }

  @SuppressWarnings("unchecked")
  K keyAt(int index) {
    return (K) this.slots[index << 1];
  }

  @SuppressWarnings("unchecked")
  V valueAt(int index) {
    return (V) this.slots[(index << 1) + 1];
  }

  public Iterator<Map.Entry<K, V>> iterator() {
    return new ArrayMapIterator<K, V>(this.slots);
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ArrayMap<?, ?>) {
      final ArrayMap<K, V> that = (ArrayMap<K, V>) other;
      if (this.size() == that.size()) {
        final Iterator<Map.Entry<K, V>> those = that.iterator();
        while (those.hasNext()) {
          final Map.Entry<K, V> entry = those.next();
          final V value = this.get(entry.getKey());
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

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (ArrayMap.hashSeed == 0) {
      ArrayMap.hashSeed = Murmur3.seed(ArrayMap.class);
    }
    int a = 0;
    int b = 0;
    int c = 1;
    final Iterator<Map.Entry<K, V>> these = this.iterator();
    while (these.hasNext()) {
      final Map.Entry<K, V> entry = these.next();
      final int h = Murmur3.mix(Murmur3.hash(entry.getKey()), Murmur3.hash(entry.getValue()));
      a ^= h;
      b += h;
      if (h != 0) {
        c *= h;
      }
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(ArrayMap.hashSeed, a), b), c));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("ArrayMap").write('.').write("empty").write('(').write(')');
    final Iterator<Map.Entry<K, V>> these = this.iterator();
    while (these.hasNext()) {
      final Map.Entry<K, V> entry = these.next();
      output = output.write('.').write("updated").write('(').debug(entry.getKey())
                     .write(", ").debug(entry.getValue()).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static ArrayMap<Object, Object> empty;

  @SuppressWarnings("unchecked")
  public static <K, V> ArrayMap<K, V> empty() {
    if (ArrayMap.empty == null) {
      ArrayMap.empty = new ArrayMap<Object, Object>(new Object[0]);
    }
    return (ArrayMap<K, V>) ArrayMap.empty;
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
    return this.index + 1 < this.slots.length;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Map.Entry<K, V> next() {
    final int index = this.index;
    if (index + 1 >= this.slots.length) {
      throw new NoSuchElementException();
    }
    final K key = (K) this.slots[index];
    final V value = (V) this.slots[index + 1];
    this.index = index + 2;
    return new AbstractMap.SimpleImmutableEntry<K, V>(key, value);
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }

}
