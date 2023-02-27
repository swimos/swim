// Copyright 2015-2022 Swim.inc
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

import java.util.AbstractCollection;
import java.util.AbstractMap.SimpleImmutableEntry;
import java.util.AbstractSet;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToMarkup;
import swim.util.ToSource;
import swim.util.UpdatableMap;

@Public
@Since("5.0")
public final class ArrayMap<K, V> implements Iterable<Map.Entry<K, V>>, UpdatableMap<K, V>, ToMarkup, ToSource {

  final Object[] slots;

  ArrayMap(Object[] slots) {
    this.slots = slots;
  }

  @Override
  public boolean isEmpty() {
    return this.slots.length == 0;
  }

  @Override
  public int size() {
    return this.slots.length >> 1;
  }

  @Override
  public boolean containsKey(@Nullable Object key) {
    for (int i = 0; i < this.slots.length; i += 2) {
      if (Objects.equals(key, this.slots[i])) {
        return true;
      }
    }
    return false;
  }

  @Override
  public boolean containsValue(@Nullable Object value) {
    for (int i = 0; i < this.slots.length; i += 2) {
      if (Objects.equals(value, this.slots[i + 1])) {
        return true;
      }
    }
    return false;
  }

  public Map.@Nullable Entry<K, V> head() {
    if (this.slots.length > 1) {
      return new SimpleImmutableEntry<K, V>(Assume.conformsNullable(this.slots[0]),
                                            Assume.conformsNullable(this.slots[1]));
    } else {
      return null;
    }
  }

  public @Nullable K headKey() {
    if (this.slots.length > 1) {
      return Assume.conformsNullable(this.slots[0]);
    } else {
      return null;
    }
  }

  public @Nullable V headValue() {
    if (this.slots.length > 1) {
      return Assume.conformsNullable(this.slots[1]);
    } else {
      return null;
    }
  }

  public Map.@Nullable Entry<K, V> next(@Nullable Object key) {
    final int n = this.slots.length;
    if (n > 1 && key == null) {
      return new SimpleImmutableEntry<K, V>(Assume.conformsNullable(this.slots[0]),
                                            Assume.conformsNullable(this.slots[1]));
    }
    for (int i = 0; i < n; i += 2) {
      if (Objects.equals(key, this.slots[i]) && i + 3 < n) {
        return new SimpleImmutableEntry<K, V>(Assume.conformsNullable(this.slots[i + 2]),
                                              Assume.conformsNullable(this.slots[i + 3]));
      }
    }
    return null;
  }

  public @Nullable K nextKey(@Nullable Object key) {
    final int n = this.slots.length;
    if (n > 1 && key == null) {
      return Assume.conformsNullable(this.slots[0]);
    }
    for (int i = 0; i < n; i += 2) {
      if (Objects.equals(key, this.slots[i]) && i + 3 < n) {
        return Assume.conformsNullable(this.slots[i + 2]);
      }
    }
    return null;
  }

  public @Nullable V nextValue(@Nullable Object key) {
    final int n = this.slots.length;
    if (n > 1 && key == null) {
      return Assume.conformsNullable(this.slots[1]);
    }
    for (int i = 0; i < n; i += 2) {
      if (Objects.equals(key, this.slots[i]) && i + 3 < n) {
        return Assume.conformsNullable(this.slots[i + 3]);
      }
    }
    return null;
  }

  @Override
  public @Nullable V get(@Nullable Object key) {
    for (int i = 0; i < this.slots.length; i += 2) {
      if (Objects.equals(key, this.slots[i])) {
        return Assume.conformsNullable(this.slots[i + 1]);
      }
    }
    return null;
  }

  @Override
  public @Nullable V put(@Nullable K key, @Nullable V value) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void putAll(Map<? extends K, ? extends V> map) {
    throw new UnsupportedOperationException();
  }

  @Override
  public @Nullable V remove(@Nullable Object key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  @Override
  public ArrayMap<K, V> updated(@Nullable K key, @Nullable V value) {
    final Object[] oldSlots = this.slots;
    final int n = oldSlots.length;
    for (int i = 0; i < n; i += 2) {
      if (Objects.equals(key, oldSlots[i])) {
        if (Objects.equals(value, oldSlots[i + 1])) {
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

  public ArrayMap<K, V> updated(Map<? extends K, ? extends V> map) {
    ArrayMap<K, V> these = this;
    for (Map.Entry<? extends K, ? extends V> entry : map.entrySet()) {
      these = these.updated(entry.getKey(), entry.getValue());
    }
    return these;
  }

  @Override
  public ArrayMap<K, V> removed(@Nullable Object key) {
    final Object[] slots = this.slots;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      if (Objects.equals(key, slots[i])) {
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
    return this.slots.length == 2;
  }

  @Nullable K unaryKey() {
    return Assume.conformsNullable(this.slots[0]);
  }

  @Nullable V unaryValue() {
    return Assume.conformsNullable(this.slots[1]);
  }

  @Nullable K keyAt(int index) {
    return Assume.conformsNullable(this.slots[index << 1]);
  }

  @Nullable V valueAt(int index) {
    return Assume.conformsNullable(this.slots[(index << 1) + 1]);
  }

  @Override
  public void forEach(BiConsumer<? super K, ? super V> action) {
    for (int i = 0; i < this.slots.length; i += 2) {
      action.accept(Assume.conformsNullable(this.slots[i]),
                    Assume.conformsNullable(this.slots[i + 1]));
    }
  }

  @Override
  public void forEach(Consumer<? super Map.Entry<K, V>> action) {
    for (int i = 0; i < this.slots.length; i += 2) {
      action.accept(new SimpleImmutableEntry<K, V>(Assume.conformsNullable(this.slots[i]),
                                                   Assume.conformsNullable(this.slots[i + 1])));
    }
  }

  @Override
  public Set<Map.Entry<K, V>> entrySet() {
    return new ArrayMapEntrySet<K, V>(this);
  }

  @Override
  public Set<K> keySet() {
    return new ArrayMapKeySet<K, V>(this);
  }

  @Override
  public Collection<V> values() {
    return new ArrayMapValues<K, V>(this);
  }

  @Override
  public Iterator<Map.Entry<K, V>> iterator() {
    return new ArrayMapEntryIterator<K, V>(this.slots);
  }

  public Iterator<K> keyIterator() {
    return new ArrayMapKeyIterator<K>(this.slots);
  }

  public Iterator<V> valueIterator() {
    return new ArrayMapValueIterator<V>(this.slots);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map<?, ?>) {
      return this.entrySet().equals(((Map<?, ?>) other).entrySet());
    }
    return false;
  }

  @Override
  public int hashCode() {
    int code = 0;
    for (int i = 0; i < this.slots.length; i += 2) {
      code += Objects.hashCode(this.slots[i]) ^ Objects.hashCode(this.slots[i + 1]);
    }
    return code;
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginObject("ArrayMap");
    this.writeFields(notation);
    notation.endObject();
  }

  void writeFields(Notation notation) {
    for (int i = 0; i <  this.slots.length; i += 2) {
      notation.appendField(this.slots[i], this.slots[i + 1]);
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("ArrayMap", "empty").endInvoke();
    this.writeUpdated(notation);
  }

  void writeUpdated(Notation notation) {
    for (int i = 0; i < this.slots.length; i += 2) {
      notation.beginInvoke("updated")
              .appendArgument(this.slots[i])
              .appendArgument(this.slots[i + 1])
              .endInvoke();
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final ArrayMap<Object, Object> EMPTY = new ArrayMap<Object, Object>(new Object[0]);

  public static <K, V> ArrayMap<K, V> empty() {
    return Assume.conforms(EMPTY);
  }

  public static <K, V> ArrayMap<K, V> of(@Nullable Object... keyValuePairs) {
    Objects.requireNonNull(keyValuePairs);
    if (keyValuePairs.length % 2 != 0) {
      throw new IllegalArgumentException("Odd number of key-value pairs");
    }
    return new ArrayMap<K, V>(keyValuePairs);
  }

}

final class ArrayMapEntryIterator<K, V> implements Iterator<Map.Entry<K, V>> {

  final Object[] slots;
  int index;

  ArrayMapEntryIterator(Object[] slots) {
    this.slots = slots;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index + 1 < this.slots.length;
  }

  @Override
  public Map.Entry<K, V> next() {
    final int index = this.index;
    if (index + 1 >= this.slots.length) {
      throw new NoSuchElementException();
    }
    this.index = index + 2;
    final K key = Assume.conformsNullable(this.slots[index]);
    final V value = Assume.conformsNullable(this.slots[index + 1]);
    return new SimpleImmutableEntry<K, V>(key, value);
  }

}

final class ArrayMapEntrySet<K, V> extends AbstractSet<Map.Entry<K, V>> {

  final ArrayMap<K, V> map;

  ArrayMapEntrySet(ArrayMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Iterator<Map.Entry<K, V>> iterator() {
    return this.map.iterator();
  }

}

final class ArrayMapKeyIterator<K> implements Iterator<K> {

  final Object[] slots;
  int index;

  ArrayMapKeyIterator(Object[] slots) {
    this.slots = slots;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index + 1 < this.slots.length;
  }

  @Override
  public @Nullable K next() {
    final int index = this.index;
    if (index + 1 >= this.slots.length) {
      throw new NoSuchElementException();
    }
    this.index = index + 2;
    return Assume.conformsNullable(this.slots[index]);
  }

}

final class ArrayMapKeySet<K, V> extends AbstractSet<K> {

  final ArrayMap<K, V> map;

  ArrayMapKeySet(ArrayMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Iterator<K> iterator() {
    return this.map.keyIterator();
  }

}

final class ArrayMapValueIterator<V> implements Iterator<V> {

  final Object[] slots;
  int index;

  ArrayMapValueIterator(Object[] slots) {
    this.slots = slots;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index + 1 < this.slots.length;
  }

  @Override
  public @Nullable V next() {
    final int index = this.index;
    if (index + 1 >= this.slots.length) {
      throw new NoSuchElementException();
    }
    this.index = index + 2;
    return Assume.conformsNullable(this.slots[index + 1]);
  }

}

final class ArrayMapValues<K, V> extends AbstractCollection<V> {

  final ArrayMap<K, V> map;

  ArrayMapValues(ArrayMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Iterator<V> iterator() {
    return this.map.valueIterator();
  }

}
