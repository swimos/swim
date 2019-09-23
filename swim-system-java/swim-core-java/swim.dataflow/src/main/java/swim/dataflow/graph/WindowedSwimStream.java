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

import java.util.function.Function;
import swim.dataflow.graph.windows.Group;
import swim.dataflow.graph.windows.InvertibleFolder;
import swim.dataflow.graph.windows.WindowBinOp;
import swim.dataflow.graph.windows.WindowFoldFunction;
import swim.dataflow.graph.windows.WindowFunction;
import swim.dataflow.graph.windows.eviction.EvictionStrategy;
import swim.dataflow.graph.windows.triggers.Trigger;
import swim.structure.Form;

/**
 * A {@link SwimStream} that has been partitioned into (possibly overlapping) windows.
 *
 * @param <T> The type of the values.
 * @param <W> The type of the windows.
 */
public interface WindowedSwimStream<T, W> {

  /**
   * @return Form of the type of the values.
   */
  Form<T> form();

  /**
   * @return Form of the type of the windows.
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
  <U> SwimStream<U> mapWindow(WindowFunction<T, W, U> winFun, Form<U> form);

  /**
   * Collapse each window into a single value in a new stream.
   *
   * @param winFun Function to transform the window contents.
   * @return A stream containing the results.
   */
  default SwimStream<T> mapWindow(final WindowFunction<T, W, T> winFun) {
    return mapWindow(winFun, form());
  }

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(WindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link U} is bounded).
   *
   * @param seed   The initial value for the fold operation.
   * @param winFun The fold operation.
   * @param form   The form of the result type.
   * @param <U>    The result type.
   * @return A stream containing the results.
   */
  <U> SwimStream<U> fold(U seed, WindowFoldFunction<T, W, U> winFun, Form<U> form);

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(WindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link T} is bounded).
   *
   * @param seed   The initial value for the fold operation.
   * @param winFun The fold operation.
   * @return A stream containing the results.
   */
  default SwimStream<T> fold(final T seed, final WindowFoldFunction<T, W, T> winFun) {
    return fold(seed, winFun, form());
  }

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(WindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link U} is bounded).
   *
   * @param seed     The initial value for the fold operation.
   * @param winFun   The fold operation.
   * @param combiner Combiner for intermediate results.
   * @param form     The form of the result type.
   * @param <U>      The result type.
   * @return A stream containing the results.
   */
  <U> SwimStream<U> fold(U seed, WindowFoldFunction<T, W, U> winFun, WindowBinOp<U, W> combiner, Form<U> form);

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(WindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link T} is bounded).
   *
   * @param seed     The initial value for the fold operation.
   * @param winFun   The fold operation.
   * @param combiner Combiner for intermediate results.
   * @return A stream containing the results.
   */
  default SwimStream<T> fold(final T seed, final WindowFoldFunction<T, W, T> winFun, final WindowBinOp<T, W> combiner) {
    return fold(seed, winFun, combiner, form());
  }

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(WindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link U} is bounded). The seed value is computed from
   * the key and the window.
   *
   * @param seed   The seed initialization function.
   * @param winFun The fold operation.
   * @param form   The form of the result type.
   * @param <U>    The result type.
   * @return A stream containing the results.
   */
  <U> SwimStream<U> foldBy(Function<W, U> seed, WindowFoldFunction<T, W, U> winFun, Form<U> form);

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(WindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link T} is bounded). The seed value is computed from
   * the key and the window.
   *
   * @param seed   The seed initialization function.
   * @param winFun The fold operation.
   * @return A stream containing the results.
   */
  default SwimStream<T> foldBy(final Function<W, T> seed, final WindowFoldFunction<T, W, T> winFun) {
    return foldBy(seed, winFun, form());
  }

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(WindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link U} is bounded). The seed value is computed from
   * the key and the window.
   *
   * @param seed     The seed initialization function.
   * @param winFun   The fold operation.
   * @param combiner Combiner for intermediate results.
   * @param form     The form of the result type.
   * @param <U>      The result type.
   * @return A stream containing the results.
   */
  <U> SwimStream<U> foldWithCombiner(Function<W, U> seed, WindowFoldFunction<T, W, U> winFun, WindowBinOp<U, W> combiner, Form<U> form);

  /**
   * Fold each window into a single value in a new stream. This differs from {@link #mapWindow(WindowFunction, Form)}
   * in that it only requires bounded state (if the size of {@link T} is bounded). The seed value is computed from
   * the key and the window.
   *
   * @param seed     The seed initialization function.
   * @param winFun   The fold operation.
   * @param combiner Combiner for intermediate results.
   * @return A stream containing the results.
   */
  default SwimStream<T> foldWithCombiner(final Function<W, T> seed, final WindowFoldFunction<T, W, T> winFun,
                                         final WindowBinOp<T, W> combiner) {
    return foldWithCombiner(seed, winFun, combiner, form());
  }

  /**
   * Reduce each window into a single value in a new stream.
   *
   * @param op The binary operation on the values.
   * @return A stream containing the results.
   */
  SwimStream<T> reduce(WindowBinOp<T, W> op);

  default SwimStream<T> groupReduce(final Group<T> group) {
    return groupReduce(w -> group);
  }

  default SwimStream<T> groupReduce(final Function<W, Group<T>> group) {
    return reduce((w, t1, t2) -> group.apply(w).add(t1, t2));
  }

  default <U> SwimStream<U> fold(final InvertibleFolder<T, U> folder, final Form<U> form) {
    return fold(w -> folder, form);
  }

  default SwimStream<T> fold(final InvertibleFolder<T, T> folder) {
    return fold(w -> folder, form());
  }

  default <U> SwimStream<U> fold(final Function<W, InvertibleFolder<T, U>> folder, final Form<U> form) {
    final Function<W, U> seed = folder.andThen(InvertibleFolder::zero);
    final WindowFoldFunction<T, W, U> foldOp = (w, t1, t2) -> folder.apply(w).add(t1, t2);
    return foldBy(seed, foldOp, form);
  }

  default SwimStream<T> fold(final Function<W, InvertibleFolder<T, T>> folder) {
    return fold(folder, form());
  }

  WindowedSwimStream<T, W> withTrigger(Trigger<T, W> trigger);

  WindowedSwimStream<T, W> withEviction(EvictionStrategy<T, W> strategy);

  WindowedSwimStream<T, W> setTransient(boolean isTransient);
}
