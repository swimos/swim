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

/**
 * Update the state of a window pane with the next value.
 * @param <T> The type of the values.
 * @param <W> The type of the windows.
 * @param <S> The type of the window pane state.
 */
public interface PaneUpdater<T, W, S> {

  /**
   * Create an emptu state for a window pane.
   * @param window The window.
   * @return The state.
   */
  S createPane(W window);

  /**
   * Add a value to the state of a window pane.
   * @param state The current state.
   * @param window The window.
   * @param data The value.
   * @param timestamp The timestamp of the value.
   * @return The new state of the window pane.
   */
  S addContribution(S state, W window, T data, long timestamp);
}
