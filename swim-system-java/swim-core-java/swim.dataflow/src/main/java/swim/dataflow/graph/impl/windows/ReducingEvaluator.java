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

package swim.dataflow.graph.impl.windows;

import java.util.function.Function;
import swim.collections.BTreeMap;
import swim.dataflow.graph.windows.WindowBinOp;
import swim.dataflow.graph.windows.WindowFoldFunction;

/**
 * Evaluator which reduces over the contents of a map keyed by an eviction criterion. The result of the operation
 * will be cached in the state.
 * @param <K> The type of the criterion.
 * @param <T> The type of the values.
 * @param <W> The type of the widow.
 * @param <U> The output type.
 */
public class ReducingEvaluator<K, T, W, U> implements PaneEvaluator<BTreeMap<K, T, U>, W, U> {

  private final Function<W, U> seed;
  private final WindowFoldFunction<T, W, U> accumulator;
  private final WindowBinOp<U, W> combiner;

  /**
   * @param seedVal Seed value for the operation.
   * @param accFun Function to combine a value with the state.
   * @param combFun Function to merge two states.
   */
  public ReducingEvaluator(final Function<W, U> seedVal,
                           final WindowFoldFunction<T, W, U> accFun,
                           final WindowBinOp<U, W> combFun) {
    seed = seedVal;
    accumulator = accFun;
    combiner = combFun;
  }

  @Override
  public U evaluate(final W window, final BTreeMap<K, T, U> state) {
    return state.reduced(seed.apply(window),
        (acc, value) -> accumulator.apply(window, acc, value),
        (acc1, acc2) -> combiner.apply(window, acc1, acc2));
  }
}
