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

import swim.dataflow.graph.windows.WindowBinOp;

/**
 * Updates the state of a reduction operation by applying a binary operator.
 * @param <T> The type of the values and the state.
 * @param <W> The type of the windows.
 */
public class ReducePaneUpdater<T, W> implements PaneUpdater<T, W, T> {

  private final WindowBinOp<T, W> operator;

  /**
   * @param op The operator to apply.
   */
  public ReducePaneUpdater(final WindowBinOp<T, W> op) {
    operator = op;
  }

  @Override
  public T createPane(final W window) {
    //Initially the state is "nothing".
    return null;
  }

  @Override
  public T addContribution(final T state, final W window, final T data, final long timestamp) {
    if (state == null) {
      return data;
    } else {
      return operator.apply(window, state, data);
    }
  }
}
