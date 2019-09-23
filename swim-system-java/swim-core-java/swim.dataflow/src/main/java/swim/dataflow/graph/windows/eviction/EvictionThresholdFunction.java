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

package swim.dataflow.graph.windows.eviction;

/**
 * Threshold determination function for eviction. Anything in the window below this threshold will be evicted.
 *
 * @param <T> The type of the elements in teh window.
 * @param <W> The type of the window.
 * @param <K> The type of the eviction criterion.
 */
@FunctionalInterface
public interface EvictionThresholdFunction<T, W, K> {

  /**
   * Determine the threshold for the window.
   *
   * @param value     The element that was added to the window most recently.
   * @param window    The window.
   * @param timestamp The timestamp fo the element that was added to the window most recently.
   * @return The threshold value.
   */
  K apply(T value, W window, long timestamp);

}
