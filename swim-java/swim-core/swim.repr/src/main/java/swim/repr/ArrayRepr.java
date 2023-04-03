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

package swim.repr;

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.HashSet;
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
import swim.util.ToSource;
import swim.util.UpdatableList;

@Public
@Since("5.0")
public final class ArrayRepr implements Repr, UpdatableList<Repr>, ToSource {

  int flags;
  int size;
  Attrs attrs;
  Repr[] array;

  ArrayRepr(int flags, int size, Attrs attrs, Repr[] array) {
    this.flags = flags;
    this.size = size;
    this.attrs = attrs;
    this.array = array;
  }

  @Override
  public Attrs attrs() {
    return this.attrs;
  }

  @Override
  public void setAttrs(Attrs attrs) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    this.attrs = attrs;
  }

  @Override
  public ArrayRepr letAttrs(Attrs attrs) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      return this.withAttrs(attrs);
    } else {
      this.attrs = attrs;
      return this;
    }
  }

  @Override
  public ArrayRepr letAttr(String key, Repr value) {
    return this.letAttrs(this.attrs.let(key, value));
  }

  @Override
  public ArrayRepr letAttr(String key) {
    return this.letAttr(key, Repr.unit());
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public ArrayRepr withAttrs(Attrs attrs) {
    if (attrs == this.attrs) {
      return this;
    } else {
      this.flags |= ALIASED_FLAG;
      return new ArrayRepr(this.flags, this.size, attrs, this.array);
    }
  }

  @Override
  public ArrayRepr withAttr(String key, Repr value) {
    return this.withAttrs(this.attrs.updated(key, value));
  }

  @Override
  public ArrayRepr withAttr(String key) {
    return this.withAttr(key, Repr.unit());
  }

  @Override
  public boolean isDefinite() {
    return this.size != 0;
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
  public boolean contains(@Nullable Object element) {
    if (element != null) {
      for (int i = 0; i < this.size; i += 1) {
        if (element.equals(this.array[i])) {
          return true;
        }
      }
    }
    return false;
  }

  @Override
  public boolean containsAll(Collection<?> elements) {
    Objects.requireNonNull(elements);
    final HashSet<Object> q = new HashSet<Object>(elements);
    for (int i = 0; i < this.size && !q.isEmpty(); i += 1) {
      q.remove(this.array[i]);
    }
    return q.isEmpty();
  }

  @Override
  public int indexOf(@Nullable Object element) {
    if (element != null) {
      for (int i = 0; i < this.size; i += 1) {
        if (element.equals(this.array[i])) {
          return i;
        }
      }
    }
    return -1;
  }

  @Override
  public int lastIndexOf(@Nullable Object element) {
    if (element != null) {
      final Repr[] array = this.array;
      for (int i = this.size - 1; i >= 0; i -= 1) {
        if (element.equals(array[i])) {
          return i;
        }
      }
    }
    return -1;
  }

  @Override
  public Repr get(int index) {
    if (index < 0 || index >= this.size) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return this.array[index];
  }

  @Override
  public Repr set(int index, Repr element) {
    Objects.requireNonNull(element);
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final int n = this.size;
    if (index < 0 || index >= n) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    Repr[] array = this.array;
    final Repr oldElement = array[index];
    if ((this.flags & ALIASED_FLAG) != 0) {
      final Repr[] newArray = new Repr[ArrayRepr.expand(n)];
      System.arraycopy(array, 0, newArray, 0, n);
      array = newArray;
      this.array = array;
      this.flags &= ~ALIASED_FLAG;
    }
    array[index] = element;
    return oldElement;
  }

  @Override
  public ArrayRepr updated(int index, @Nullable Repr element) {
    Objects.requireNonNull(element);
    final int n = this.size;
    if (index < 0 || index >= n) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    final Repr[] newArray = new Repr[ArrayRepr.expand(n)];
    System.arraycopy(this.array, 0, newArray, 0, n);
    newArray[index] = element;
    return new ArrayRepr(0, n, this.attrs, newArray);
  }

  @Override
  public boolean add(Repr element) {
    Objects.requireNonNull(element);
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final int n = this.size;
    Repr[] array = this.array;
    if (n + 1 > array.length || (this.flags & ALIASED_FLAG) != 0) {
      final Repr[] newArray = new Repr[ArrayRepr.expand(n + 1)];
      System.arraycopy(array, 0, newArray, 0, n);
      array = newArray;
      this.array = array;
      this.flags &= ~ALIASED_FLAG;
    }
    array[n] = element;
    this.size = n + 1;
    return true;
  }

  @Override
  public boolean addAll(Collection<? extends Repr> elements) {
    Objects.requireNonNull(elements);
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    int n = this.size;
    final int k = elements.size();
    if (k == 0) {
      return false;
    }
    Repr[] array = this.array;
    if (n + k > array.length || (this.flags & ALIASED_FLAG) != 0) {
      final Repr[] newArray = new Repr[ArrayRepr.expand(n + k)];
      System.arraycopy(array, 0, newArray, 0, n);
      array = newArray;
      this.array = array;
      this.flags &= ~ALIASED_FLAG;
    }
    for (Repr element : elements) {
      array[n] = element;
      n += 1;
    }
    this.size = n;
    return true;
  }

  @Override
  public ArrayRepr appended(@Nullable Repr element) {
    Objects.requireNonNull(element);
    final int n = this.size;
    final Repr[] newArray = new Repr[ArrayRepr.expand(n + 1)];
    System.arraycopy(this.array, 0, newArray, 0, n);
    newArray[n] = element;
    return new ArrayRepr(0, n + 1, this.attrs, newArray);
  }

  @Override
  public void add(int index, Repr element) {
    Objects.requireNonNull(element);
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final int n = this.size;
    if (index < 0 || index > n) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    Repr[] array = this.array;
    if (n + 1 > array.length || (this.flags & ALIASED_FLAG) != 0) {
      final Repr[] newArray = new Repr[ArrayRepr.expand(n + 1)];
      System.arraycopy(array, 0, newArray, 0, index);
      System.arraycopy(array, index, newArray, index + 1, n - index);
      array = newArray;
      this.array = array;
      this.flags &= ~ALIASED_FLAG;
    } else {
      System.arraycopy(array, index, array, index + 1, n - index);
    }
    array[index] = element;
    this.size = n + 1;
  }

  @Override
  public boolean addAll(int index, Collection<? extends Repr> elements) {
    Objects.requireNonNull(elements);
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final int n = this.size;
    if (index < 0 || index > n) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    final int k = elements.size();
    if (k == 0) {
      return false;
    }
    Repr[] array = this.array;
    if (n + k > array.length || (this.flags & ALIASED_FLAG) != 0) {
      final Repr[] newArray = new Repr[ArrayRepr.expand(n + k)];
      System.arraycopy(array, 0, newArray, 0, index);
      System.arraycopy(array, index, newArray, index + k, n - index);
      array = newArray;
      this.array = array;
      this.flags &= ~ALIASED_FLAG;
    } else {
      System.arraycopy(array, index, array, index + k, n - index);
    }
    for (Repr element : elements) {
      array[index] = element;
      index += 1;
    }
    this.size = n + k;
    return true;
  }

  @Override
  public Repr remove(int index) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final int n = this.size;
    if (index < 0 || index >= n) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    Repr[] array = this.array;
    final Repr oldElement = array[index];
    if ((this.flags & ALIASED_FLAG) != 0) {
      final Repr[] newArray = new Repr[ArrayRepr.expand(n - 1)];
      System.arraycopy(array, 0, newArray, 0, index);
      System.arraycopy(array, index + 1, newArray, index, n - index - 1);
      array = newArray;
      this.array = array;
      this.flags &= ~ALIASED_FLAG;
    } else {
      System.arraycopy(array, index + 1, array, index, n - index - 1);
      array[n - 1] = null;
    }
    this.size = n - 1;
    return oldElement;
  }

  @Override
  public boolean remove(@Nullable Object element) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final int index = this.indexOf(element);
    if (index >= 0) {
      this.remove(index);
      return true;
    } else {
      return false;
    }
  }

  @Override
  public ArrayRepr removed(int index) {
    final int n = this.size;
    if (index < 0 || index >= n) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    final Repr[] array = this.array;
    final Repr[] newArray = new Repr[ArrayRepr.expand(n - 1)];
    System.arraycopy(array, 0, newArray, 0, index);
    System.arraycopy(array, index + 1, newArray, index, n - index - 1);
    return new ArrayRepr(0, n - 1, this.attrs, newArray);
  }

  @Override
  public ArrayRepr removed(@Nullable Object element) {
    final int index = this.indexOf(element);
    if (index >= 0) {
      return this.removed(index);
    } else {
      return this;
    }
  }

  @Override
  public boolean removeAll(Collection<?> elements) {
    Objects.requireNonNull(elements);
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final int n = this.size;
    Repr[] array = this.array;
    final Repr[] newArray;
    if ((this.flags & ALIASED_FLAG) != 0) {
      newArray = new Repr[ArrayRepr.expand(n)];
    } else {
      newArray = array;
    }
    int i = 0;
    int j = 0;
    while (i < n) {
      final Repr element = array[i];
      if (!elements.contains(element)) {
        newArray[j] = element;
        j += 1;
      }
      i += 1;
    }
    if (i > j) {
      if ((this.flags & ALIASED_FLAG) != 0) {
        array = newArray;
        this.array = array;
        this.flags &= ~ALIASED_FLAG;
      } else {
        while (i > j) {
          i -= 1;
          array[i] = null;
        }
      }
      this.size = j;
      return true;
    } else {
      return false;
    }
  }

  @Override
  public boolean retainAll(Collection<?> elements) {
    Objects.requireNonNull(elements);
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final int n = this.size;
    Repr[] array = this.array;
    final Repr[] newArray;
    if ((this.flags & ALIASED_FLAG) != 0) {
      newArray = new Repr[ArrayRepr.expand(n)];
    } else {
      newArray = array;
    }
    int i = 0;
    int j = 0;
    while (i < n) {
      final Repr element = array[i];
      if (elements.contains(element)) {
        newArray[j] = element;
        j += 1;
      }
      i += 1;
    }
    if (i > j) {
      if ((this.flags & ALIASED_FLAG) != 0) {
        array = newArray;
        this.array = array;
        this.flags &= ~ALIASED_FLAG;
      } else {
        while (i > j) {
          i -= 1;
          array[i] = null;
        }
      }
      this.size = j;
      return true;
    } else {
      return false;
    }
  }

  @Override
  public void clear() {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    this.array = EMPTY_ARRAY;
    this.size = 0;
    this.flags |= ALIASED_FLAG;
  }

  public boolean isMarkup() {
    return (this.flags & MARKUP_HINT) != 0;
  }

  public ArrayRepr asMarkup() {
    if ((this.flags & IMMUTABLE_FLAG) == 0) {
      this.flags |= MARKUP_HINT;
      return this;
    } else {
      return this.clone().asMarkup();
    }
  }

  @Override
  public boolean isMutable() {
    return (this.flags & IMMUTABLE_FLAG) == 0;
  }

  public ArrayRepr asMutable() {
    return this.isMutable() ? this : this.clone();
  }

  @Override
  public ArrayRepr clone() {
    this.flags |= ALIASED_FLAG;
    return new ArrayRepr(this.flags & ~(IMMUTABLE_FLAG | ALIASED_FLAG),
                         this.size, this.attrs, this.array);
  }

  @Override
  public ArrayRepr commit() {
    if ((this.flags & IMMUTABLE_FLAG) == 0) {
      this.flags |= IMMUTABLE_FLAG;
      this.attrs.commit();
      for (int i = 0; i < this.size; i += 1) {
        this.array[i].commit();
      }
    }
    return this;
  }

  @Override
  public Repr[] toArray() {
    final int n = this.size;
    final Repr[] array = new Repr[n];
    System.arraycopy(this.array, 0, array, 0, n);
    return array;
  }

  @Override
  public <T> T[] toArray(T[] array) {
    final int n = this.size;
    if (array.length < n) {
      array = Assume.conforms(Array.newInstance(array.getClass().getComponentType(), n));
    }
    System.arraycopy(this.array, 0, array, 0, n);
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  @Override
  public List<Repr> subList(int fromIndex, int toIndex) {
    if (fromIndex < 0 || toIndex > this.size || fromIndex > toIndex) {
      throw new IndexOutOfBoundsException(fromIndex + ", " + toIndex);
    }
    final int n = toIndex - fromIndex;
    final Repr[] array = new Repr[n];
    System.arraycopy(this.array, fromIndex, array, 0, n);
    return new ArrayRepr(0, n, Attrs.empty(), array);
  }

  @Override
  public void forEach(Consumer<? super Repr> action) {
    for (int i = 0; i < this.size; i += 1) {
      action.accept(this.array[i]);
    }
  }

  @Override
  public Iterator<Repr> iterator() {
    return new ArrayReprIterator(this);
  }

  @Override
  public ListIterator<Repr> listIterator() {
    return new ArrayReprIterator(this);
  }

  @Override
  public ListIterator<Repr> listIterator(int index) {
    if (index < 0 || index > this.size) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return new ArrayReprIterator(this, index);
  }

  @Override
  public String formatValue() {
    final StringBuilder builder = new StringBuilder();
    for (int i = 0; i < this.size; i += 1) {
      builder.append(this.array[i].formatValue());
    }
    return builder.toString();
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof List<?>) {
      final List<?> that = (List<?>) other;
      if (!(that instanceof ArrayRepr) || this.attrs.equals(((ArrayRepr) that).attrs)) {
        final Iterator<Repr> xs = this.iterator();
        final Iterator<?> ys = that.iterator();
        while (xs.hasNext() && ys.hasNext()) {
          if (!xs.next().equals(ys.next())) {
            return false;
          }
        }
        return !xs.hasNext() && !ys.hasNext();
      }
    }
    return false;
  }

  @Override
  public int hashCode() {
    int code = 1;
    for (int i = 0; i < this.size; i += 1) {
      code = 31 * code + this.array[i].hashCode();
    }
    return code;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.size == 0 && (this.flags & IMMUTABLE_FLAG) != 0) {
      notation.beginInvoke("ArrayRepr", "empty").endInvoke();
    } else {
      notation.beginInvoke("ArrayRepr", "of");
      for (int i = 0; i < this.size; i += 1) {
        notation.appendArgument(this.array[i]);
      }
      notation.endInvoke();
    }
    if (!this.attrs.isEmpty()) {
      this.attrs.writeWithAttrs(notation);
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final int IMMUTABLE_FLAG = 1 << 0;

  static final int ALIASED_FLAG = 1 << 1;

  static final int MARKUP_HINT = 1 << 2;

  private static final Repr[] EMPTY_ARRAY = new Repr[0];

  private static final ArrayRepr EMPTY = new ArrayRepr(IMMUTABLE_FLAG | ALIASED_FLAG,
                                                       0, Attrs.empty(), EMPTY_ARRAY);

  public static ArrayRepr empty() {
    return EMPTY;
  }

  public static ArrayRepr ofCapacity(int initialCapacity) {
    return new ArrayRepr(0, 0, Attrs.empty(), new Repr[initialCapacity]);
  }

  public static ArrayRepr of() {
    return new ArrayRepr(ALIASED_FLAG, 0, Attrs.empty(), EMPTY_ARRAY);
  }

  public static ArrayRepr of(Repr element) {
    return new ArrayRepr(0, 1, Attrs.empty(), new Repr[] {element});
  }

  public static ArrayRepr of(Repr... elements) {
    Objects.requireNonNull(elements);
    return new ArrayRepr(0, elements.length, Attrs.empty(), elements);
  }

  public static ArrayRepr from(@Nullable Collection<?> elements) throws ReprException {
    final int size = elements != null ? elements.size() : 0;
    final Repr[] array = new Repr[size];
    if (elements != null) {
      int i = 0;
      for (Object element : elements) {
        array[i] = Repr.from(element);
        i += 1;
      }
    }
    return new ArrayRepr(0, size, Attrs.empty(), array);
  }

  static int expand(int n) {
    n = Math.max(1, n) - 1;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
  }

}

final class ArrayReprIterator implements ListIterator<Repr> {

  final ArrayRepr repr;
  final int fromIndex;
  final int toIndex;
  int index;
  int direction;

  ArrayReprIterator(ArrayRepr repr, int index) {
    this.repr = repr;
    this.index = index;
    this.fromIndex = 0;
    this.toIndex = repr.size();
    this.direction = 0;
  }

  ArrayReprIterator(ArrayRepr repr) {
    this.repr = repr;
    this.index = 0;
    this.fromIndex = 0;
    this.toIndex = repr.size();
    this.direction = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.toIndex;
  }

  @Override
  public int nextIndex() {
    return this.index - this.fromIndex;
  }

  @Override
  public Repr next() {
    final int i = this.index;
    if (i < this.fromIndex || i >= this.toIndex) {
      throw new NoSuchElementException();
    }
    final Repr element = this.repr.get(i);
    this.index = i + 1;
    this.direction = 1;
    return element;
  }

  @Override
  public boolean hasPrevious() {
    return this.index > this.fromIndex;
  }

  @Override
  public int previousIndex() {
    return this.index - this.fromIndex - 1;
  }

  @Override
  public Repr previous() {
    final int i = this.index - 1;
    if (i < this.fromIndex || i >= this.toIndex) {
      throw new NoSuchElementException();
    }
    this.index = i;
    this.direction = -1;
    return this.repr.get(i);
  }

  @Override
  public void add(Repr element) {
    final int i = this.index;
    this.repr.add(i, element);
    this.index = i + 1;
    this.direction = 0;
  }

  @Override
  public void set(Repr element) {
    if (this.direction == 0) {
      throw new IllegalStateException();
    }
    if (this.direction > 0) {
      this.repr.set(this.index - 1, element);
    } else {
      this.repr.set(this.index, element);
    }
  }

  @Override
  public void remove() {
    if (this.direction == 0) {
      throw new IllegalStateException();
    }
    if (this.direction > 0) {
      this.index -= 1;
    }
    this.repr.remove(this.index);
    this.direction = 0;
  }

}
