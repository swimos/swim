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

package swim.dataflow.graph;

import java.util.function.BiFunction;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import swim.dataflow.graph.windows.Group;
import swim.dataflow.graph.windows.InvertibleFolder;
import swim.dataflow.graph.windows.KeyedWindowBinOp;
import swim.dataflow.graph.windows.KeyedWindowFoldFunction;
import swim.dataflow.graph.windows.KeyedWindowFunction;
import swim.dataflow.graph.windows.eviction.EvictionStrategy;
import swim.dataflow.graph.windows.triggers.Trigger;
import swim.structure.Form;

/**
 * A {@link MapSwimStream} that has been partitioned into (possibly overlapping) windows.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 * @param <W> The type of the windows.
 */
public interface MapWindowedSwimStream<K, V, W> {

  /**
   * @return The form of the key type.
   */
  Form<K> keyForm();

  /**
   * @return The form of the value type.
   */
  Form<V> valueForm();

  /**
   * @return The form of the window type.
   */
  Form<W> windowForm();

  /**
   * Collapse each window into a single value in a new stream.
   *
   * @param winFun Function to transform the window contents.
   * @param form   The form of the result type.
   * @param <U>    The result type.
   * @return A stream containing the results.
   */
  <U> MapSwimStream<K, U> mapWindow(KeyedWindowFunction<K, V, W, U> winFun, Form<U> form);

  /**
   * Collapse each window into a single value in a new stream.
   *
   * @param winFun Function to transform the window contents.
   * @return A stream containing the results.
   */
  default MapSwimStream<K, V> mapWindow(final KeyedWindowFunction<K, V, W, V> winFun) {
    return mapWindow(winFun, valueForm());
  }

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(KeyedWindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link U} is bounded).
   *
   * @param seed     The initial value for the fold operation.
   * @param winFun   The fold operation.
   * @param combiner Combines intermediate results.
   * @param form     The form of the result type.
   * @param <U>      The result type.
   * @return A stream containing the results.
   */
  <U> MapSwimStream<K, U> fold(U seed, KeyedWindowFoldFunction<K, V, W, U> winFun, BinaryOperator<U> combiner, Form<U> form);

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(KeyedWindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link V} is bounded).
   *
   * @param seed     The initial value for the fold operation.
   * @param winFun   The fold operation.
   * @param combiner Combines intermediate results.
   * @return A stream containing the results.
   */
  default MapSwimStream<K, V> fold(final V seed, final KeyedWindowFoldFunction<K, V, W, V> winFun, final BinaryOperator<V> combiner) {
    return fold(seed, winFun, combiner, valueForm());
  }


  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(KeyedWindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link U} is bounded).
   *
   * @param seed   The initial value for the fold operation.
   * @param winFun The fold operation.
   * @param form   The form of the result type.
   * @param <U>    The result type.
   * @return A stream containing the results.
   */
  default <U> MapSwimStream<K, U> fold(final U seed, final KeyedWindowFoldFunction<K, V, W, U> winFun, final Form<U> form) {
    return fold(seed, winFun, null, form);
  }

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(KeyedWindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link V} is bounded).
   *
   * @param seed   The initial value for the fold operation.
   * @param winFun The fold operation.
   * @return A stream containing the results.
   */
  default MapSwimStream<K, V> fold(final V seed, final KeyedWindowFoldFunction<K, V, W, V> winFun) {
    return fold(seed, winFun, null, valueForm());
  }

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(KeyedWindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link U} is bounded). The seed value is computed from
   * the key and the window.
   *
   * @param seed     The seed initialization function.
   * @param winFun   The fold operation.
   * @param combiner Combines intermediate results.
   * @param form     The form of the result type.
   * @param <U>      The result type.
   * @return A stream containing the results.
   */
  <U> MapSwimStream<K, U> foldByKeyWithCombiner(BiFunction<K, W, U> seed, KeyedWindowFoldFunction<K, V, W, U> winFun,
                                                KeyedWindowBinOp<K, U, W> combiner, Form<U> form);

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(KeyedWindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link V} is bounded). The seed value is computed from
   * the key and the window.
   *
   * @param seed     The seed initialization function.
   * @param winFun   The fold operation.
   * @param combiner Combines intermediate results.
   * @return A stream containing the results.
   */
  default MapSwimStream<K, V> foldByKeyWithCombiner(final BiFunction<K, W, V> seed,
                                                    final KeyedWindowFoldFunction<K, V, W, V> winFun,
                                                    final KeyedWindowBinOp<K, V, W> combiner) {
    return foldByKeyWithCombiner(seed, winFun, combiner, valueForm());
  }

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(KeyedWindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link U} is bounded). The seed value is computed from
   * the key and the window.
   *
   * @param seed   The seed initialization function.
   * @param winFun The fold operation.
   * @param form   The form of the result type.
   * @param <U>    The result type.
   * @return A stream containing the results.
   */
  default <U> MapSwimStream<K, U> foldByKey(final BiFunction<K, W, U> seed,
                                            final KeyedWindowFoldFunction<K, V, W, U> winFun, final Form<U> form) {
    return foldByKeyWithCombiner(seed, winFun, null, form);
  }

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(KeyedWindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link V} is bounded). The seed value is computed from
   * the key and the window.
   *
   * @param seed   The seed initialization function.
   * @param winFun The fold operation.
   * @return A stream containing the results.
   */
  default MapSwimStream<K, V> foldByKey(final BiFunction<K, W, V> seed,
                                        final KeyedWindowFoldFunction<K, V, W, V> winFun) {
    return foldByKeyWithCombiner(seed, winFun, null, valueForm());
  }

  /**
   * Reduce each window into a single value in a new stream.
   *
   * @param op The binary operation on the values.
   * @return A stream containing the results.
   */
  MapSwimStream<K, V> reduceByKey(KeyedWindowBinOp<K, V, W> op);

  /**
   * Reduce by key using a group operation.
   *
   * @param group The group.
   * @return The reduced stream.
   */
  default MapSwimStream<K, V> groupReduce(final Group<V> group) {
    return groupReduce((k, w) -> group);
  }

  /**
   * Reduce by key using a group operation.
   *
   * @param group The group operation by key.
   * @return The reduced stream.
   */
  default MapSwimStream<K, V> groupReduce(final BiFunction<K, W, Group<V>> group) {
    return reduceByKey((k, w, t1, t2) -> group.apply(k, w).add(t1, t2));
  }

  /**
   * Fold the streams using an invertible fold operation.
   *
   * @param folder The fold operation.
   * @param form   The form of the output.
   * @param <U>    The type of the output.
   * @return The folded stream
   */
  default <U> MapSwimStream<K, U> fold(final InvertibleFolder<V, U> folder, final Form<U> form) {
    return fold((k, w) -> folder, form);
  }

  /**
   * Fold the streams using an invertible fold operation.
   *
   * @param folder The fold operation.
   * @return The folded stream
   */
  default MapSwimStream<K, V> fold(final InvertibleFolder<V, V> folder) {
    return fold((k, w) -> folder, valueForm());
  }

  /**
   * Fold the streams using an invertible fold operation.
   *
   * @param folder The fold operation by key.
   * @param form   The form of the output.
   * @param <U>    The type of the output.
   * @return The folded stream
   */
  default <U> MapSwimStream<K, U> fold(final BiFunction<K, W, InvertibleFolder<V, U>> folder, final Form<U> form) {
    final BiFunction<K, W, U> seed = folder.andThen(InvertibleFolder::zero);
    final KeyedWindowFoldFunction<K, V, W, U> foldOp = (k, w, t1, t2) -> folder.apply(k, w).add(t1, t2);
    return foldByKeyWithCombiner(seed, foldOp, null, form);
  }

  /**
   * Fold the streams using an invertible fold operation.
   *
   * @param folder The fold operation by key.
   * @return The folded stream
   */
  default MapSwimStream<K, V> fold(final BiFunction<K, W, InvertibleFolder<V, V>> folder) {
    return fold(folder, valueForm());
  }

  /**
   * Change the trigger for the windowing on this stream.
   *
   * @param trigger The window trigger.
   * @return Copy of this stream with a new trigger.
   */
  MapWindowedSwimStream<K, V, W> withTrigger(Function<K, Trigger<V, W>> trigger);

  /**
   * Change the trigger for the windowing on this stream.
   *
   * @param trigger The window trigger.
   * @return Copy of this stream with a new trigger.
   */
  default MapWindowedSwimStream<K, V, W> withTrigger(final Trigger<V, W> trigger) {
    return withTrigger(k -> trigger);
  }

  /**
   * Change the eviction strategy for the windowing on this stream.
   *
   * @param eviction The eviction strategy.
   * @return Copy of this stream with a new eviction strategy.
   */
  MapWindowedSwimStream<K, V, W> withEviction(Function<K, EvictionStrategy<V, W>> eviction);

  /**
   * Set whether the stream state is transient.
   *
   * @param isTransient Whether the stream is transient.
   * @return Copy of this stream with the flag altered.
   */
  MapWindowedSwimStream<K, V, W> setIsTransient(boolean isTransient);

  /**
   * Change the eviction for the windowing on this stream.
   *
   * @param eviction The eviction strategy.
   * @return Copy of this stream with a new eviction strategy.
   */
  default MapWindowedSwimStream<K, V, W> withEviction(final EvictionStrategy<V, W> eviction) {
    return withEviction(k -> eviction);
  }

}
