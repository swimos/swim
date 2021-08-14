// Copyright 2015-2021 Swim inc.
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
import swim.util.CombinerFunction;
import swim.util.OrderedMapCursor;

final class BTreeLeaf<K, V, U> extends BTreePage<K, V, U> {

  final Map.Entry<K, V>[] slots;
  final U fold;

  BTreeLeaf(Map.Entry<K, V>[] slots, U fold) {
    this.slots = slots;
    this.fold = fold;
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
  public U fold() {
    return this.fold;
  }

  @Override
  public K minKey() {
    return this.slots[0].getKey();
  }

  @Override
  public K maxKey() {
    return this.slots[this.slots.length - 1].getKey();
  }

  @Override
  public boolean containsKey(Object key, BTreeContext<K, V> tree) {
    return this.lookup(key, tree) >= 0;
  }

  @Override
  public boolean containsValue(Object value) {
    for (int i = 0, n = this.slots.length; i < n; i += 1) {
      if (value.equals(this.slots[i].getValue())) {
        return true;
      }
    }
    return false;
  }

  @Override
  public int indexOf(Object key, BTreeContext<K, V> tree) {
    return this.lookup(key, tree);
  }

  @Override
  public V get(Object key, BTreeContext<K, V> tree) {
    final int x = this.lookup(key, tree);
    if (x >= 0) {
      return this.slots[x].getValue();
    } else {
      return null;
    }
  }

  @Override
  public Map.Entry<K, V> getEntry(Object key, BTreeContext<K, V> tree) {
    final int x = this.lookup(key, tree);
    if (x >= 0) {
      return this.slots[x];
    } else {
      return null;
    }
  }

  @Override
  public Map.Entry<K, V> getIndex(int index) {
    return this.slots[index];
  }

  @Override
  public Map.Entry<K, V> firstEntry() {
    if (this.slots.length != 0) {
      return this.slots[0];
    } else {
      return null;
    }
  }

  @Override
  public Map.Entry<K, V> lastEntry() {
    if (this.slots.length != 0) {
      return this.slots[this.slots.length - 1];
    } else {
      return null;
    }
  }

  @Override
  public Map.Entry<K, V> nextEntry(K key, BTreeContext<K, V> tree) {
    int x = this.lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    if (0 <= x && x < this.slots.length) {
      return this.slots[x];
    } else {
      return null;
    }
  }

  @Override
  public Map.Entry<K, V> previousEntry(K key, BTreeContext<K, V> tree) {
    int x = this.lookup(key, tree);
    if (x >= 0) {
      x -= 1;
    } else {
      x = -(x + 2);
    }
    if (0 <= x && x < this.slots.length) {
      return this.slots[x];
    } else {
      return null;
    }
  }

  @Override
  public BTreeLeaf<K, V, U> updated(K key, V newValue, BTreeContext<K, V> tree) {
    int x = this.lookup(key, tree);
    if (x >= 0) {
      return this.updatedSlot(x, key, newValue);
    } else {
      x = -(x + 1);
      return this.insertedSlot(x, key, newValue);
    }
  }

  @SuppressWarnings("unchecked")
  private BTreeLeaf<K, V, U> updatedSlot(int x, K key, V newValue) {
    final Map.Entry<K, V>[] oldSlots = this.slots;
    if (newValue != oldSlots[x].getValue()) {
      final Map.Entry<K, V>[] newSlots = (Map.Entry<K, V>[]) new Map.Entry<?, ?>[oldSlots.length];
      System.arraycopy(oldSlots, 0, newSlots, 0, oldSlots.length);
      newSlots[x] = new AbstractMap.SimpleImmutableEntry<K, V>(key, newValue);
      return new BTreeLeaf<K, V, U>(newSlots, null);
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  private BTreeLeaf<K, V, U> insertedSlot(int x, K key, V newValue) {
    final Map.Entry<K, V>[] oldSlots = this.slots;
    final int n = oldSlots.length + 1;
    final Map.Entry<K, V>[] newSlots = (Map.Entry<K, V>[]) new Map.Entry<?, ?>[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, x);
    newSlots[x] = new AbstractMap.SimpleImmutableEntry<K, V>(key, newValue);
    System.arraycopy(oldSlots, x, newSlots, x + 1, n - (x + 1));
    return new BTreeLeaf<K, V, U>(newSlots, null);
  }

  @Override
  public BTreeLeaf<K, V, U> removed(Object key, BTreeContext<K, V> tree) {
    final int x = this.lookup(key, tree);
    if (x >= 0) {
      if (this.slots.length > 1) {
        return this.removedSlot(x);
      } else {
        return BTreeLeaf.empty();
      }
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  private BTreeLeaf<K, V, U> removedSlot(int x) {
    final Map.Entry<K, V>[] oldSlots = this.slots;
    final int n = oldSlots.length - 1;
    final Map.Entry<K, V>[] newSlots = (Map.Entry<K, V>[]) new Map.Entry<?, ?>[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, x);
    System.arraycopy(oldSlots, x + 1, newSlots, x, n - x);
    return new BTreeLeaf<K, V, U>(newSlots, null);
  }

  @SuppressWarnings("unchecked")
  @Override
  public BTreeLeaf<K, V, U> drop(int lower, BTreeContext<K, V> tree) {
    if (lower > 0) {
      final Map.Entry<K, V>[] oldSlots = this.slots;
      final int k = oldSlots.length;
      if (lower < k) {
        final int n = k - lower;
        final Map.Entry<K, V>[] newSlots = (Map.Entry<K, V>[]) new Map.Entry<?, ?>[n];
        System.arraycopy(oldSlots, lower, newSlots, 0, n);
        return new BTreeLeaf<K, V, U>(newSlots, null);
      } else {
        return BTreeLeaf.empty();
      }
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public BTreeLeaf<K, V, U> take(int upper, BTreeContext<K, V> tree) {
    final Map.Entry<K, V>[] oldSlots = this.slots;
    if (upper < oldSlots.length) {
      if (upper > 0) {
        final Map.Entry<K, V>[] newSlots = (Map.Entry<K, V>[]) new Map.Entry<?, ?>[upper];
        System.arraycopy(oldSlots, 0, newSlots, 0, upper);
        return new BTreeLeaf<K, V, U>(newSlots, null);
      } else {
        return BTreeLeaf.empty();
      }
    } else {
      return this;
    }
  }

  @Override
  public BTreePage<K, V, U> balanced(BTreeContext<K, V> tree) {
    final int n = this.slots.length;
    if (n > 1 && tree.pageShouldSplit(this)) {
      final int x = n >>> 1;
      return this.split(x);
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public BTreeNode<K, V, U> split(int x) {
    final BTreePage<K, V, U>[] newPages = (BTreePage<K, V, U>[]) new BTreePage<?, ?, ?>[2];
    final BTreeLeaf<K, V, U> newLeftPage = this.splitLeft(x);
    final BTreeLeaf<K, V, U> newRightPage = this.splitRight(x);
    newPages[0] = newLeftPage;
    newPages[1] = newRightPage;

    final K[] newKnots = (K[]) new Object[1];
    newKnots[0] = newRightPage.minKey();

    return new BTreeNode<K, V, U>(newPages, newKnots, null, this.slots.length);
  }

  @SuppressWarnings("unchecked")
  @Override
  public BTreeLeaf<K, V, U> splitLeft(int x) {
    final Map.Entry<K, V>[] oldSlots = this.slots;
    final Map.Entry<K, V>[] newSlots = (Map.Entry<K, V>[]) new Map.Entry<?, ?>[x];
    System.arraycopy(oldSlots, 0, newSlots, 0, x);
    return new BTreeLeaf<K, V, U>(newSlots, null);
  }

  @SuppressWarnings("unchecked")
  @Override
  public BTreeLeaf<K, V, U> splitRight(int x) {
    final Map.Entry<K, V>[] oldSlots = this.slots;
    final int y = oldSlots.length - x;
    final Map.Entry<K, V>[] newSlots = (Map.Entry<K, V>[]) new Map.Entry<?, ?>[y];
    System.arraycopy(oldSlots, x, newSlots, 0, y);
    return new BTreeLeaf<K, V, U>(newSlots, null);
  }

  @Override
  public BTreeLeaf<K, V, U> reduced(U identity, CombinerFunction<? super V, U> accumulator,
                                    CombinerFunction<U, U> combiner) {
    if (this.fold == null) {
      U fold = identity;
      for (int i = 0, n = this.slots.length; i < n; i += 1) {
        fold = accumulator.combine(fold, this.slots[i].getValue());
      }
      return new BTreeLeaf<K, V, U>(this.slots, fold);
    } else {
      return this;
    }
  }

  @Override
  public OrderedMapCursor<K, V> iterator() {
    return new BTreeLeafCursor<K, V>(this.slots, 0, this.slots.length);
  }

  @Override
  public OrderedMapCursor<K, V> reverseIterator() {
    return new BTreeLeafCursor<K, V>(this.slots, this.slots.length, this.slots.length);
  }

  protected int lookup(Object key, BTreeContext<K, V> tree) {
    int lo = 0;
    int hi = this.slots.length - 1;
    while (lo <= hi) {
      final int mid = (lo + hi) >>> 1;
      final int order = tree.compareKey(key, this.slots[mid].getKey());
      if (order > 0) {
        lo = mid + 1;
      } else if (order < 0) {
        hi = mid - 1;
      } else {
        return mid;
      }
    }
    return -(lo + 1);
  }

  private static BTreeLeaf<Object, Object, Object> empty;

  @SuppressWarnings("unchecked")
  public static <K, V, U> BTreeLeaf<K, V, U> empty() {
    if (BTreeLeaf.empty == null) {
      BTreeLeaf.empty = new BTreeLeaf<Object, Object, Object>((Map.Entry<Object, Object>[]) new Map.Entry<?, ?>[0], null);
    }
    return (BTreeLeaf<K, V, U>) BTreeLeaf.empty;
  }

}
