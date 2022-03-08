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
import java.util.AbstractList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.ThreadLocalRandom;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Cursor;
import swim.util.KeyedList;
import swim.util.Murmur3;

public class STree<T> extends STreeContext<T> implements KeyedList<T>, Cloneable, Debug {

  final STreePage<T> root;

  protected STree(STreePage<T> root) {
    this.root = root;
  }

  public STree() {
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
    return this.get(index, null);
  }

  @Override
  public T get(int index, Object key) {
    if (key != null) {
      index = this.lookup(index, key);
      if (index < 0) {
        return null;
      }
    }
    return this.root.get(index);
  }

  @Override
  public Map.Entry<Object, T> getEntry(int index) {
    return this.getEntry(index, null);
  }

  @Override
  public Map.Entry<Object, T> getEntry(int index, Object key) {
    if (key != null) {
      index = this.lookup(index, key);
      if (index < 0) {
        return null;
      }
    }
    return this.root.getEntry(index);
  }

  @Override
  public T set(int index, T newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public T set(int index, T newValue, Object key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean add(T newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean add(T newValue, Object key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean addAll(Collection<? extends T> newValues) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void add(int index, T newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void add(int index, T newValue, Object key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean addAll(int index, Collection<? extends T> newValues) {
    throw new UnsupportedOperationException();
  }

  @Override
  public T remove(int index) {
    throw new UnsupportedOperationException();
  }

  @Override
  public T remove(int index, Object key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean remove(Object value) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean removeAll(Collection<?> values) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean retainAll(Collection<?> values) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void move(int fromIndex, int toIndex) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void move(int fromIndex, int toIndex, Object key) {
    throw new UnsupportedOperationException();
  }

  public void drop(int lower) {
    throw new UnsupportedOperationException();
  }

  public void take(int upper) {
    throw new UnsupportedOperationException();
  }

  public void clear() {
    throw new UnsupportedOperationException();
  }

  public STree<T> updated(int index, T newValue) {
    return this.updated(index, newValue, null);
  }

  public STree<T> updated(int index, T newValue, Object key) {
    if (key != null) {
      index = this.lookup(index, key);
      if (index < 0) {
        throw new NoSuchElementException(key.toString());
      }
    }
    final STreePage<T> oldRoot = this.root;
    if (index < 0 || index >= oldRoot.size()) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    final STreePage<T> newRoot = oldRoot.updated(index, newValue, this);
    if (oldRoot != newRoot) {
      return new STree<T>(newRoot);
    } else {
      return this;
    }
  }

  public STree<T> appended(T newValue) {
    return this.appended(newValue, null);
  }

  public STree<T> appended(T newValue, Object key) {
    final STreePage<T> oldRoot = this.root;
    final STreePage<T> newRoot = oldRoot.appended(newValue, key, this).balanced(this);
    if (oldRoot != newRoot) {
      return new STree<T>(newRoot);
    } else {
      return this;
    }
  }

  public STree<T> inserted(int index, T newValue) {
    return this.inserted(index, newValue, null);
  }

  public STree<T> inserted(int index, T newValue, Object key) {
    final STreePage<T> oldRoot = this.root;
    if (index < 0 || index > oldRoot.size()) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    final STreePage<T> newRoot = oldRoot.inserted(index, newValue, key, this).balanced(this);
    if (oldRoot != newRoot) {
      return new STree<T>(newRoot);
    } else {
      return this;
    }
  }

  public STree<T> removed(int index) {
    return this.removed(index, null);
  }

  public STree<T> removed(int index, Object key) {
    if (key != null) {
      index = this.lookup(index, key);
    }
    final STreePage<T> oldRoot = this.root;
    if (index < 0 || index > oldRoot.size()) {
      return null;
    }
    final STreePage<T> newRoot = oldRoot.removed(index, this);
    if (oldRoot != newRoot) {
      return new STree<T>(newRoot);
    } else {
      return this;
    }
  }

  public STree<T> removed(Object value) {
    final STreePage<T> oldRoot = this.root;
    final STreePage<T> newRoot = oldRoot.removed(value, this);
    if (oldRoot != newRoot) {
      return new STree<T>(newRoot);
    } else {
      return this;
    }
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
    final Cursor<T> cursor = this.listIterator();
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

  @Override
  public List<T> subList(int fromIndex, int toIndex) {
    if (fromIndex > toIndex) {
      throw new IllegalArgumentException();
    }
    return new STreeSubList<T>(this, fromIndex, toIndex);
  }

  public STree<T> clone() {
    return this.copy(this.root);
  }

  protected STree<T> copy(STreePage<T> root) {
    return new STree<T>(root);
  }

  @SuppressWarnings("unchecked")
  protected Object identify(T value) {
    return ThreadLocalRandom.current().nextLong();
  }

  @SuppressWarnings("unchecked")
  protected int compare(Object x, Object y) {
    return ((Comparable<Object>) x).compareTo(y);
  }

  protected int pageSplitSize() {
    return 32;
  }

  protected boolean pageShouldSplit(STreePage<T> page) {
    return page.arity() > this.pageSplitSize();
  }

  protected boolean pageShouldMerge(STreePage<T> page) {
    return page.arity() < this.pageSplitSize() >>> 1;
  }

  protected int lookup(int start, Object key) {
    final STreePage<T> root = this.root;
    start = Math.min(Math.max(0, start), root.size() - 1);
    if (start > -1) { // when root.size() is 0
      int index = start;
      do {
        final Map.Entry<Object, T> entry = root.getEntry(index);
        if (entry != null && this.compare(entry.getKey(), key) == 0) {
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
        final Cursor<T> these = this.iterator();
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

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (STree.hashSeed == 0) {
      STree.hashSeed = Murmur3.seed(STree.class);
    }
    int h = STree.hashSeed;
    final Cursor<T> these = this.iterator();
    while (these.hasNext()) {
      h = Murmur3.mix(h, Murmur3.hash(these.next()));
    }
    return Murmur3.mash(h);
  }

  @Override
  public <U> Output<U> debug(Output<U> output) {
    output = output.write("STree").write('.');
    final Cursor<T> these = this.iterator();
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

  public static <T> STree<T> empty() {
    return new STree<T>();
  }

  @SuppressWarnings("unchecked")
  public static <T> STree<T> of(T... values) {
    final STree<T> tree = new STree<T>();
    for (T value : values) {
      tree.add(value);
    }
    return tree;
  }

}

final class STreeSubList<T> extends AbstractList<T> {

  final STree<T> inner;
  final int fromIndex;
  final int toIndex;

  STreeSubList(STree<T> inner, int fromIndex, int toIndex) {
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
    return new STreeSubList<T>(this.inner, fromIndex, toIndex);
  }

}
