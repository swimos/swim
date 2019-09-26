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

import java.util.Map;
import java.util.Set;
import java.util.function.Supplier;
import swim.streaming.timestamps.TimestampContext;

/**
 * Assigns both partitions and windows to values of a stream.
 *
 * @param <T> The type of the stream values.
 * @param <P> The type of the partitions.
 * @param <W> The type of the windows.
 * @param <S> The type of the partition/window state store.
 */
public interface CombinedWindowAssigner<T, P, W, S extends CombinedState<P, W, S>> {

  /**
   * @return A factory for empty partition/window states.
   */
  Supplier<S> stateFactory();

  /**
   * Get the partition and window assignment for an value.
   *
   * @param value       The value.
   * @param time        The timestamp of the value.
   * @param openWindows Currently open windows and partitions.
   * @return The assignment of partitions and windows.
   */
  Assignment<P, W, S> partitionWindowsFor(T value, TimestampContext time, S openWindows);

  /**
   * An assignment of partition and windows for an element.
   *
   * @param <P> The type of the partitions.
   * @param <W> The type of the windows.
   * @param <S> The type of the partition/window state store.
   */
  interface Assignment<P, W, S> {

    /**
     * @return Windows for each assigned partition.
     */
    Map<P, Set<W>> partitionedWindows();

    /**
     * @return The new state store.
     */
    S updatedState();

  }

}
