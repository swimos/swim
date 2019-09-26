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

package swim.dataflow.windows;

import java.util.function.Function;
import swim.collections.FingerTrieSeq;
import swim.streaming.timestamps.WithTimestamp;
import swim.streaming.windows.WindowFoldFunction;

/**
 * Applies a fold operation across a window pane sequence state. This is required for folded windows that require
 * eviction but do not have any intermediate value combiner.
 *
 * @param <T> The type of the values.
 * @param <W> The type of the windows.
 * @param <U> The result type.
 */
public class FoldingEvaluator<T, W, U> implements PaneEvaluator<FingerTrieSeq<WithTimestamp<T>>, W, U> {

  private final Function<W, U> seed;
  private final WindowFoldFunction<T, W, U> update;

  /**
   * @param seedValues The seed value for the fold.
   * @param folder     The fold operation.
   */
  public FoldingEvaluator(final Function<W, U> seedValues, final WindowFoldFunction<T, W, U> folder) {
    seed = seedValues;
    update = folder;
  }

  @Override
  public U evaluate(final W window, final FingerTrieSeq<WithTimestamp<T>> state) {
    U result = seed.apply(window);
    for (final WithTimestamp<T> entry : state) {
      result = update.apply(window, result, entry.getData());
    }
    return result;
  }
}
