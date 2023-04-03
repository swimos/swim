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
import java.util.List;
import java.util.ListIterator;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.function.Consumer;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToMarkup;
import swim.util.ToSource;
import swim.util.UpdatableList;

@Public
@Since("5.0")
public final class FingerTrieList<T> implements UpdatableList<T>, ToMarkup, ToSource {

  final int size;
  final Object[] prefix;
  final FingerTrieList<Object[]> branch;
  final Object[] suffix;

  FingerTrieList(int size, Object[] prefix, FingerTrieList<Object[]> branch, Object[] suffix) {
    if (size < 0) {
      throw new IllegalArgumentException("size overflow");
    }
    if (prefix.length + (branch.size << 5) + suffix.length != size) {
      throw new AssertionError("inconsistent size: " + size
                           + "; prefix.length: " + prefix.length
                           + "; branch.size: " + (branch.size << 5)
                           + "; suffix.length: " + suffix.length);
    }
    this.size = size;
    this.prefix = prefix;
    this.branch = branch;
    this.suffix = suffix;
  }

  FingerTrieList() {
    this.size = 0;
    this.prefix = EMPTY_LEAF;
    this.branch = Assume.conforms(this);
    this.suffix = EMPTY_LEAF;
  }

  @Override
  public boolean isEmpty() {
    return this.size == 0;
  }

  @Override
  public int size() {
    return this.size;
  }

  @Override
  public boolean contains(@Nullable Object elem) {
    for (int i = 0; i < this.size; i += 1) {
      if (Objects.equals(elem, this.get(i))) {
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

  @Override
  public int indexOf(@Nullable Object elem) {
    for (int i = 0; i < this.size; i += 1) {
      if (Objects.equals(elem, this.get(i))) {
        return i;
      }
    }
    return -1;
  }

  @Override
  public int lastIndexOf(@Nullable Object elem) {
    for (int i = this.size - 1; i >= 0; i -= 1) {
      if (Objects.equals(elem, this.get(i))) {
        return i;
      }
    }
    return -1;
  }

  public @Nullable T head() {
    if (this.size == 0) {
      throw new NoSuchElementException();
    }
    return Assume.conformsNullable(this.prefix[0]);
  }

  public FingerTrieList<T> tail() {
    if (this.size == 0) {
      throw new UnsupportedOperationException();
    }
    return this.drop(1);
  }

  public FingerTrieList<T> body() {
    if (this.size == 0) {
      throw new UnsupportedOperationException();
    }
    return this.take(this.size - 1);
  }

  public @Nullable T foot() {
    if (this.size == 0) {
      throw new NoSuchElementException();
    }
    if (this.size <= 32) {
      return Assume.conformsNullable(this.prefix[this.prefix.length - 1]);
    } else {
      return Assume.conformsNullable(this.suffix[this.suffix.length - 1]);
    }
  }

  @Override
  public @Nullable T get(int index) {
    if (index < 0 || index >= this.size) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    final Object[] prefix = this.prefix;
    final int n = index - prefix.length;
    if (n < 0) {
      return Assume.conformsNullable(prefix[index]);
    } else {
      final FingerTrieList<Object[]> branch = this.branch;
      final int j = n - (branch.size << 5);
      if (j < 0) {
        return Assume.conformsNullable(Assume.nonNull(branch.get(n >> 5))[n & 0x1F]);
      } else {
        return Assume.conformsNullable(this.suffix[j]);
      }
    }
  }

  @Override
  public @Nullable T set(int index, @Nullable T elem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public FingerTrieList<T> updated(int index, @Nullable T elem) {
    final Object[] oldPrefix = this.prefix;
    final int a = oldPrefix.length;
    final int n = index - a;
    if (n < 0) {
      final Object[] newPrefix = new Object[a];
      System.arraycopy(oldPrefix, 0, newPrefix, 0, a);
      newPrefix[index] = elem;
      return new FingerTrieList<T>(this.size, newPrefix, this.branch, this.suffix);
    } else {
      final FingerTrieList<Object[]> oldBranch = this.branch;
      final int j = n - (oldBranch.size << 5);
      if (j < 0) {
        final Object[] oldInfix = oldBranch.get(n >> 5);
        final Object[] newInfix = new Object[32];
        System.arraycopy(oldInfix, 0, newInfix, 0, 32);
        newInfix[n & 0x1F] = elem;
        final FingerTrieList<Object[]> newBranch = oldBranch.updated(n >> 5, newInfix);
        return new FingerTrieList<T>(this.size, oldPrefix, newBranch, this.suffix);
      } else {
        final Object[] oldSuffix = this.suffix;
        final int b = oldSuffix.length;
        final Object[] newSuffix = new Object[b];
        System.arraycopy(oldSuffix, 0, newSuffix, 0, b);
        newSuffix[j] = elem;
        return new FingerTrieList<T>(this.size, oldPrefix, oldBranch, newSuffix);
      }
    }
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
  public void add(int index, @Nullable T elem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean addAll(int index, Collection<? extends T> elems) {
    throw new UnsupportedOperationException();
  }

  @Override
  public FingerTrieList<T> appended(@Nullable T elem) {
    final int i = this.prefix.length;
    final int j = this.suffix.length;
    final int n = this.branch.size;
    if (n == 0 && j == 0 && i < 32) {
      final Object[] newPrefix = new Object[i + 1];
      System.arraycopy(this.prefix, 0, newPrefix, 0, i);
      newPrefix[i] = elem;
      return new FingerTrieList<T>(this.size + 1, newPrefix, FingerTrieList.empty(), EMPTY_LEAF);
    } else if (n == 0 && i + j < 32) {
      final Object[] newPrefix = new Object[i + j + 1];
      System.arraycopy(this.prefix, 0, newPrefix, 0, i);
      System.arraycopy(this.suffix, 0, newPrefix, i, j);
      newPrefix[i + j] = elem;
      return new FingerTrieList<T>(this.size + 1, newPrefix, FingerTrieList.empty(), EMPTY_LEAF);
    } else if (n == 0 && i + j < 64) {
      final Object[] newPrefix = new Object[32];
      System.arraycopy(this.prefix, 0, newPrefix, 0, i);
      System.arraycopy(this.suffix, 0, newPrefix, i, 32 - i);
      final Object[] newSuffix = new Object[i + j - 32 + 1];
      System.arraycopy(this.suffix, 32 - i, newSuffix, 0, i + j - 32);
      newSuffix[i + j - 32] = elem;
      return new FingerTrieList<T>(this.size + 1, newPrefix, FingerTrieList.empty(), newSuffix);
    } else if (j < 32) {
      final Object[] newSuffix = new Object[j + 1];
      System.arraycopy(this.suffix, 0, newSuffix, 0, j);
      newSuffix[j] = elem;
      return new FingerTrieList<T>(this.size + 1, this.prefix, this.branch, newSuffix);
    } else {
      final Object[] newSuffix = new Object[1];
      newSuffix[0] = elem;
      final FingerTrieList<Object[]> newBranch = this.branch.appended(this.suffix);
      return new FingerTrieList<T>(this.size + 1, this.prefix, newBranch, newSuffix);
    }
  }

  public FingerTrieList<T> appendedAll(Collection<? extends T> elems) {
    final FingerTrieListBuilder<T> builder = new FingerTrieListBuilder<T>(this);
    builder.addAll(elems);
    return builder.build();
  }

  public FingerTrieList<T> prepended(@Nullable T elem) {
    final int i = this.prefix.length;
    final int j = this.suffix.length;
    final int n = this.branch.size;
    if (n == 0 && j == 0 && i < 32) {
      final Object[] newPrefix = new Object[1 + i];
      newPrefix[0] = elem;
      System.arraycopy(this.prefix, 0, newPrefix, 1, i);
      return new FingerTrieList<T>(1 + this.size, newPrefix, FingerTrieList.empty(), EMPTY_LEAF);
    } else if (n == 0 && i + j < 32) {
      final Object[] newPrefix = new Object[1 + i + j];
      newPrefix[0] = elem;
      System.arraycopy(this.prefix, 0, newPrefix, 1, i);
      System.arraycopy(this.suffix, 0, newPrefix, 1 + i, j);
      return new FingerTrieList<T>(1 + this.size, newPrefix, FingerTrieList.empty(), EMPTY_LEAF);
    } else if (n == 0 && i + j < 64) {
      final Object[] newPrefix = new Object[1 + i + j - 32];
      newPrefix[0] = elem;
      System.arraycopy(this.prefix, 0, newPrefix, 1, i + j - 32);
      final Object[] newSuffix = new Object[32];
      System.arraycopy(this.prefix, i + j - 32, newSuffix, 0, 32 - j);
      System.arraycopy(this.suffix, 0, newSuffix, 32 - j, j);
      return new FingerTrieList<T>(1 + this.size, newPrefix, FingerTrieList.empty(), newSuffix);
    } else if (i < 32) {
      final Object[] newPrefix = new Object[1 + i];
      newPrefix[0] = elem;
      System.arraycopy(this.prefix, 0, newPrefix, 1, i);
      return new FingerTrieList<T>(1 + this.size, newPrefix, this.branch, this.suffix);
    } else {
      final Object[] newPrefix = new Object[1];
      newPrefix[0] = elem;
      final FingerTrieList<Object[]> newBranch = this.branch.prepended(this.prefix);
      return new FingerTrieList<T>(1 + this.size, newPrefix, newBranch, this.suffix);
    }
  }

  public FingerTrieList<T> prependedAll(Collection<? extends T> elems) {
    final FingerTrieListBuilder<T> builder = new FingerTrieListBuilder<T>();
    builder.addAll(elems);
    builder.addAll(this);
    return builder.build();
  }

  @Override
  public @Nullable T remove(int index) {
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
  public FingerTrieList<T> removed(int index) {
    if (index < 0 || index >= this.size) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    if (index == 0) {
      return this.drop(1);
    } else {
      final int newLength = this.size - 1;
      if (index == newLength) {
        return this.take(index);
      } else {
        final FingerTrieListBuilder<T> builder = new FingerTrieListBuilder<T>(this.take(index));
        do {
          index += 1;
          builder.add(this.get(index));
        } while (index < newLength);
        return builder.build();
      }
    }
  }

  @Override
  public FingerTrieList<T> removed(@Nullable Object elem) {
    final int index = this.indexOf(elem);
    if (index >= 0) {
      return this.removed(index);
    } else {
      return this;
    }
  }

  public FingerTrieList<T> drop(int lower) {
    if (lower <= 0) {
      return this;
    } else if (lower >= this.size) {
      return FingerTrieList.empty();
    } else {
      final int n = lower - this.prefix.length;
      final int k = this.size - lower;
      final FingerTrieList<Object[]> oldBranch = this.branch;
      if (n == 0) {
        if (oldBranch.size > 0) {
          return new FingerTrieList<T>(k, Assume.nonNull(oldBranch.head()), oldBranch.tail(), this.suffix);
        } else {
          return new FingerTrieList<T>(k, this.suffix, FingerTrieList.empty(), EMPTY_LEAF);
        }
      } else if (n < 0) {
        final Object[] newPrefix = new Object[-n];
        System.arraycopy(this.prefix, lower, newPrefix, 0, -n);
        return new FingerTrieList<T>(k, newPrefix, oldBranch, this.suffix);
      } else {
        final int j = n - (oldBranch.size << 5);
        if (j < 0) {
          final FingerTrieList<Object[]> split = oldBranch.drop(n >> 5);
          final Object[] oldPrefix = Assume.nonNull(split.head());
          final Object[] newPrefix = new Object[oldPrefix.length - (n & 0x1F)];
          System.arraycopy(oldPrefix, n & 0x1F, newPrefix, 0, newPrefix.length);
          return new FingerTrieList<T>(k, newPrefix, split.tail(), this.suffix);
        } else {
          final Object[] newPrefix = new Object[k];
          System.arraycopy(this.suffix, j, newPrefix, 0, k);
          return new FingerTrieList<T>(k, newPrefix, FingerTrieList.empty(), EMPTY_LEAF);
        }
      }
    }
  }

  public FingerTrieList<T> take(int upper) {
    if (upper <= 0) {
      return FingerTrieList.empty();
    } else if (upper >= this.size) {
      return this;
    } else {
      final int n = upper - this.prefix.length;
      if (n == 0) {
        return new FingerTrieList<T>(upper, this.prefix, FingerTrieList.empty(), EMPTY_LEAF);
      } else if (n < 0) {
        final Object[] newPrefix = new Object[upper];
        System.arraycopy(this.prefix, 0, newPrefix, 0, upper);
        return new FingerTrieList<T>(upper, newPrefix, FingerTrieList.empty(), EMPTY_LEAF);
      } else {
        final FingerTrieList<Object[]> oldBranch = this.branch;
        final int j = n - (oldBranch.size << 5);
        if (j == 0) {
          if (oldBranch.size > 0) {
            return new FingerTrieList<T>(upper, this.prefix, oldBranch.body(), Assume.nonNull(oldBranch.foot()));
          } else {
            return new FingerTrieList<T>(upper, this.suffix, FingerTrieList.empty(), EMPTY_LEAF);
          }
        } else if (j < 0) {
          final FingerTrieList<Object[]> split = oldBranch.take(((n + 0x1F) & 0xFFFFFFE0) >> 5);
          final Object[] oldSuffix = split.foot();
          final Object[] newSuffix = new Object[((((n & 0x1F) ^ 0x1F) + 1) & 0x20) | (n & 0x1F)];
          System.arraycopy(oldSuffix, 0, newSuffix, 0, newSuffix.length);
          return new FingerTrieList<T>(upper, this.prefix, split.body(), newSuffix);
        } else {
          final Object[] newSuffix = new Object[j];
          System.arraycopy(this.suffix, 0, newSuffix, 0, j);
          return new FingerTrieList<T>(upper, this.prefix, oldBranch, newSuffix);
        }
      }
    }
  }

  public FingerTrieList<T> slice(int lower, int upper) {
    if (lower >= upper) {
      return FingerTrieList.empty();
    } else {
      return this.drop(lower).take(upper - Math.max(0, lower));
    }
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  @Override
  public FingerTrieList<T> subList(int fromIndex, int toIndex) {
    if (fromIndex < 0 || toIndex > this.size || fromIndex > toIndex) {
      throw new IndexOutOfBoundsException(fromIndex + ", " + toIndex);
    }
    return this.drop(fromIndex).take(toIndex - fromIndex);
  }

  @Override
  public Object[] toArray() {
    final int n = this.size;
    final Object[] array = new Object[n];
    for (int i = 0; i < n; i += 1) {
      array[i] = this.get(i);
    }
    return array;
  }

  @Override
  public <T2> T2[] toArray(T2[] array) {
    final int n = this.size;
    if (array.length < n) {
      array = Assume.conforms(Array.newInstance(array.getClass().getComponentType(), n));
    }
    for (int i = 0; i < n; i += 1) {
      array[i] = Assume.conformsNullable(this.get(i));
    }
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  @Override
  public void forEach(Consumer<? super T> action) {
    for (int i = 0; i < this.size; i += 1) {
      action.accept(this.get(i));
    }
  }

  @Override
  public Iterator<T> iterator() {
    return new FingerTrieListIterator<T>(this);
  }

  @Override
  public ListIterator<T> listIterator() {
    return new FingerTrieListIterator<T>(this);
  }

  @Override
  public ListIterator<T> listIterator(int index) {
    return new FingerTrieListIterator<T>(this, index);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof List<?> that && this.size() == that.size()) {
      final Iterator<T> these = this.iterator();
      final Iterator<?> those = that.iterator();
      while (these.hasNext() && those.hasNext()) {
        if (!Objects.equals(these.next(), those.next())) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  @Override
  public int hashCode() {
    int code = 1;
    for (int i = 0; i < this.size; i += 1) {
      code = 31 * code + Objects.hashCode(this.get(i));
    }
    return code;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.isEmpty()) {
      notation.beginInvoke("FingerTrieList", "empty").endInvoke();
    } else {
      notation.beginInvoke("FingerTrieList", "of");
      this.writeArguments(notation);
      notation.endInvoke();
    }
  }

  void writeArguments(Notation notation) {
    for (int i = 0; i < this.size; i += 1) {
      notation.appendArgument(this.get(i));
    }
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    if (notation.options().verbose()) {
      notation.beginObject("FingerTrieList");
      notation.appendField("size", this.size);
      notation.appendField("prefix", this.prefix);
      if (this.branch.size != 0) {
        notation.appendField("branch", this.branch);
      } else {
        notation.appendKey("branch")
                .beginValue()
                .append("<empty>")
                .endValue();
      }
      notation.appendField("suffix", this.suffix);
      notation.endObject();
    } else {
      notation.beginArray("FingerTrieList");
      this.writeElements(notation);
      notation.endArray();
    }
  }

  void writeElements(Notation notation) {
    for (int i = 0; i < this.size; i += 1) {
      notation.appendElement(this.get(i));
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final Object[] EMPTY_LEAF = new Object[0];

  static final FingerTrieList<?> EMPTY = new FingerTrieList<Object>();

  public static <T> FingerTrieList<T> empty() {
    return Assume.conforms(EMPTY);
  }

  public static <T> FingerTrieList<T> of(@Nullable T elem) {
    return new FingerTrieList<T>(1, new Object[] {elem}, FingerTrieList.empty(), EMPTY_LEAF);
  }

  public static <T> FingerTrieList<T> of(@Nullable T elem0, @Nullable T elem1) {
    return new FingerTrieList<T>(2, new Object[] {elem0, elem1}, FingerTrieList.empty(), EMPTY_LEAF);
  }

  @SuppressWarnings("unchecked")
  public static <T> FingerTrieList<T> of(@Nullable T... elems) {
    Objects.requireNonNull(elems);
    final FingerTrieListBuilder<T> builder = new FingerTrieListBuilder<T>();
    for (int i = 0; i < elems.length; i += 1) {
      builder.add(elems[i]);
    }
    return builder.build();
  }

  public static <T> FingerTrieList<T> from(Iterable<? extends T> elems) {
    final FingerTrieListBuilder<T> builder = new FingerTrieListBuilder<T>();
    for (T elem : elems) {
      builder.add(elem);
    }
    return builder.build();
  }

}

final class FingerTrieListSegmenter implements ListIterator<Object[]> {

  final Object[] prefix;
  final FingerTrieList<Object[]> branch;
  final Object[] suffix;
  @Nullable FingerTrieListSegmenter inner;
  Object @Nullable [] infix;
  int infixIndex;
  int index;
  int phase;

  FingerTrieListSegmenter(FingerTrieList<?> trie) {
    this.prefix = trie.prefix;
    this.branch = trie.branch;
    this.suffix = trie.suffix;
    this.inner = null;
    this.infix = null;
    this.infixIndex = 0;
    this.index = 0;
    this.phase = trie.size > 0 ? 0 : 3;
  }

  FingerTrieListSegmenter(FingerTrieList<?> trie, int index) {
    this.prefix = trie.prefix;
    this.branch = trie.branch;
    this.suffix = trie.suffix;
    this.index = index;
    if (index == 0) {
      this.phase = 0;
    } else if (index - 1 < this.branch.size) {
      this.inner = new FingerTrieListSegmenter(this.branch, (index - 1) >> 5);
      this.infix = this.inner.next();
      this.infixIndex = (index - 1) & 0x1F;
      this.phase = 1;
    } else if (index == 1 + this.branch.size && this.suffix.length > 0) {
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
        if (this.branch.size > 0) {
          this.inner = new FingerTrieListSegmenter(this.branch);
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
        final Object[] head = (Object[]) Assume.nonNull(this.infix)[this.infixIndex];
        this.infixIndex += 1;
        this.index += 1;
        if (this.infixIndex >= Assume.nonNull(this.infix).length) {
          if (Assume.nonNull(this.inner).hasNext()) {
            this.infix = Assume.nonNull(this.inner).next();
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
          return (Object[]) Assume.nonNull(this.infix)[this.infixIndex];
        } else {
          Assume.nonNull(this.inner).previous();
          if (Assume.nonNull(this.inner).hasPrevious()) {
            this.infix = Assume.nonNull(this.inner).previous();
            this.infixIndex = this.infix.length - 1;
            Assume.nonNull(this.inner).next();
            return (Object[]) this.infix[this.infixIndex];
          } else {
            this.inner = null;
            this.phase = 0;
            return this.prefix;
          }
        }
      case 2:
        this.index -= 1;
        if (this.branch.size > 0) {
          if (this.inner == null) {
            this.inner = new FingerTrieListSegmenter(this.branch, this.branch.size);
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
        } else if (this.branch.size > 0) {
          if (this.inner == null) {
            this.inner = new FingerTrieListSegmenter(this.branch, this.branch.size);
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

final class FingerTrieListIterator<T> implements ListIterator<T> {

  final FingerTrieListSegmenter segmenter;
  Object[] page;
  int pageIndex;
  int index;

  FingerTrieListIterator(FingerTrieList<T> trie) {
    this.segmenter = new FingerTrieListSegmenter(trie);
    if (this.segmenter.hasNext()) {
      this.page = this.segmenter.next();
    } else {
      this.page = FingerTrieList.EMPTY_LEAF;
    }
  }

  FingerTrieListIterator(FingerTrieList<T> trie, int index) {
    final int n = index - trie.prefix.length;
    if (n < 0) {
      this.segmenter = new FingerTrieListSegmenter(trie, 1);
      this.page = trie.prefix;
      this.pageIndex = index;
    } else if (index < trie.size) {
      final int j = n - (trie.branch.size << 5);
      if (j < 0) {
        this.segmenter = new FingerTrieListSegmenter(trie, 1 + (n >> 5));
        this.page = this.segmenter.next();
        this.pageIndex = n & 0x1F;
      } else {
        this.segmenter = new FingerTrieListSegmenter(trie, 1 + trie.branch.size);
        this.page = this.segmenter.next();
        this.pageIndex = j;
      }
    } else {
      this.segmenter = new FingerTrieListSegmenter(trie, trie.size);
      this.page = FingerTrieList.EMPTY_LEAF;
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

  @Override
  public @Nullable T next() {
    if (this.pageIndex >= this.page.length) {
      throw new NoSuchElementException();
    }
    final T head = Assume.conforms(this.page[this.pageIndex]);
    this.pageIndex += 1;
    this.index += 1;
    if (this.pageIndex >= this.page.length) {
      if (this.segmenter.hasNext()) {
        this.page = this.segmenter.next();
      } else {
        this.page = FingerTrieList.EMPTY_LEAF;
      }
      this.pageIndex = 0;
    }
    return head;
  }

  @Override
  public boolean hasPrevious() {
    return this.index > 0;
  }

  @Override
  public int previousIndex() {
    return this.index - 1;
  }

  @Override
  public @Nullable T previous() {
    if (this.pageIndex > 0) {
      this.index -= 1;
      this.pageIndex -= 1;
      return Assume.conforms(this.page[this.pageIndex]);
    } else {
      this.segmenter.previous();
      if (this.segmenter.hasPrevious()) {
        this.index -= 1;
        this.page = this.segmenter.previous();
        this.pageIndex = this.page.length - 1;
        this.segmenter.next();
        return Assume.conforms(this.page[this.pageIndex]);
      } else {
        throw new NoSuchElementException();
      }
    }
  }

  @Override
  public void add(@Nullable T elem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void set(@Nullable T elem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }

}
