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

package swim.dataflow;

import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Stream;
import swim.streaming.windows.WindowFunction;
import swim.util.Either;
import swim.util.Pair;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.reducing;
import static java.util.stream.Collectors.toList;
import static java.util.stream.StreamSupport.stream;

/**
 * Joins two streams together across a shared windowing strategy according to a keying function for both types.
 *
 * @param <T1> The type of the left hand values.
 * @param <T2> The type of the right hand values.
 * @param <K>  The type of the keys.
 * @param <U>  The type of the combination of the values.
 * @param <W>  The type of the windows.
 */
class WindowJoinFunction<T1, T2, K, U, W> implements WindowFunction<Either<T1, T2>, W, List<Pair<K, U>>> {

  private final Function<T1, K> firstToKey;
  private final Function<T2, K> secondToKey;
  private final BiFunction<T1, T2, U> combine;

  /**
   * @param firstKeys  Assigns keys to the first type.
   * @param secondKeys Assigns keys to the second type.
   * @param combineFun Combines values of both types.
   */
  WindowJoinFunction(final Function<T1, K> firstKeys,
                     final Function<T2, K> secondKeys,
                     final BiFunction<T1, T2, U> combineFun) {
    firstToKey = firstKeys;
    secondToKey = secondKeys;
    combine = combineFun;
  }

  @Override
  public List<Pair<K, U>> apply(final W window, final Iterable<Either<T1, T2>> contents) {
    final Function<Either<T1, T2>, K> toKey = either -> either.match(firstToKey, secondToKey);

    final Map<K, Acc<T1, T2>> map = stream(contents.spliterator(), false)
            .collect(groupingBy(toKey, reducing(new Acc<>(null, null),
                    WindowJoinFunction::from, Acc::add)));

    return map.entrySet().stream()
            .flatMap(this::complete)
            .collect(toList());
  }

  private static <S, T> Acc<S, T> from(final Either<S, T> either) {
    return either.match(l -> new Acc<>(l, null), r -> new Acc<>(null, r));
  }

  private Stream<Pair<K, U>> complete(final Map.Entry<K, Acc<T1, T2>> entry) {
    final Acc<T1, T2> acc = entry.getValue();
    if (acc.left != null && acc.right != null) {
      return Stream.of(new Pair<>(entry.getKey(), combine.apply(acc.left, acc.right)));
    } else {
      return Stream.empty();
    }
  }

  /**
   * Accumulation of values for a key.
   *
   * @param <S> The left hand type.
   * @param <T> The right hand type.
   */
  private static final class Acc<S, T> {
    private final S left;
    private final T right;

    Acc(final S leftVal, final T rightVal) {
      left = leftVal;
      right = rightVal;
    }

    Acc<S, T> add(final Acc<S, T> other) {
      final S l = left != null ? left : other.left;
      final T r = right != null ? right : other.right;
      return new Acc<>(l, r);
    }


  }

}
