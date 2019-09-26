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

import java.util.Iterator;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.StreamSupport;

/**
 * Utility methods for manipulating {@link Iterable} instances.
 */
public final class Iterables {

  private Iterables() {
  }

  /**
   * Map a function across an {@link Iterable}.
   *
   * @param it  The iterable.
   * @param f   The function.
   * @param <S> The input type.
   * @param <T> The output type.
   * @return The mapped iterable.
   */
  public static <S, T> Iterable<T> mapIterable(final Iterable<? extends S> it, final Function<S, ? extends T> f) {

    return () -> StreamSupport.stream(it.spliterator(), false).<T>map(f).iterator();
  }

  /**
   * Filter the values of an iterable.
   *
   * @param it        The iterable.
   * @param predicate Predicate on the values.
   * @param <T>       The type of the values.
   * @return The filtered iterable.
   */
  public static <T> Iterable<T> filterIterable(final Iterable<T> it, final Predicate<T> predicate) {
    return () -> StreamSupport.stream(it.spliterator(), false).filter(predicate).iterator();
  }

  /**
   * Flat-map a function across an {@link Iterable}.
   *
   * @param it  The iterable.
   * @param f   The function.
   * @param <S> The input type.
   * @param <T> The output type.
   * @return The mapped iterable.
   */
  public static <S, T> Iterable<T> flatMapIterable(final Iterable<? extends S> it, final Function<S, Iterable<T>> f) {

    return () -> StreamSupport.stream(it.spliterator(), false)
            .flatMap(v -> StreamSupport.stream(f.apply(v).spliterator(), false)).iterator();
  }

  /**
   * Find the index of the first element of an iterable satisfying a predicate.
   *
   * @param iter The iterable.
   * @param pred The predicate.
   * @param <T>  The type of the elements.
   * @return The index of the first element satisfying the predicate or -1 otherwise.
   */
  public static <T> int findFirstIndex(final Iterable<T> iter, final Predicate<T> pred) {
    final Iterator<T> it = iter.iterator();
    return findFirstIndex(it, pred);
  }

  /**
   * Find the index of the first element of an iterator satisfying a predicate.
   *
   * @param it   The iterator.
   * @param pred The predicate.
   * @param <T>  The type of the elements.
   * @return The index of the first element satisfying the predicate or -1 otherwise.
   */
  public static <T> int findFirstIndex(final Iterator<T> it, final Predicate<T> pred) {
    int i = 0;
    while (it.hasNext()) {
      final T next = it.next();
      if (pred.test(next)) {
        return i;
      } else {
        ++i;
      }
    }
    return -1;
  }

  /**
   * Find the index of the first element of an iterable satisfying a predicate.
   *
   * @param iter The iterable.
   * @param pred The predicate.
   * @param <T>  The type of the elements.
   * @return The index of the first element satisfying the predicate or -1 otherwise.
   */
  public static <T> Optional<T> findFirst(final Iterable<T> iter, final Predicate<T> pred) {
    final Iterator<T> it = iter.iterator();
    return findFirst(it, pred);
  }

  /**
   * Find the index of the first element of an iterator satisfying a predicate.
   *
   * @param it   The iterator.
   * @param pred The predicate.
   * @param <T>  The type of the elements.
   * @return The index of the first element satisfying the predicate or -1 otherwise.
   */
  public static <T> Optional<T> findFirst(final Iterator<T> it, final Predicate<T> pred) {
    while (it.hasNext()) {
      final T next = it.next();
      if (pred.test(next)) {
        return Optional.of(next);
      }
    }
    return Optional.empty();
  }
}
