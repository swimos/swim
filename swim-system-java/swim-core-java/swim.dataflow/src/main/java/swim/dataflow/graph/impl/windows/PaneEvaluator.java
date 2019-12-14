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

/**
 * Evaluates the state of a window pane when the window fires.
 * @param <S> The type of the state of the pane.
 * @param <W> The type of the windows.
 * @param <U> The output type.
 */
@FunctionalInterface
public interface PaneEvaluator<S, W, U> {

  /**
   * Evaluate the current state of the pane.
   * @param window The window.
   * @param state The state.
   * @return The result of the evaluation.
   */
  U evaluate(W window, S state);

  /**
   * Get an identity evaluator.
   * @param <T> The type of the state and the output.
   * @param <W> The type of the window.
   * @return The identity evaluator.
   */
  static <T, W> PaneEvaluator<T, W, T> identity() {
    return new IdentityPaneEvaluator<>();
  }
}

/**
 * Returns the state as it is.
 * @param <S> The state type.
 * @param <W> The window type.
 */
final class IdentityPaneEvaluator<S, W> implements PaneEvaluator<S, W, S> {
  @Override
  public S evaluate(final W window, final S state) {
    return state;
  }
}
