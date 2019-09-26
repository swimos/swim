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
import swim.streaming.windows.WindowFoldFunction;

/**
 * Window pane update that maintains the state of a fold operation only and not the individual values. Hence it cannot
 * be used in combination with a non-trivial eviction strategy.
 * @param <T> The type of the values.
 * @param <W> The type of the widows.
 * @param <U> The state of the fold operation.
 */
public class FoldPaneUpdater<T, W, U> implements PaneUpdater<T, W, U> {

  private final Function<W, U> seed;
  private final WindowFoldFunction<T, W, U> update;

  /**
   * @param seedVal Initializes the state based on the window.
   * @param updFun Updates the state from the latest value and the window.
   */
  public FoldPaneUpdater(final Function<W, U> seedVal, final WindowFoldFunction<T, W, U> updFun) {
    seed = seedVal;
    update = updFun;
  }

  @Override
  public U createPane(final W window) {
    return seed.apply(window);
  }

  @Override
  public U addContribution(final U state, final W window, final T data, final long timestamp) {
    return update.apply(window, state, data);
  }
}
