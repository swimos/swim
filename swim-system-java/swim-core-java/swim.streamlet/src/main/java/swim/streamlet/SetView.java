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

package swim.streamlet;

import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.function.Predicate;
import swim.collections.HashTrieSet;

/**
 * An immutable view of the contents of a set.
 *
 * @param <T> The type of the elements.
 */
public interface SetView<T> extends Iterable<T> {

  /**
   * @return The size of the set.
   */
  int size();

  /**
   * @param value A value.
   * @return Whether the set contains teh value.
   */
  boolean contains(T value);

  /**
   * Create a new set view that is the same as this one only with an additional value added.
   *
   * @param value The additional value.
   * @return The new set view.
   */
  SetView<T> added(T value);

  /**
   * Create a new set view that is the same as this one only with a value removed.
   *
   * @param value The value to remove.
   * @return The new set view.
   */
  SetView<T> removed(T value);

  /**
   * Create a new view based on this one but with some values filtered.
   *
   * @param p The predicate the filter the values.
   * @return The filtered view.
   */
  SetView<T> filter(Predicate<T> p);

  /**
   * View a {@link HashTrieSet}.
   *
   * @param set The set to wrap.
   * @param <T> The type of the elements.
   * @return The view.
   */
  static <T> SetView<T> wrap(final HashTrieSet<T> set) {
    return new SetWrapper<>(set);
  }

  /**
   * View a Java set.
   *
   * @param set The set to wrap.
   * @param <T> The type of the elements.
   * @return The view.
   */
  static <T> SetView<T> wrap(final Set<T> set) {
    return new JavaSetWrapper<>(set);
  }
}

class FilteredIterator<T> implements Iterator<T> {
  private final Iterator<T> inner;
  private final Predicate<T> pred;
  private T next;

  FilteredIterator(final Iterator<T> inner, final Predicate<T> pred) {
    this.inner = inner;
    this.pred = pred;
    next = null;
    while (this.inner.hasNext()) {
      final T value = inner.next();
      if (pred.test(value)) {
        next = value;
        break;
      }
    }
  }

  @Override
  public boolean hasNext() {
    return next != null;
  }

  @Override
  public T next() {
    if (next == null) {
      throw new NoSuchElementException();
    }
    final T current = next;
    next = null;
    while (this.inner.hasNext()) {
      final T value = inner.next();
      if (pred.test(value)) {
        next = value;
        break;
      }
    }
    return current;
  }
}

class FilteredSetView<T> implements SetView<T> {

  private final SetView<T> wrapped;
  private final Predicate<T> predicate;

  FilteredSetView(final SetView<T> wrapped, final Predicate<T> prediate) {
    this.wrapped = wrapped;
    this.predicate = prediate;
  }

  private int size = -1;

  @Override
  public int size() {
    if (size < 0) {
      int n = 0;
      for (final T val : wrapped) {
        if (predicate.test(val)) {
          ++n;
        }
      }
      size = n;
    }
    return size;
  }

  @Override
  public boolean contains(final T value) {
    return predicate.test(value) && wrapped.contains(value);
  }

  @Override
  public SetView<T> added(final T value) {
    if (predicate.test(value) && !wrapped.contains(value)) {
      return new FilteredSetView<>(wrapped.added(value), predicate);
    } else {
      return this;
    }
  }

  @Override
  public SetView<T> removed(final T value) {
    if (!predicate.test(value) && wrapped.contains(value)) {
      return new FilteredSetView<>(wrapped.removed(value), predicate);
    } else {
      return this;
    }
  }

  @Override
  public SetView<T> filter(final Predicate<T> p) {
    return new FilteredSetView<>(wrapped, predicate.and(p));
  }

  @Override
  public Iterator<T> iterator() {
    return new FilteredIterator<>(wrapped.iterator(), predicate);
  }
}

class SetWrapper<T> implements SetView<T> {

  private final HashTrieSet<T> wrapped;

  SetWrapper(final HashTrieSet<T> wrapped) {
    this.wrapped = wrapped;
  }

  @Override
  public int size() {
    return wrapped.size();
  }

  @Override
  public boolean contains(final T value) {
    return wrapped.contains(value);
  }

  @Override
  public SetView<T> added(final T value) {
    return new SetWrapper<>(wrapped.added(value));
  }

  @Override
  public SetView<T> removed(final T value) {
    return new SetWrapper<>(wrapped.removed(value));
  }

  @Override
  public SetView<T> filter(final Predicate<T> p) {
    return new FilteredSetView<>(this, p);
  }

  @Override
  public Iterator<T> iterator() {
    return wrapped.iterator();
  }
}

class JavaSetWrapper<T> implements SetView<T> {

  private final Set<T> wrapped;

  JavaSetWrapper(final Set<T> wrapped) {
    this.wrapped = wrapped;
  }

  @Override
  public int size() {
    return wrapped.size();
  }

  @Override
  public boolean contains(final T value) {
    return wrapped.contains(value);
  }

  @Override
  public SetView<T> added(final T value) {
    if (!wrapped.contains(value)) {
      return new SetWrapper<>(HashTrieSet.from(wrapped).added(value));
    } else {
      return this;
    }
  }

  @Override
  public SetView<T> removed(final T value) {
    if (wrapped.contains(value)) {
      return new SetWrapper<>(HashTrieSet.from(wrapped).removed(value));
    } else {
      return this;
    }
  }

  @Override
  public SetView<T> filter(final Predicate<T> p) {
    return new FilteredSetView<>(this, p);
  }

  @Override
  public Iterator<T> iterator() {
    return wrapped.iterator();
  }
}
