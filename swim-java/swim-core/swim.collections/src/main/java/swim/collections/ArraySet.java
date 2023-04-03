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

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.function.Consumer;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToMarkup;
import swim.util.ToSource;
import swim.util.UpdatableSet;

@Public
@Since("5.0")
public final class ArraySet<T> implements UpdatableSet<T>, ToMarkup, ToSource {

  final Object[] slots;

  ArraySet(Object[] slots) {
    this.slots = slots;
  }

  @Override
  public boolean isEmpty() {
    return this.slots.length == 0;
  }

  @Override
  public int size() {
    return this.slots.length;
  }

  @Override
  public boolean contains(@Nullable Object elem) {
    for (int i = 0; i < this.slots.length; i += 1) {
      if (Objects.equals(elem, this.slots[i])) {
        return true;
      }
    }
    return false;
  }

  @Override
  public boolean containsAll(Collection<?> elems) {
    for (Object elem : elems) {
      if (!this.contains(elem)) {
        return false;
      }
    }
    return true;
  }

  public @Nullable T head() {
    if (this.slots.length > 0) {
      return Assume.conformsNullable(this.slots[0]);
    } else {
      return null;
    }
  }

  public @Nullable T next(@Nullable Object elem) {
    final int n = this.slots.length;
    if (n > 0 && elem == null) {
      return Assume.conformsNullable(this.slots[0]);
    }
    for (int i = 0; i < n; i += 1) {
      if (Objects.equals(elem, this.slots[i]) && i + 1 < n) {
        return Assume.conformsNullable(this.slots[i + 1]);
      }
    }
    return null;
  }

  @Override
  public boolean add(@Nullable T elem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean addAll(Collection<? extends T> elems) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean remove(@Nullable Object elem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean removeAll(Collection<?> elems) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean retainAll(Collection<?> elems) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  @Override
  public ArraySet<T> added(@Nullable T elem) {
    final Object[] oldSlots = this.slots;
    final int n = oldSlots.length;
    for (int i = 0; i < n; i += 1) {
      if (Objects.equals(elem, oldSlots[i])) {
        return this;
      }
    }
    final Object[] newSlots = new Object[n + 1];
    System.arraycopy(oldSlots, 0, newSlots, 0, n);
    newSlots[n] = elem;
    return new ArraySet<T>(newSlots);
  }

  public ArraySet<T> added(Collection<? extends T> elems) {
    ArraySet<T> these = this;
    for (T elem : elems) {
      these = these.added(elem);
    }
    return these;
  }

  @Override
  public ArraySet<T> removed(@Nullable Object elem) {
    final Object[] slots = this.slots;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      if (Objects.equals(elem, slots[i])) {
        if (n == 1) {
          return empty();
        } else {
          final Object[] newSlots = new Object[n - 1];
          System.arraycopy(slots, 0, newSlots, 0, i);
          System.arraycopy(slots, i + 1, newSlots, i, (n - 1) - i);
          return new ArraySet<T>(newSlots);
        }
      }
    }
    return this;
  }

  boolean isUnary() {
    return this.slots.length == 1;
  }

  @Nullable T unaryElem() {
    return Assume.conformsNullable(this.slots[0]);
  }

  @Nullable T elemAt(int index) {
    return Assume.conformsNullable(this.slots[index]);
  }

  @Override
  public Object[] toArray() {
    final Object[] slots = this.slots;
    final int n = slots.length;
    final Object[] array = new Object[n];
    System.arraycopy(slots, 0, array, 0, n);
    return array;
  }

  @Override
  public <U> U[] toArray(U[] array) {
    final Object[] slots = this.slots;
    final int n = slots.length;
    if (array.length < n) {
      array = Assume.conforms(Array.newInstance(array.getClass().getComponentType(), n));
    }
    System.arraycopy(slots, 0, array, 0, n);
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  @Override
  public void forEach(Consumer<? super T> action) {
    for (int i = 0; i < this.slots.length; i += 1) {
      action.accept(Assume.conformsNullable(this.slots[i]));
    }
  }

  @Override
  public Iterator<T> iterator() {
    return new ArraySetIterator<T>(this.slots);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Set<?> that && this.size() == that.size()) {
      final Iterator<?> those = that.iterator();
      while (those.hasNext()) {
        if (!this.contains(those.next())) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  @Override
  public int hashCode() {
    int code = 0;
    for (int i = 0; i < this.slots.length; i += 1) {
      code += Objects.hashCode(this.slots[i]);
    }
    return code;
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginArray("ArraySet");
    this.writeElements(notation);
    notation.endArray();
  }

  void writeElements(Notation notation) {
    for (int i = 0; i < this.slots.length; i += 1) {
      notation.appendElement(this.slots[i]);
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.isEmpty()) {
      notation.beginInvoke("ArraySet", "empty").endInvoke();
    } else {
      notation.beginInvoke("ArraySet", "of");
      this.writeArguments(notation);
      notation.endInvoke();
    }
  }

  void writeArguments(Notation notation) {
    for (int i = 0; i < this.slots.length; i += 1) {
      notation.appendArgument(this.slots[i]);
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final ArraySet<Object> EMPTY = new ArraySet<Object>(new Object[0]);

  public static <T> ArraySet<T> empty() {
    return Assume.conforms(EMPTY);
  }

  @SuppressWarnings("unchecked")
  public static <T> ArraySet<T> of(@Nullable T... elems) {
    Objects.requireNonNull(elems);
    final int n = elems.length;
    final Object[] slots = new Object[n];
    System.arraycopy(elems, 0, slots, 0, n);
    return new ArraySet<T>(slots);
  }

}

final class ArraySetIterator<T> implements Iterator<T> {

  final Object[] slots;
  int index;

  ArraySetIterator(Object[] slots) {
    this.slots = slots;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.slots.length;
  }

  @Override
  public @Nullable T next() {
    final int index = this.index;
    if (index >= this.slots.length) {
      throw new NoSuchElementException();
    }
    this.index = index + 1;
    return Assume.conformsNullable(this.slots[index]);
  }

}
