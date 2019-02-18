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
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.NoSuchElementException;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Builder;
import swim.util.Murmur3;

public final class FingerTrieSeq<T> implements List<T>, Debug {
  final Object[] prefix;
  final FingerTrieSeq<Object[]> branch;
  final Object[] suffix;
  final int length;

  FingerTrieSeq(Object[] prefix, FingerTrieSeq<Object[]> branch, Object[] suffix, int length) {
    this.prefix = prefix;
    this.branch = branch;
    this.suffix = suffix;
    this.length = length;
  }

  @SuppressWarnings("unchecked")
  FingerTrieSeq() {
    this.prefix = EMPTY_LEAF;
    this.branch = (FingerTrieSeq<Object[]>) this;
    this.suffix = EMPTY_LEAF;
    this.length = 0;
  }

  @Override
  public boolean isEmpty() {
    return this.length == 0;
  }

  @Override
  public int size() {
    return this.length;
  }

  @Override
  public boolean contains(Object elem) {
    final Iterator<T> iter = iterator();
    while (iter.hasNext()) {
      final T next = iter.next();
      if (elem == null ? next == null : elem.equals(next)) {
        return true;
      }
    }
    return false;
  }

  @Override
  public boolean containsAll(Collection<?> elems) {
    for (Object elem : elems) {
      if (!contains(elem)) {
        return false;
      }
    }
    return true;
  }

  @SuppressWarnings("unchecked")
  @Override
  public T get(int index) {
    final Object[] prefix = this.prefix;
    final int n = index - prefix.length;
    if (n < 0) {
      return (T) prefix[index];
    } else {
      final FingerTrieSeq<Object[]> branch = this.branch;
      final int j = n - (branch.length << 5);
      if (j < 0) {
        return (T) branch.get(n >> 5)[n & 0x1F];
      } else {
        return (T) this.suffix[j];
      }
    }
  }

  @Override
  public T set(int index, T nwElem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean add(T newElem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean addAll(Collection<? extends T> newElems) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void add(int index, T newElem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean addAll(int index, Collection<? extends T> newElems) {
    throw new UnsupportedOperationException();
  }

  @Override
  public T remove(int index) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean remove(Object elem) {
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
  public int indexOf(Object elem) {
    for (int i = 0, n = length; i < n; i += 1) {
      if (elem == null ? get(i) == null : elem.equals(get(i))) {
        return i;
      }
    }
    return -1;
  }

  @Override
  public int lastIndexOf(Object elem) {
    for (int i = length - 1; i >= 0; i -= 1) {
      if (elem == null ? get(i) == null : elem.equals(get(i))) {
        return i;
      }
    }
    return -1;
  }

  public FingerTrieSeq<T> updated(int index, T elem) {
    final Object[] oldPrefix = this.prefix;
    final int a = oldPrefix.length;
    final int n = index - a;
    if (n < 0) {
      final Object[] newPrefix = new Object[a];
      System.arraycopy(oldPrefix, 0, newPrefix, 0, a);
      newPrefix[index] = elem;
      return new FingerTrieSeq<T>(newPrefix, this.branch, this.suffix, this.length);
    } else {
      final FingerTrieSeq<Object[]> oldBranch = this.branch;
      final int j = n - (oldBranch.length << 5);
      if (j < 0) {
        final Object[] oldInfix = oldBranch.get(n >> 5);
        final Object[] newInfix = new Object[32];
        System.arraycopy(oldInfix, 0, newInfix, 0, 32);
        newInfix[n & 0x1F] = elem;
        final FingerTrieSeq<Object[]> newBranch = oldBranch.updated(n >> 5, newInfix);
        return new FingerTrieSeq<T>(oldPrefix, newBranch, this.suffix, this.length);
      } else {
        final Object[] oldSuffix = this.suffix;
        final int b = oldSuffix.length;
        final Object[] newSuffix = new Object[b];
        System.arraycopy(oldSuffix, 0, newSuffix, 0, b);
        newSuffix[j] = elem;
        return new FingerTrieSeq<T>(oldPrefix, oldBranch, newSuffix, this.length);
      }
    }
  }

  @SuppressWarnings("unchecked")
  public T head() {
    if (this.length == 0) {
      throw new NoSuchElementException();
    }
    return (T) this.prefix[0];
  }

  public FingerTrieSeq<T> tail() {
    if (this.length == 0) {
      throw new UnsupportedOperationException();
    }
    return drop(1);
  }

  public FingerTrieSeq<T> body() {
    if (this.length == 0) {
      throw new UnsupportedOperationException();
    }
    return take(this.length - 1);
  }

  @SuppressWarnings("unchecked")
  public T foot() {
    if (this.length == 0) {
      throw new NoSuchElementException();
    }
    if (this.length <= 32) {
      return (T) this.prefix[this.prefix.length - 1];
    } else {
      return (T) this.suffix[this.suffix.length - 1];
    }
  }

  @SuppressWarnings("unchecked")
  public FingerTrieSeq<T> drop(int lower) {
    if (lower <= 0) {
      return this;
    } else if (lower >= this.length) {
      return (FingerTrieSeq<T>) EMPTY;
    } else {
      final int n = lower - this.prefix.length;
      final int k = this.length - lower;
      final FingerTrieSeq<Object[]> oldBranch = this.branch;
      if (n == 0) {
        if (oldBranch.length > 0) {
          return new FingerTrieSeq<T>(oldBranch.head(), oldBranch.tail(), this.suffix, k);
        } else {
          return new FingerTrieSeq<T>(this.suffix, EMPTY_NODE, EMPTY_LEAF, k);
        }
      } else if (n < 0) {
        final Object[] newPrefix = new Object[-n];
        System.arraycopy(this.prefix, lower, newPrefix, 0, -n);
        return new FingerTrieSeq<T>(newPrefix, oldBranch, this.suffix, k);
      } else {
        final int j = n - (oldBranch.length << 5);
        if (j < 0) {
          final FingerTrieSeq<Object[]> split = oldBranch.drop(n >> 5);
          final Object[] oldPrefix = split.head();
          final Object[] newPrefix = new Object[oldPrefix.length - (n & 0x1F)];
          System.arraycopy(oldPrefix, n & 0x1F, newPrefix, 0, newPrefix.length);
          return new FingerTrieSeq<T>(newPrefix, split.tail(), this.suffix, k);
        } else {
          final Object[] newPrefix = new Object[k];
          System.arraycopy(this.suffix, j, newPrefix, 0, k);
          return new FingerTrieSeq<T>(newPrefix, EMPTY_NODE, EMPTY_LEAF, k);
        }
      }
    }
  }

  @SuppressWarnings("unchecked")
  public FingerTrieSeq<T> take(int upper) {
    if (upper <= 0) {
      return (FingerTrieSeq<T>) EMPTY;
    } else if (upper >= this.length) {
      return this;
    } else {
      final int n = upper - this.prefix.length;
      if (n == 0) {
        return new FingerTrieSeq<T>(this.prefix, EMPTY_NODE, EMPTY_LEAF, upper);
      } else if (n < 0) {
        final Object[] newPrefix = new Object[upper];
        System.arraycopy(this.prefix, 0, newPrefix, 0, upper);
        return new FingerTrieSeq<T>(newPrefix, EMPTY_NODE, EMPTY_LEAF, upper);
      } else {
        final FingerTrieSeq<Object[]> oldBranch = this.branch;
        final int j = n - (oldBranch.length << 5);
        if (j == 0) {
          if (oldBranch.length > 0) {
            return new FingerTrieSeq<T>(this.prefix, oldBranch.body(), oldBranch.foot(), upper);
          } else {
            return new FingerTrieSeq<T>(this.suffix, EMPTY_NODE, EMPTY_LEAF, upper);
          }
        } else if (j < 0) {
          final FingerTrieSeq<Object[]> split = oldBranch.take(((n + 0x1F) & 0xFFFFFFE0) >> 5);
          final Object[] oldSuffix = split.foot();
          final Object[] newSuffix = new Object[((((n & 0x1F) ^ 0x1F) + 1) & 0x20) | (n & 0x1F)];
          System.arraycopy(oldSuffix, 0, newSuffix, 0, newSuffix.length);
          return new FingerTrieSeq<T>(this.prefix, split.body(), newSuffix, upper);
        } else {
          final Object[] newSuffix = new Object[j];
          System.arraycopy(this.suffix, 0, newSuffix, 0, j);
          return new FingerTrieSeq<T>(this.prefix, oldBranch, newSuffix, upper);
        }
      }
    }
  }

  @SuppressWarnings("unchecked")
  public FingerTrieSeq<T> slice(int lower, int upper) {
    if (lower >= upper) {
      return (FingerTrieSeq<T>) EMPTY;
    } else {
      return drop(lower).take(upper - Math.max(0, lower));
    }
  }

  public FingerTrieSeq<T> appended(T elem) {
    final int i = this.prefix.length;
    final int j = this.suffix.length;
    final int n = this.branch.length;
    if (n == 0 && j == 0 && i < 32) {
      final Object[] newPrefix = new Object[i + 1];
      System.arraycopy(this.prefix, 0, newPrefix, 0, i);
      newPrefix[i] = elem;
      return new FingerTrieSeq<T>(newPrefix, EMPTY_NODE, EMPTY_LEAF, this.length + 1);
    } else if (n == 0 && i + j < 32) {
      final Object[] newPrefix = new Object[i + j + 1];
      System.arraycopy(this.prefix, 0, newPrefix, 0, i);
      System.arraycopy(this.suffix, 0, newPrefix, i, j);
      newPrefix[i + j] = elem;
      return new FingerTrieSeq<T>(newPrefix, EMPTY_NODE, EMPTY_LEAF, this.length + 1);
    } else if (n == 0 && i + j < 64) {
      final Object[] newPrefix = new Object[32];
      System.arraycopy(this.prefix, 0, newPrefix, 0, i);
      System.arraycopy(this.suffix, 0, newPrefix, i, 32 - i);
      final Object[] newSuffix = new Object[i + j - 32 + 1];
      System.arraycopy(this.suffix, 32 - i, newSuffix, 0, i + j - 32);
      newSuffix[i + j - 32] = elem;
      return new FingerTrieSeq<T>(newPrefix, EMPTY_NODE, newSuffix, this.length + 1);
    } else if (j < 32) {
      final Object[] newSuffix = new Object[j + 1];
      System.arraycopy(this.suffix, 0, newSuffix, 0, j);
      newSuffix[j] = elem;
      return new FingerTrieSeq<T>(this.prefix, this.branch, newSuffix, this.length + 1);
    } else {
      final Object[] newSuffix = new Object[1];
      newSuffix[0] = elem;
      final FingerTrieSeq<Object[]> newBranch = this.branch.appended(this.suffix);
      return new FingerTrieSeq<T>(this.prefix, newBranch, newSuffix, this.length + 1);
    }
  }

  public FingerTrieSeq<T> appended(Collection<? extends T> elems) {
    final FingerTrieSeqBuilder<T> builder = new FingerTrieSeqBuilder<T>(this);
    builder.addAll(elems);
    return builder.bind();
  }

  public FingerTrieSeq<T> prepended(T elem) {
    final int i = this.prefix.length;
    final int j = this.suffix.length;
    final int n = this.branch.length;
    if (n == 0 && j == 0 && i < 32) {
      final Object[] newPrefix = new Object[1 + i];
      newPrefix[0] = elem;
      System.arraycopy(this.prefix, 0, newPrefix, 1, i);
      return new FingerTrieSeq<T>(newPrefix, EMPTY_NODE, EMPTY_LEAF, 1 + this.length);
    } else if (n == 0 && i + j < 32) {
      final Object[] newPrefix = new Object[1 + i + j];
      newPrefix[0] = elem;
      System.arraycopy(this.prefix, 0, newPrefix, 1, i);
      System.arraycopy(this.suffix, 0, newPrefix, 1 + i, j);
      return new FingerTrieSeq<T>(newPrefix, EMPTY_NODE, EMPTY_LEAF, 1 + this.length);
    } else if (n == 0 && i + j < 64) {
      final Object[] newPrefix = new Object[1 + i + j - 32];
      newPrefix[0] = elem;
      System.arraycopy(this.prefix, 0, newPrefix, 1, i + j - 32);
      final Object[] newSuffix = new Object[32];
      System.arraycopy(this.prefix, i + j - 32, newSuffix, 0, 32 - j);
      System.arraycopy(this.suffix, 0, newSuffix, 32 - j, j);
      return new FingerTrieSeq<T>(newPrefix, EMPTY_NODE, newSuffix, 1 + this.length);
    } else if (i < 32) {
      final Object[] newPrefix = new Object[1 + i];
      newPrefix[0] = elem;
      System.arraycopy(this.prefix, 0, newPrefix, 1, i);
      return new FingerTrieSeq<T>(newPrefix, this.branch, this.suffix, 1 + this.length);
    } else {
      final Object[] newPrefix = new Object[1];
      newPrefix[0] = elem;
      final FingerTrieSeq<Object[]> newBranch = this.branch.prepended(this.prefix);
      return new FingerTrieSeq<T>(newPrefix, newBranch, this.suffix, 1 + this.length);
    }
  }

  public FingerTrieSeq<T> prepended(Collection<? extends T> elems) {
    final FingerTrieSeqBuilder<T> builder = new FingerTrieSeqBuilder<T>();
    builder.addAll(elems);
    builder.addAll(this);
    return builder.bind();
  }

  public FingerTrieSeq<T> removed(int index) {
    if (index < 0 || index >= length) {
      throw new IndexOutOfBoundsException(String.valueOf(index));
    }
    if (index == 0) {
      return drop(1);
    } else {
      final int newLength = length - 1;
      if (index == newLength) {
        return take(index);
      } else if (index > 0) {
        final FingerTrieSeqBuilder<T> builder = new FingerTrieSeqBuilder<T>(take(index));
        do {
          index += 1;
          builder.add(get(index));
        } while (index < newLength);
        return builder.bind();
      } else {
        return this;
      }
    }
  }

  public FingerTrieSeq<T> removed(Object elem) {
    final int index = indexOf(elem);
    if (index >= 0) {
      return removed(index);
    } else {
      return this;
    }
  }

  @Override
  public FingerTrieSeq<T> subList(int fromIndex, int toIndex) {
    if (fromIndex < 0 || toIndex > length || fromIndex > toIndex) {
      throw new IndexOutOfBoundsException(fromIndex + ", " + toIndex);
    }
    return drop(fromIndex).take(toIndex - fromIndex);
  }

  @Override
  public Object[] toArray() {
    final int n = length;
    final Object[] array = new Object[n];
    for (int i = 0; i < n; i += 1) {
      array[i] = get(i);
    }
    return array;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T[] toArray(T[] array) {
    final int n = length;
    if (array.length < n) {
      array = (T[]) Array.newInstance(array.getClass().getComponentType(), n);
    }
    for (int i = 0; i < n; i += 1) {
      array[i] = (T) get(i);
    }
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  @Override
  public Iterator<T> iterator() {
    return new FingerTrieSeqIterator<T>(this);
  }

  @Override
  public ListIterator<T> listIterator() {
    return new FingerTrieSeqIterator<T>(this);
  }

  @Override
  public ListIterator<T> listIterator(int index) {
    return new FingerTrieSeqIterator<T>(this, index);
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof FingerTrieSeq<?>) {
      final FingerTrieSeq<T> that = (FingerTrieSeq<T>) other;
      if (this.length == that.length) {
        final Iterator<T> these = iterator();
        final Iterator<T> those = that.iterator();
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
      hashSeed = Murmur3.seed(FingerTrieSeq.class);
    }
    int h = hashSeed;
    final Iterator<T> these = iterator();
    while (these.hasNext()) {
      h = Murmur3.mix(h, Murmur3.hash(these.next()));
    }
    return Murmur3.mash(h);
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("FingerTrieSeq").write('.');
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

  static final Object[] EMPTY_LEAF = new Object[0];

  static final FingerTrieSeq<?> EMPTY = new FingerTrieSeq<Object>();

  @SuppressWarnings("unchecked")
  static final FingerTrieSeq<Object[]> EMPTY_NODE = (FingerTrieSeq<Object[]>) EMPTY;

  @SuppressWarnings("unchecked")
  public static <T> FingerTrieSeq<T> empty() {
    return (FingerTrieSeq<T>) EMPTY;
  }

  public static <T> FingerTrieSeq<T> of(T elem0, T elem1) {
    final FingerTrieSeqBuilder<T> builder = new FingerTrieSeqBuilder<T>();
    builder.add(elem0);
    builder.add(elem1);
    return builder.bind();
  }

  @SuppressWarnings("unchecked")
  public static <T> FingerTrieSeq<T> of(T... elems) {
    final FingerTrieSeqBuilder<T> builder = new FingerTrieSeqBuilder<T>();
    for (T elem : elems) {
      builder.add(elem);
    }
    return builder.bind();
  }

  public static <T> FingerTrieSeq<T> from(Iterable<? extends T> elems) {
    final FingerTrieSeqBuilder<T> builder = new FingerTrieSeqBuilder<T>();
    for (T elem : elems) {
      builder.add(elem);
    }
    return builder.bind();
  }

  public static <T> Builder<T, FingerTrieSeq<T>> builder(FingerTrieSeq<? extends T> trie) {
    return new FingerTrieSeqBuilder<T>(trie);
  }

  public static <T> Builder<T, FingerTrieSeq<T>> builder() {
    return new FingerTrieSeqBuilder<T>();
  }
}

final class FingerTrieSeqBuilder<T> implements Builder<T, FingerTrieSeq<T>> {
  Object[] prefix;
  FingerTrieSeqBuilder<Object[]> branch;
  Object[] buffer;
  int length;

  FingerTrieSeqBuilder(FingerTrieSeq<? extends T> trie) {
    if (trie.length > 32) {
      this.prefix = trie.prefix;
      if (trie.length > 64) {
        this.branch = new FingerTrieSeqBuilder<Object[]>(trie.branch);
      }
      this.buffer = trie.suffix;
    } else if (trie.length > 0) {
      this.buffer = trie.prefix;
    }
    this.length = trie.length;
  }

  FingerTrieSeqBuilder() {
    this.prefix = null;
    this.branch = null;
    this.buffer = null;
    this.length = 0;
  }

  private int getSkew() {
    return (this.prefix != null ? this.length - this.prefix.length : this.length) & 0x1F;
  }

  @Override
  public boolean add(T elem) {
    final int offset = getSkew();
    if (offset == 0) {
      if (this.buffer != null) {
        if (this.prefix == null) {
          this.prefix = this.buffer;
        } else {
          if (this.branch == null) {
            this.branch = new FingerTrieSeqBuilder<Object[]>();
          }
          this.branch.add(this.buffer);
        }
      }
      this.buffer = new Object[32];
    } else if (this.buffer.length < 32) {
      final Object[] newBuffer = new Object[32];
      System.arraycopy(this.buffer, 0, newBuffer, 0, offset);
      this.buffer = newBuffer;
    }
    this.buffer[offset] = elem;
    this.length += 1;
    return true;
  }

  @Override
  public boolean addAll(Collection<? extends T> elems) {
    if (elems instanceof FingerTrieSeq<?>) {
      return addAll((FingerTrieSeq<? extends T>) elems);
    } else {
      for (T elem : elems) {
        add(elem);
      }
      return true;
    }
  }

  boolean addAll(FingerTrieSeq<? extends T> that) {
    if (this.length == 0 && that.length != 0) {
      if (that.length > 32) {
        this.prefix = that.prefix;
        if (that.length > 64) {
          this.branch = new FingerTrieSeqBuilder<Object[]>(that.branch);
        }
        this.buffer = that.suffix;
      } else {
        this.buffer = that.prefix;
      }
      this.length = that.length;
    } else if (that.length != 0) {
      final int offset = getSkew();
      if (((offset + that.prefix.length) & 0x1F) == 0) {
        if (buffer.length < 32) {
          final Object[] newBuffer = new Object[32];
          System.arraycopy(this.buffer, 0, newBuffer, 0, offset);
          this.buffer = newBuffer;
        }
        if (offset > 0) {
          System.arraycopy(that.prefix, 0, this.buffer, offset, 32 - offset);
        } else {
          if (this.prefix == null) {
            this.prefix = this.buffer;
          } else {
            if (this.branch == null) {
              this.branch = new FingerTrieSeqBuilder<Object[]>();
            }
            this.branch.add(this.buffer);
          }
          this.buffer = that.prefix;
        }
        if (that.suffix.length > 0) {
          if (this.branch == null) {
            this.branch = new FingerTrieSeqBuilder<Object[]>();
          }
          this.branch.add(this.buffer);
          this.branch.addAll(that.branch);
          this.buffer = that.suffix;
        }
        this.length += that.length;
      } else {
        for (T elem : that) {
          add(elem);
        }
      }
    }
    return true;
  }

  public void clear() {
    this.prefix = null;
    this.branch = null;
    this.buffer = null;
    this.length = 0;
  }

  @SuppressWarnings("unchecked")
  @Override
  public FingerTrieSeq<T> bind() {
    if (this.length == 0) {
      return (FingerTrieSeq<T>) FingerTrieSeq.EMPTY;
    } else {
      final int offset = getSkew();
      if (offset != 0 && offset != this.buffer.length) {
        final Object[] suffix = new Object[offset];
        System.arraycopy(this.buffer, 0, suffix, 0, offset);
        this.buffer = suffix;
      }
      if (prefix == null) {
        return new FingerTrieSeq<T>(this.buffer, FingerTrieSeq.EMPTY_NODE,
                                    FingerTrieSeq.EMPTY_LEAF, this.length);
      } else if (branch == null) {
        return new FingerTrieSeq<T>(this.prefix, FingerTrieSeq.EMPTY_NODE, this.buffer, this.length);
      } else {
        return new FingerTrieSeq<T>(this.prefix, this.branch.bind(), this.buffer, this.length);
      }
    }
  }
}

final class FingerTrieSeqSegmenter implements ListIterator<Object[]> {
  final Object[] prefix;
  final FingerTrieSeq<Object[]> branch;
  final Object[] suffix;
  FingerTrieSeqSegmenter inner;
  Object[] infix;
  int infixIndex;
  int index;
  int phase;

  FingerTrieSeqSegmenter(FingerTrieSeq<?> trie) {
    this.prefix = trie.prefix;
    this.branch = trie.branch;
    this.suffix = trie.suffix;
    this.phase = trie.length > 0 ? 0 : 3;
  }

  FingerTrieSeqSegmenter(FingerTrieSeq<?> trie, int index) {
    this.prefix = trie.prefix;
    this.branch = trie.branch;
    this.suffix = trie.suffix;
    this.index = index;
    if (index == 0) {
      this.phase = 0;
    } else if (index - 1 < this.branch.length) {
      this.inner = new FingerTrieSeqSegmenter(this.branch, (index - 1) >> 5);
      this.infix = this.inner.next();
      this.infixIndex = (index - 1) & 0x1F;
      this.phase = 1;
    } else if (index == 1 + this.branch.length && this.suffix.length > 0) {
      this.phase = 2;
    } else {
      this.phase = 3;
    }
  }

  @Override
  public boolean hasNext() {
    return this.phase < 3;
  }

  @Override
  public int nextIndex() {
    return this.index;
  }

  @Override
  public Object[] next() {
    switch (this.phase) {
      case 0:
        this.index += 1;
        if (this.branch.length > 0) {
          this.inner = new FingerTrieSeqSegmenter(this.branch);
          this.infix = this.inner.next();
          this.infixIndex = 0;
          this.phase = 1;
        } else if (this.suffix.length > 0) {
          this.phase = 2;
        } else {
          this.phase = 3;
        }
        return this.prefix;
      case 1:
        final Object[] head = (Object[]) this.infix[this.infixIndex];
        this.infixIndex += 1;
        this.index += 1;
        if (this.infixIndex >= this.infix.length) {
          if (this.inner.hasNext()) {
            this.infix = this.inner.next();
            this.infixIndex = 0;
          } else {
            this.inner = null;
            this.phase = 2;
          }
        }
        return head;
      case 2:
        this.index += 1;
        this.phase = 3;
        return this.suffix;
      default:
        throw new NoSuchElementException();
    }
  }

  @Override
  public boolean hasPrevious() {
    return this.phase > 0;
  }

  @Override
  public int previousIndex() {
    return this.index - 1;
  }

  @Override
  public Object[] previous() {
    switch (this.phase) {
      case 1:
        this.index -= 1;
        if (this.infixIndex > 0) {
          this.infixIndex -= 1;
          return (Object[]) this.infix[this.infixIndex];
        } else {
          this.inner.previous();
          if (this.inner.hasPrevious()) {
            this.infix = this.inner.previous();
            this.infixIndex = this.infix.length - 1;
            this.inner.next();
            return (Object[]) this.infix[this.infixIndex];
          } else {
            this.inner = null;
            this.phase = 0;
            return this.prefix;
          }
        }
      case 2:
        this.index -= 1;
        if (this.branch.length > 0) {
          if (this.inner == null) {
            this.inner = new FingerTrieSeqSegmenter(this.branch, this.branch.length);
          }
          this.infix = this.inner.previous();
          this.infixIndex = this.infix.length - 1;
          this.inner.next();
          this.phase = 1;
          return (Object[]) this.infix[this.infixIndex];
        } else {
          this.phase = 0;
          return this.prefix;
        }
      case 3:
        this.index -= 1;
        if (this.suffix.length > 0) {
          this.phase = 2;
          return this.suffix;
        } else if (this.branch.length > 0) {
          if (this.inner == null) {
            this.inner = new FingerTrieSeqSegmenter(this.branch, this.branch.length);
          }
          this.infix = this.inner.previous();
          this.infixIndex = this.infix.length - 1;
          this.inner.next();
          this.phase = 1;
          return (Object[]) this.infix[this.infixIndex];
        } else {
          this.phase = 0;
          return this.prefix;
        }
      default:
        throw new NoSuchElementException();
    }
  }

  @Override
  public void add(Object[] segment) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void set(Object[] segment) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}

final class FingerTrieSeqIterator<T> implements ListIterator<T> {
  final FingerTrieSeqSegmenter segmenter;
  Object[] page;
  int pageIndex;
  int index;

  FingerTrieSeqIterator(FingerTrieSeq<T> trie) {
    this.segmenter = new FingerTrieSeqSegmenter(trie);
    if (this.segmenter.hasNext()) {
      this.page = this.segmenter.next();
    } else {
      this.page = FingerTrieSeq.EMPTY_LEAF;
    }
  }

  FingerTrieSeqIterator(FingerTrieSeq<T> trie, int index) {
    final int n = index - trie.prefix.length;
    if (n < 0) {
      this.segmenter = new FingerTrieSeqSegmenter(trie, 1);
      this.page = trie.prefix;
      this.pageIndex = index;
    } else if (index < trie.length) {
      final int j = n - (trie.branch.length << 5);
      if (j < 0) {
        this.segmenter = new FingerTrieSeqSegmenter(trie, 1 + (n >> 5));
        this.page = this.segmenter.next();
        this.pageIndex = n & 0x1F;
      } else {
        this.segmenter = new FingerTrieSeqSegmenter(trie, 1 + trie.branch.length);
        this.page = this.segmenter.next();
        this.pageIndex = j;
      }
    } else {
      this.segmenter = new FingerTrieSeqSegmenter(trie, trie.length);
      this.page = FingerTrieSeq.EMPTY_LEAF;
      this.pageIndex = 0;
    }
    this.index = index;
  }

  @Override
  public boolean hasNext() {
    return this.pageIndex < this.page.length;
  }

  @Override
  public int nextIndex() {
    return this.index;
  }

  @SuppressWarnings("unchecked")
  @Override
  public T next() {
    if (this.pageIndex < this.page.length) {
      final T head = (T) this.page[this.pageIndex];
      this.pageIndex += 1;
      this.index += 1;
      if (this.pageIndex >= this.page.length) {
        if (this.segmenter.hasNext()) {
          this.page = this.segmenter.next();
        } else {
          this.page = FingerTrieSeq.EMPTY_LEAF;
        }
        this.pageIndex = 0;
      }
      return head;
    } else {
      throw new NoSuchElementException();
    }
  }

  @Override
  public boolean hasPrevious() {
    return this.index > 0;
  }

  @Override
  public int previousIndex() {
    return this.index - 1;
  }

  @SuppressWarnings("unchecked")
  @Override
  public T previous() {
    if (this.pageIndex > 0) {
      this.index -= 1;
      this.pageIndex -= 1;
      return (T) this.page[this.pageIndex];
    } else {
      this.segmenter.previous();
      if (this.segmenter.hasPrevious()) {
        this.index -= 1;
        this.page = this.segmenter.previous();
        this.pageIndex = this.page.length - 1;
        this.segmenter.next();
        return (T) this.page[this.pageIndex];
      } else {
        throw new NoSuchElementException();
      }
    }
  }

  @Override
  public void add(T elem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void set(T elem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}
