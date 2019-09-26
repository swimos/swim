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
import java.util.function.Function;

/**
 * Divides a stream of values into windows by time.
 *
 * @param <T> The type of the values.
 * @param <W> The type of the windows.
 * @param <S> The type of the state tracking open windows.
 */
public interface TemporalWindowAssigner<T, W, S extends WindowState<W, S>> {

  /**
   * @return A factory for state stores.
   */
  Function<Set<W>, S> stateInitializer();

  Assignment<W, S> windowsFor(T value, long timestamp, S openWindows);

  /**
   * An assignment of a value to windows.
   *
   * @param <W> The type of the windows.
   * @param <S> The type of the state tracking open windows.
   */
  interface Assignment<W, S> {

    /**
     * @return Windows to which the value contributes.
     */
    Set<W> windows();

    /**
     * @return The new value of the state store.
     */
    S updatedState();

  }

}
