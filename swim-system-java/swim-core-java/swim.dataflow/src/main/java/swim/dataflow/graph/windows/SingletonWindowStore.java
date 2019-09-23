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

package swim.dataflow.graph.windows;

import java.util.Collections;
import java.util.Set;

/**
 * Window store with a single, fixed window.
 *
 * @param <W> The type of the window.
 */
public class SingletonWindowStore<W> implements WindowState<W, SingletonWindowStore<W>> {

  /**
   * The single window.
   */
  private final W window;

  /**
   * @param content The fixed window.
   */
  public SingletonWindowStore(final W content) {
    window = content;
  }

  @Override
  public Set<W> openWindows() {
    return Collections.singleton(window);
  }

  @Override
  public SingletonWindowStore<W> removeWindow(final W window) {
    return this;
  }

  @Override
  public SingletonWindowStore<W> addWindow(final W window) {
    return this;
  }
}
