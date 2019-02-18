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
import java.util.Map;
import swim.util.Cursor;

final class STreeLeaf<T> extends STreePage<T> {
  final Map.Entry<Object, T>[] slots;

  STreeLeaf(Map.Entry<Object, T>[] slots) {
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
  public int arity() {
    return this.slots.length;
  }

  @Override
  public boolean contains(Object value) {
    final Map.Entry<Object, T>[] slots = this.slots;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      if (value.equals(slots[i])) {
        return true;
      }
    }
    return false;
  }

  @Override
  public int indexOf(Object value) {
    final Map.Entry<Object, T>[] slots = this.slots;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      if (value.equals(slots[i])) {
        return i;
      }
    }
    return -1;
  }

  @Override
  public int lastIndexOf(Object value) {
    final Map.Entry<Object, T>[] slots = this.slots;
    for (int i = slots.length - 1; i >= 0; i -= 1) {
      if (value.equals(slots[i])) {
        return i;
      }
    }
    return -1;
  }

  @Override
  public T get(int index) {
    final Map.Entry<Object, T> slot = this.slots[index];
    if (slot != null) {
      return slot.getValue();
    } else {
      return null;
    }
  }

  @Override
  public Map.Entry<Object, T> getEntry(int index) {
    return this.slots[index];
  }

  @Override
  public STreeLeaf<T> updated(int index, T newValue, STreeContext<T> tree) {
    if (index < 0 || index >= this.slots.length) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return updatedSlot(index, newValue);
  }

  @SuppressWarnings("unchecked")
  private STreeLeaf<T> updatedSlot(int index, T newValue) {
    final Map.Entry<Object, T>[] oldSlots = this.slots;
    final Map.Entry<Object, T> oldSlot = oldSlots[index];
    if (newValue != oldSlot.getValue()) {
      final int n = oldSlots.length;
      final Map.Entry<Object, T>[] newSlots = (Map.Entry<Object, T>[]) new Map.Entry<?, ?>[n];
      System.arraycopy(oldSlots, 0, newSlots, 0, n);
      newSlots[index] = new AbstractMap.SimpleImmutableEntry<Object, T>(oldSlot.getKey(), newValue);
      return new STreeLeaf<T>(newSlots);
    } else {
      return this;
    }
  }

  @Override
  public STreeLeaf<T> inserted(int index, T newValue, Object id, STreeContext<T> tree) {
    if (index < 0 || index > this.slots.length) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return insertedSlot(index, newValue, id, tree);
  }

  @SuppressWarnings("unchecked")
  private STreeLeaf<T> insertedSlot(int index, T newValue, Object id, STreeContext<T> tree) {
    if (id == null) {
      id = tree.identify(newValue);
    }
    final Map.Entry<Object, T>[] oldSlots = this.slots;
    final int n = oldSlots.length + 1;
    final Map.Entry<Object, T>[] newSlots = (Map.Entry<Object, T>[]) new Map.Entry<?, ?>[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, index);
    newSlots[index] = new AbstractMap.SimpleImmutableEntry<Object, T>(id, newValue);
    System.arraycopy(oldSlots, index, newSlots, index + 1, n - (index + 1));
    return new STreeLeaf<T>(newSlots);
  }

  @Override
  public STreeLeaf<T> removed(int index, STreeContext<T> tree) {
    if (index < 0 || index >= this.slots.length) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    if (this.slots.length > 1) {
      return removedSlot(index);
    } else {
      return STreeLeaf.empty();
    }
  }

  @SuppressWarnings("unchecked")
  private STreeLeaf<T> removedSlot(int index) {
    final Map.Entry<Object, T>[] oldSlots = this.slots;
    final int n = oldSlots.length - 1;
    final Map.Entry<Object, T>[] newSlots = (Map.Entry<Object, T>[]) new Map.Entry<?, ?>[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, index);
    System.arraycopy(oldSlots, index + 1, newSlots, index, n - index);
    return new STreeLeaf<T>(newSlots);
  }

  @Override
  public STreeLeaf<T> removed(Object object, STreeContext<T> tree) {
    final int index = indexOf(object);
    if (index >= 0) {
      if (this.slots.length > 1) {
        return removedSlot(index);
      } else {
        return STreeLeaf.empty();
      }
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public STreeLeaf<T> drop(int lower, STreeContext<T> tree) {
    if (lower > 0) {
      final Map.Entry<Object, T>[] oldSlots = this.slots;
      final int k = oldSlots.length;
      if (lower < k) {
        final int n = k - lower;
        final Map.Entry<Object, T>[] newSlots = (Map.Entry<Object, T>[]) new Map.Entry<?, ?>[n];
        System.arraycopy(oldSlots, lower, newSlots, 0, n);
        return new STreeLeaf<T>(newSlots);
      } else {
        return STreeLeaf.empty();
      }
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public STreeLeaf<T> take(int upper, STreeContext<T> tree) {
    final Map.Entry<Object, T>[] oldSlots = this.slots;
    if (upper < oldSlots.length) {
      if (upper > 0) {
        final Map.Entry<Object, T>[] newSlots = (Map.Entry<Object, T>[]) new Map.Entry<?, ?>[upper];
        System.arraycopy(oldSlots, 0, newSlots, 0, upper);
        return new STreeLeaf<T>(newSlots);
      } else {
        return STreeLeaf.empty();
      }
    } else {
      return this;
    }
  }

  @Override
  public STreePage<T> balanced(STreeContext<T> tree) {
    final int n = this.slots.length;
    if (n > 1 && tree.pageShouldSplit(this)) {
      final int x = n >>> 1;
      return split(x);
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public STreeNode<T> split(int x) {
    final STreePage<T>[] newPages = (STreePage<T>[]) new STreePage<?>[2];
    final STreeLeaf<T> newLeftPage = splitLeft(x);
    final STreeLeaf<T> newRightPage = splitRight(x);
    newPages[0] = newLeftPage;
    newPages[1] = newRightPage;

    final int[] newKnots = new int[1];
    newKnots[0] = x;

    return new STreeNode<T>(newPages, newKnots, this.slots.length);
  }

  @SuppressWarnings("unchecked")
  @Override
  public STreeLeaf<T> splitLeft(int x) {
    final Map.Entry<Object, T>[] oldSlots = this.slots;
    final Map.Entry<Object, T>[] newSlots = (Map.Entry<Object, T>[]) new Map.Entry<?, ?>[x];
    System.arraycopy(oldSlots, 0, newSlots, 0, x);
    return new STreeLeaf<T>(newSlots);
  }

  @SuppressWarnings("unchecked")
  @Override
  public STreeLeaf<T> splitRight(int x) {
    final Map.Entry<Object, T>[] oldSlots = this.slots;
    final int y = oldSlots.length - x;
    final Map.Entry<Object, T>[] newSlots = (Map.Entry<Object, T>[]) new Map.Entry<?, ?>[y];
    System.arraycopy(oldSlots, x, newSlots, 0, y);
    return new STreeLeaf<T>(newSlots);
  }

  @Override
  public void copyToArray(Object[] array, int offset) {
    final Map.Entry<Object, T>[] slots = this.slots;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      array[offset + i] = slots[i].getValue();
    }
  }

  @Override
  public Cursor<Map.Entry<Object, T>> entryIterator() {
    return Cursor.array(this.slots);
  }

  @Override
  public Cursor<Map.Entry<Object, T>> reverseEntryIterator() {
    return Cursor.array(this.slots, this.slots.length);
  }

  private static STreeLeaf<Object> empty;

  @SuppressWarnings("unchecked")
  public static <T> STreeLeaf<T> empty() {
    if (empty == null) {
      empty = new STreeLeaf<Object>((Map.Entry<Object, Object>[]) new Map.Entry<?, ?>[0]);
    }
    return (STreeLeaf<T>) empty;
  }
}
