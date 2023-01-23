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

  public boolean isEmpty() {
    return this.slots.length == 0;
  }

  public int size() {
    return this.slots.length;
  }

  public boolean contains(Object elem) {
    final int n = this.slots.length;
    for (int i = 0; i < n; i += 1) {
      if (elem.equals(this.slots[i])) {
        return true;
      }
    }
    return false;
  }

  @SuppressWarnings("unchecked")
  public T head() {
    if (this.slots.length > 0) {
      return (T) this.slots[0];
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  public T next(Object elem) {
    final int n = this.slots.length;
    if (n > 0 && elem == null) {
      return (T) this.slots[0];
    }
    for (int i = 0; i < n; i += 1) {
      if (elem.equals(this.slots[i]) && i + 1 < n) {
        return (T) this.slots[i + 1];
      }
    }
    return null;
  }

  public ArraySet<T> added(T elem) {
    final Object[] oldSlots = this.slots;
    final int n = oldSlots.length;
    for (int i = 0; i < n; i += 1) {
      if (elem.equals(oldSlots[i])) {
        return this;
      }
    }
    final Object[] newSlots = new Object[n + 1];
    System.arraycopy(oldSlots, 0, newSlots, 0, n);
    newSlots[n] = elem;
    return new ArraySet<T>(newSlots);
  }

  public ArraySet<T> removed(T elem) {
    final Object[] oldSlots = this.slots;
    final int n = oldSlots.length;
    for (int i = 0; i < n; i += 1) {
      if (elem.equals(oldSlots[i])) {
        if (n == 1) {
          return empty();
        } else {
          final Object[] newSlots = new Object[n - 1];
          System.arraycopy(oldSlots, 0, newSlots, 0, i);
          System.arraycopy(oldSlots, i + 1, newSlots, i, (n - 1) - i);
          return new ArraySet<T>(newSlots);
        }
      }
    }
    return this;
  }

  boolean isUnary() {
    return this.slots.length == 1;
  }

  @SuppressWarnings("unchecked")
  T unaryElem() {
    return (T) this.slots[0];
  }

  @SuppressWarnings("unchecked")
  T elemAt(int index) {
    return (T) this.slots[index];
  }

  public Iterator<T> iterator() {
    return new ArraySetIterator<T>(this.slots);
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ArraySet<?>) {
      final ArraySet<T> that = (ArraySet<T>) other;
      if (this.size() == that.size()) {
        final Iterator<T> those = that.iterator();
        while (those.hasNext()) {
          if (!this.contains(those.next())) {
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
    if (ArraySet.hashSeed == 0) {
      ArraySet.hashSeed = Murmur3.seed(ArraySet.class);
    }
    int a = 0;
    int b = 0;
    int c = 1;
    final Iterator<T> these = this.iterator();
    while (these.hasNext()) {
      final int h = Murmur3.hash(these.next());
      a ^= h;
      b += h;
      if (h != 0) {
        c *= h;
      }
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(ArraySet.hashSeed, a), b), c));
  }

  @Override
  public <U> Output<U> debug(Output<U> output) {
    output = output.write("ArraySet").write('.');
    final Iterator<T> these = this.iterator();
    if (these.hasNext()) {
      output = output.write("of").write('(').debug(these.next());
      while (these.hasNext()) {
        output = output.write(", ").debug(these.next());
      }
    } else {
      output = output.write("empty").write('(');
    }
    output = output.write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static ArraySet<Object> empty;

  @SuppressWarnings("unchecked")
  public static <T> ArraySet<T> empty() {
    if (ArraySet.empty == null) {
      ArraySet.empty = new ArraySet<Object>(new Object[0]);
    }
    return (ArraySet<T>) ArraySet.empty;
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
    return this.index < this.slots.length;
  }

  @SuppressWarnings("unchecked")
  @Override
  public T next() {
    final int index = this.index;
    if (index >= this.slots.length) {
      throw new NoSuchElementException();
    }
    final T elem = (T) this.slots[index];
    this.index = index + 1;
    return elem;
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }

}
