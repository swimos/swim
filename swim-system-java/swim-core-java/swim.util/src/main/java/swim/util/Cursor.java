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

package swim.util;

import java.util.ListIterator;
import java.util.Map;

public interface Cursor<T> extends ListIterator<T> {
  boolean isEmpty();

  T head();

  void step();

  void skip(long count);

  @Override
  boolean hasNext();

  long nextIndexLong();

  @Override
  default int nextIndex() {
    final long k = nextIndexLong();
    final int i = (int) k;
    if (i != k) {
      throw new IndexOutOfBoundsException("index overflow");
    }
    return i;
  }

  @Override
  T next();

  boolean hasPrevious();

  long previousIndexLong();

  @Override
  default int previousIndex() {
    final long k = previousIndexLong();
    final int i = (int) k;
    if (i != k) {
      throw new IndexOutOfBoundsException("index overflow");
    }
    return i;
  }

  T previous();

  @Override
  default void set(T object) {
    throw new UnsupportedOperationException();
  }

  @Override
  default void add(T object) {
    throw new UnsupportedOperationException();
  }

  @Override
  default void remove() {
    throw new UnsupportedOperationException();
  }

  default void load() throws InterruptedException {
    // stub
  }

  static <T> Cursor<T> empty() {
    return new CursorEmpty<T>();
  }

  static <T> Cursor<T> unary(T value) {
    return new CursorUnary<T>(value);
  }

  static <T> Cursor<T> array(Object[] array, int index, int limit) {
    return new CursorArray<T>(array, index, limit);
  }

  static <T> Cursor<T> array(Object[] array, int index) {
    return new CursorArray<T>(array, index, array.length);
  }

  static <T> Cursor<T> array(Object[] array) {
    return new CursorArray<T>(array, 0, array.length);
  }

  static <K> Cursor<K> keys(Cursor<? extends Map.Entry<? extends K, ?>> entries) {
    return new CursorKeys<K>(entries);
  }

  static <V> Cursor<V> values(Cursor<? extends Map.Entry<?, ? extends V>> entries) {
    return new CursorValues<V>(entries);
  }
}
