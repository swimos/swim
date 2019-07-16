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

import java.lang.reflect.Array;
import java.util.AbstractList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Cursor;
import swim.util.KeyedList;
import swim.util.Murmur3;

/**
 * Mutable, thread-safe {@link KeyedList} backed by an S-Tree.
 */
public class STreeList<T> extends STreeContext<T> implements KeyedList<T>, Cloneable, Debug {
  volatile STreePage<T> root;

  protected STreeList(STreePage<T> root) {
    this.root = root;
  }

  public STreeList() {
    this(STreePage.<T>empty());
  }

  @Override
  public boolean isEmpty() {
    return this.root.isEmpty();
  }

  @Override
  public int size() {
    return this.root.size();
  }

  @Override
  public boolean contains(Object value) {
    return this.root.contains(value);
  }

  @Override
  public boolean containsAll(Collection<?> values) {
    final STreePage<T> root = this.root;
    for (Object value : values) {
      if (!root.contains(value)) {
        return false;
      }
    }
    return true;
  }

  @Override
  public int indexOf(Object value) {
    return this.root.indexOf(value);
  }

  @Override
  public int lastIndexOf(Object value) {
    return this.root.lastIndexOf(value);
  }

  @Override
  public T get(int index) {
    return get(index, null);
  }

  @Override
  public T get(int index, Object key) {
    if (key != null) {
      index = lookup(index, key);
      if (index < 0) {
        return null;
      }
    }
    return this.root.get(index);
  }

  @Override
  public Map.Entry<Object, T> getEntry(int index) {
    return getEntry(index, null);
  }

  @Override
  public Map.Entry<Object, T> getEntry(int index, Object key) {
    if (key != null) {
      index = lookup(index, key);
      if (index < 0) {
        return null;
      }
    }
    return size() <= index ? null : this.root.getEntry(index);
  }

  @Override
  public T set(int index, T newValue) {
    return set(index, newValue, null);
  }

  @Override
  public T set(int index, T newValue, Object key) {
    if (key != null) {
      index = lookup(index, key);
      if (index < 0) {
        throw new NoSuchElementException(key.toString());
      }
    }
    do {
      final STreePage<T> oldRoot = this.root;
      if (index < 0 || index >= oldRoot.size()) {
        throw new IndexOutOfBoundsException(Integer.toString(index));
      }
      final STreePage<T> newRoot = oldRoot.updated(index, newValue, this);
      if (oldRoot != newRoot) {
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          return oldRoot.get(index);
        }
      } else {
        return null;
      }
    } while (true);
  }

  @Override
  public boolean add(T newValue) {
    return add(newValue, null);
  }

  @Override
  public boolean add(T newValue, Object key) {
    do {
      final STreePage<T> oldRoot = this.root;
      final STreePage<T> newRoot = oldRoot.appended(newValue, key, this).balanced(this);
      if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
        return true;
      }
    } while (true);
  }

  @Override
  public boolean addAll(Collection<? extends T> newValues) {
    boolean modified = false;
    for (T newValue : newValues) {
      add(newValue);
      modified = true;
    }
    return modified;
  }

  @Override
  public void add(int index, T newValue) {
    add(index, newValue, null);
  }

  @Override
  public void add(int index, T newValue, Object key) {
    do {
      final STreePage<T> oldRoot = this.root;
      if (index < 0 || index > oldRoot.size()) {
        throw new IndexOutOfBoundsException(Integer.toString(index));
      }
      final STreePage<T> newRoot = oldRoot.inserted(index, newValue, key, this).balanced(this);
      if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
        return;
      }
    } while (true);
  }

  @Override
  public boolean addAll(int index, Collection<? extends T> newValues) {
    boolean modified = false;
    for (T newValue : newValues) {
      add(index, newValue);
      index += 1;
      modified = true;
    }
    return modified;
  }

  @Override
  public T remove(int index) {
    return remove(index, null);
  }

  @Override
  public T remove(int index, Object key) {
    if (key != null) {
      index = lookup(index, key);
      if (index < 0) {
        return null;
      }
    }
    do {
      final STreePage<T> oldRoot = this.root;
      if (index < 0 || index > oldRoot.size()) {
        return null;
      }
      final STreePage<T> newRoot = oldRoot.removed(index, this);
      if (oldRoot != newRoot) {
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          return oldRoot.get(index);
        }
      } else {
        return null;
      }
    } while (true);
  }

  @Override
  public boolean remove(Object value) {
    do {
      final STreePage<T> oldRoot = this.root;
      final STreePage<T> newRoot = oldRoot.removed(value, this);
      if (oldRoot != newRoot) {
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          return true;
        }
      } else {
        return false;
      }
    } while (true);
  }

  @Override
  public boolean removeAll(Collection<?> values) {
    do {
      final STreePage<T> oldRoot = this.root;
      STreePage<T> newRoot = oldRoot;
      int n = newRoot.size();
      int i = 0;
      while (i < n) {
        final T value = newRoot.get(i);
        if (values.contains(value)) {
          newRoot = newRoot.removed(i, this);
          n -= 1;
        } else {
          i += 1;
        }
      }
      if (oldRoot != newRoot) {
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          return true;
        }
      } else {
        return false;
      }
    } while (true);
  }

  @Override
  public boolean retainAll(Collection<?> values) {
    do {
      final STreePage<T> oldRoot = this.root;
      STreePage<T> newRoot = oldRoot;
      int n = newRoot.size();
      int i = 0;
      while (i < n) {
        final T value = newRoot.get(i);
        if (!values.contains(value)) {
          newRoot = newRoot.removed(i, this);
          n -= 1;
        } else {
          i += 1;
        }
      }
      if (oldRoot != newRoot) {
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          return true;
        }
      } else {
        return false;
      }
    } while (true);
  }

  @Override
  public void move(int fromIndex, int toIndex) {
    move(fromIndex, toIndex, null);
  }

  @Override
  public void move(int fromIndex, int toIndex, Object key) {
    if (key != null) {
      fromIndex = lookup(fromIndex, key);
      if (fromIndex < 0) {
        throw new NoSuchElementException(key.toString());
      }
    }
    do {
      final STreePage<T> oldRoot = this.root;
      if (fromIndex < 0 || fromIndex >= oldRoot.size()) {
        throw new IndexOutOfBoundsException(Integer.toString(fromIndex));
      }
      if (toIndex < 0 || toIndex >= oldRoot.size()) {
        throw new IndexOutOfBoundsException(Integer.toString(toIndex));
      }
      if (fromIndex != toIndex) {
        final Map.Entry<Object, T> entry = oldRoot.getEntry(fromIndex);
        final STreePage<T> newRoot = oldRoot.removed(fromIndex, this)
            .inserted(toIndex, entry.getValue(), entry.getKey(), this)
            .balanced(this);
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  public void drop(int lower) {
    do {
      final STreePage<T> oldRoot = this.root;
      if (lower > 0 && oldRoot.size() > 0) {
        final STreePage<T> newRoot;
        if (lower < oldRoot.size()) {
          newRoot = oldRoot.drop(lower, this);
        } else {
          newRoot = STreePage.<T>empty();
        }
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  public void take(int keep) {
    do {
      final STreePage<T> oldRoot = this.root;
      if (keep < oldRoot.size() && oldRoot.size() > 0) {
        final STreePage<T> newRoot;
        if (keep > 0) {
          newRoot = oldRoot.take(keep, this);
        } else {
          newRoot = STreePage.<T>empty();
        }
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  public void clear() {
    STreePage<T> oldRoot;
    do {
      oldRoot = this.root;
    } while (!ROOT.compareAndSet(this, oldRoot, STreePage.<T>empty()));
  }

  @Override
  public Object[] toArray() {
    final STreePage<T> root = this.root;
    final int n = root.size();
    final Object[] array = new Object[n];
    root.copyToArray(array, 0);
    return array;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <U> U[] toArray(U[] array) {
    final STreePage<T> root = this.root;
    final int n = root.size();
    if (array.length < n) {
      array = (U[]) Array.newInstance(array.getClass().getComponentType(), n);
    }
    root.copyToArray(array, 0);
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  @Override
  public Cursor<T> iterator() {
    return this.root.iterator();
  }

  @Override
  public Cursor<T> listIterator() {
    return this.root.iterator();
  }

  @Override
  public Cursor<T> listIterator(int index) {
    final Cursor<T> cursor = listIterator();
    cursor.skip(index);
    return cursor;
  }

  @Override
  public Cursor<Object> keyIterator() {
    return this.root.keyIterator();
  }

  @Override
  public Cursor<Map.Entry<Object, T>> entryIterator() {
    return this.root.entryIterator();
  }

  public Cursor<T> reverseIterator() {
    return this.root.reverseIterator();
  }

  public Cursor<Object> reverseKeyIterator() {
    return this.root.reverseKeyIterator();
  }

  public Cursor<Map.Entry<Object, T>> reverseEntryIterator() {
    return this.root.reverseEntryIterator();
  }

  public STree<T> snapshot() {
    return new STree<T>(this.root);
  }

  @Override
  public List<T> subList(int fromIndex, int toIndex) {
    if (fromIndex > toIndex) {
      throw new IllegalArgumentException();
    }
    return new STreeListSubList<T>(this, fromIndex, toIndex);
  }

  public STree<T> clone() {
    return copy(this.root);
  }

  protected STree<T> copy(STreePage<T> root) {
    return new STree<T>(root);
  }

  protected int lookup(int start, Object key) {
    final STreePage<T> root = this.root;
    start = Math.min(Math.max(0, start), root.size() - 1);
    if (start > -1) { // when root.size() is 0
      int index = start;
      do {
        final Map.Entry<Object, T> entry = root.getEntry(index);
        if (entry != null && compare(entry.getKey(), key) == 0) {
          return index;
        }
        index = (index + 1) % root.size();
      } while (index != start);
    }
    return -1;
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof STree<?>) {
      final STree<T> that = (STree<T>) other;
      if (this.size() == that.size()) {
        final Cursor<T> these = iterator();
        final Cursor<T> those = that.iterator();
        while (these.hasNext() && those.hasNext()) {
          final T x = these.next();
          final T y = those.next();
          if (x == null ? y != null : !x.equals(y)) {
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
      hashSeed = Murmur3.seed(STree.class);
    }
    int h = hashSeed;
    final Cursor<T> these = iterator();
    while (these.hasNext()) {
      h = Murmur3.mix(h, Murmur3.hash(these.next()));
    }
    return Murmur3.mash(h);
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("STreeList").write('.');
    final Cursor<T> these = iterator();
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

  public static <T> STreeList<T> empty() {
    return new STreeList<T>();
  }

  @SuppressWarnings("unchecked")
  public static <T> STree<T> of(T... values) {
    final STree<T> tree = new STree<T>();
    for (T value : values) {
      tree.add(value);
    }
    return tree;
  }

  @SuppressWarnings("rawtypes")
  static final AtomicReferenceFieldUpdater<STreeList, STreePage> ROOT =
      AtomicReferenceFieldUpdater.newUpdater(STreeList.class, STreePage.class, "root");
}

final class STreeListSubList<T> extends AbstractList<T> {
  final STreeList<T> inner;
  final int fromIndex;
  final int toIndex;

  STreeListSubList(STreeList<T> inner, int fromIndex, int toIndex) {
    this.inner = inner;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
  }

  @Override
  public int size() {
    return this.toIndex - this.fromIndex;
  }

  @Override
  public T get(int index) {
    final int i = this.fromIndex + index;
    if (i < this.fromIndex || i >= this.toIndex) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return this.inner.get(i);
  }

  @Override
  public List<T> subList(int fromIndex, int toIndex) {
    if (fromIndex > toIndex) {
      throw new IllegalArgumentException();
    }
    fromIndex += this.fromIndex;
    toIndex += this.fromIndex;
    if (toIndex > this.toIndex) {
      throw new IndexOutOfBoundsException();
    }
    return new STreeListSubList<T>(this.inner, fromIndex, toIndex);
  }
}

