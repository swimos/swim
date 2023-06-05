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

package swim.util;

import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class Iterators {

  private Iterators() {
    // static
  }

  public static <T> Iterator<T> unary(@Nullable T value) {
    return new UnaryIterator<T>(value);
  }

  public static <T> Iterator<T> concat(Iterator<? extends T> prefix, Iterator<? extends T> suffix) {
    Objects.requireNonNull(prefix, "prefix");
    Objects.requireNonNull(suffix, "suffix");
    return new ConcatIterator<T>(prefix, suffix);
  }

  public static <T> Iterator<T> prefixed(@Nullable T element0, Iterator<? extends T> elements) {
    Objects.requireNonNull(elements, "elements");
    return new PrefixedIterator<T>(element0, elements);
  }

}

final class UnaryIterator<T> implements Iterator<T> {

  @Nullable T value;
  int index;

  UnaryIterator(@Nullable T value) {
    this.value = value;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index == 0;
  }

  @Override
  public @Nullable T next() {
    if (this.index != 0) {
      throw new NoSuchElementException();
    }
    final T value = this.value;
    this.value = null;
    this.index = 1;
    return value;
  }

}

final class ConcatIterator<T> implements Iterator<T> {

  @Nullable Iterator<? extends T> prefix;
  @Nullable Iterator<? extends T> suffix;

  ConcatIterator(@Nullable Iterator<? extends T> prefix, @Nullable Iterator<? extends T> suffix) {
    this.prefix = prefix;
    this.suffix = suffix;
  }

  @Override
  public boolean hasNext() {
    if (this.prefix != null) {
      if (this.prefix.hasNext()) {
        return true;
      }
      this.prefix = null;
    }
    if (this.suffix != null) {
      if (this.suffix.hasNext()) {
        return true;
      }
      this.suffix = null;
    }
    return false;
  }

  @Override
  public @Nullable T next() {
    if (this.prefix != null) {
      try {
        return this.prefix.next();
      } catch (NoSuchElementException cause) {
        this.prefix = null;
      }
    }
    if (this.suffix != null) {
      try {
        return this.suffix.next();
      } catch (NoSuchElementException cause) {
        this.suffix = null;
        throw cause;
      }
    }
    throw new NoSuchElementException();
  }

}

final class PrefixedIterator<T> implements Iterator<T> {

  @Nullable T element0;
  @Nullable Iterator<? extends T> elements;
  boolean hasFirst;

  PrefixedIterator(@Nullable T element0, @Nullable Iterator<? extends T> elements) {
    this.element0 = element0;
    this.elements = elements;
    this.hasFirst = true;
  }

  @Override
  public boolean hasNext() {
    if (this.hasFirst) {
      return true;
    } else if (this.elements != null) {
      if (this.elements.hasNext()) {
        return true;
      }
      this.elements = null;
    }
    return false;
  }

  @Override
  public @Nullable T next() {
    if (this.hasFirst) {
      final T element0 = this.element0;
      this.element0 = null;
      this.hasFirst = false;
      return element0;
    } else if (this.elements != null) {
      try {
        return this.elements.next();
      } catch (NoSuchElementException cause) {
        this.elements = null;
        throw cause;
      }
    }
    throw new NoSuchElementException();
  }

}
