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

import swim.collections.FingerTrieSeq;
import swim.streaming.timestamps.WithTimestamp;
import swim.streaming.windows.WindowFunction;
import swim.util.Iterables;

/**
 * Evaluate an arbitrary function over the contents of a window pane stored as a sequence of values.
 * @param <T> The type of the values.
 * @param <W> The type of the windows.
 * @param <U> The type of the results.
 */
public class WindowFunctionEvaluator<T, W, U> implements PaneEvaluator<FingerTrieSeq<WithTimestamp<T>>, W, U> {

  private final WindowFunction<T, W, U> winFun;

  /**
   * @param fun Function to evaluate over the pane.
   */
  public WindowFunctionEvaluator(final WindowFunction<T, W, U> fun) {
    winFun = fun;
  }

  @Override
  public U evaluate(final W window, final FingerTrieSeq<WithTimestamp<T>> state) {
    return winFun.apply(window, Iterables.mapIterable(state, WithTimestamp::getData));
  }
}
