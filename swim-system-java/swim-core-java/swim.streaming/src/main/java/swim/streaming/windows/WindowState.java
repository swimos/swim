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

package swim.streaming.windows;

import java.util.Set;

/**
 * Interface for state stores that track the windows that are currently open for a windowed stream.
 *
 * @param <W>    The type of the windows.
 * @param <Self> The type of the state store (should be the class that ultimately implements this interface).
 */
public interface WindowState<W, Self> {

  /**
   * @return The set of open windows.
   */
  Set<W> openWindows();

  /**
   * Remove a window from the store.
   *
   * @param window The window to remove.
   * @return The new store formed by removing the window.
   */
  Self removeWindow(W window);

  /**
   * Add a window to the store.
   *
   * @param window The window to add.
   * @return The new store formed by adding the window.
   */
  Self addWindow(W window);

}
