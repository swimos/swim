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

import java.util.function.Function;

/**
 * Strategy to determine when elements should be removed from a window, independently of when it fires.
 *
 * @param <T> The type of the elements.
 * @param <W> The type of the window.
 */
public interface EvictionStrategy<T, W> {

  /**
   * Distinguish between the implementations.
   *
   * @param none      Called for no eviction.
   * @param threshold Called for threshold based eviction.
   * @param <U>       The type of the result.
   * @return Result of the operation.
   */
  <U> U match(Function<NoEviction<T, W>, U> none, Function<ThresholdEviction<T, ?, W>, U> threshold);

}
