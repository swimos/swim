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

import java.util.Optional;
import java.util.Set;

/**
 * Interface for stores that manage the state of all open windows for an stream element.
 * @param <W> The type of the windows.
 * @param <S> The type of the states.
 */
public interface WindowAccumulators<W, S> {

  /**
   * Get the state for a window.
   * @param window The window.
   * @return The state, if it has been created.
   */
  Optional<S> getForWindow(W window);

  /**
   * Update the state for a window.
   * @param window The window.
   * @param state The new state.
   */
  void updateWindow(W window, S state);

  /**
   * Remove the state for a window.
   * @param window The window.
   */
  void removeWindow(W window);

  /**
   * @return The set of all windows with states defined.
   */
  Set<W> windows();

  /**
   * Close the store (it should not be used following this).
   */
  void close();
}
