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

package swim.streaming.windows.eviction;

import java.util.function.Function;

/**
 * Specifies that no eviction from windows should take place.
 *
 * @param <T> The type of the elements in the window.
 * @param <W> The type of the window.
 */
public final class NoEviction<T, W> implements EvictionStrategy<T, W> {

  private NoEviction() {
  }

  /**
   * Canonical instance.
   */
  private static final NoEviction<Object, Object> INSTANCE = new NoEviction<>();

  /**
   * Get the instance a specified type (the type parameters are both covariant so this is fine).
   *
   * @param <T> The type of the elements in the window.
   * @param <W> The type of the window.
   * @return The no eviction strategy.
   */
  @SuppressWarnings("unchecked")
  public static <T, W> NoEviction<T, W> instance() {
    return (NoEviction<T, W>) INSTANCE;
  }

  @Override
  public <U> U match(final Function<NoEviction<T, W>, U> none, final Function<ThresholdEviction<T, ?, W>, U> threshold) {
    return none.apply(this);
  }
}
