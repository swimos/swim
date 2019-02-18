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

import java.util.Iterator;
import java.util.NoSuchElementException;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Murmur3;

final class ArraySet<T> implements Debug {
  final Object[] slots;

  ArraySet(Object[] slots) {
    this.slots = slots;
  }

  ArraySet(T elem) {
    slots = new Object[1];
    slots[0] = elem;
  }

  ArraySet(T elem0, T elem1) {
    slots = new Object[2];
    slots[0] = elem0;
    slots[1] = elem1;
  }

  public boolean isEmpty() {
    return slots.length == 0;
  }

  public int size() {
    return slots.length;
  }

  public boolean contains(Object elem) {
    final int n = slots.length;
    for (int i = 0; i < n; i += 1) {
      if (elem.equals(slots[i])) {
        return true;
      }
    }
    return false;
  }

  @SuppressWarnings("unchecked")
  public T head() {
    if (slots.length > 0) {
      return (T) slots[0];
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  public T next(Object elem) {
    final int n = slots.length;
    if (n > 0 && elem == null) {
      return (T) slots[0];
    }
    for (int i = 0; i < n; i += 1) {
      if (elem.equals(slots[i]) && i + 1 < n) {
        return (T) slots[i + 1];
      }
    }
    return null;
  }

  public ArraySet<T> added(T elem) {
    final int n = slots.length;
    for (int i = 0; i < n; i += 1) {
      if (elem.equals(slots[i])) {
        return this;
      }
    }
    final Object[] newSlots = new Object[n + 1];
    System.arraycopy(slots, 0, newSlots, 0, n);
    newSlots[n] = elem;
    return new ArraySet<T>(newSlots);
  }

  public ArraySet<T> removed(T elem) {
    final int n = slots.length;
    for (int i = 0; i < n; i += 1) {
      if (elem.equals(slots[i])) {
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
    return slots.length == 1;
  }

  @SuppressWarnings("unchecked")
  T unaryElem() {
    return (T) slots[0];
  }

  @SuppressWarnings("unchecked")
  T elemAt(int index) {
    return (T) slots[index];
  }

  public Iterator<T> iterator() {
    return new ArraySetIterator<T>(slots);
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ArraySet<?>) {
      final ArraySet<T> that = (ArraySet<T>) other;
      if (size() == that.size()) {
        final Iterator<T> those = that.iterator();
        while (those.hasNext()) {
          if (!contains(those.next())) {
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
      hashSeed = Murmur3.seed(ArraySet.class);
    }
    int a = 0;
    int b = 0;
    int c = 1;
    final Iterator<T> these = iterator();
    while (these.hasNext()) {
      final int h = Murmur3.hash(these.next());
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
    output = output.write("ArraySet").write('.');
    final Iterator<T> these = iterator();
    if (these.hasNext()) {
      output = output.write("of").write('(').debug(these.next());
      while (these.hasNext()) {
        output = output.write(", ").debug(these.next());
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
  private static ArraySet<Object> empty;

  @SuppressWarnings("unchecked")
  public static <T> ArraySet<T> empty() {
    if (empty == null) {
      empty = new ArraySet<Object>(new Object[0]);
    }
    return (ArraySet<T>) empty;
  }

  @SuppressWarnings("unchecked")
  public static <T> ArraySet<T> of(T... elems) {
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
    return index < slots.length;
  }

  @SuppressWarnings("unchecked")
  @Override
  public T next() {
    if (index >= slots.length) {
      throw new NoSuchElementException();
    }
    final T elem = (T) slots[index];
    index += 1;
    return elem;
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}
