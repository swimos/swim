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
 * Trivial window pane evictor that never evicts anything.
 * @param <T> The type of the values.
 * @param <W> The type of the windows.
 * @param <S> The state type of the pane.
 */
public final class NoOpEvictor<T, W, S> implements PaneEvictor<T, W, S> {

  private NoOpEvictor() {
  }

  @Override
  public S evict(final S state, final W window, final T data, final long timestamp) {
    return state;
  }

  private static final NoOpEvictor<Object, Object, Object> INSTANCE = new NoOpEvictor<>();

  @SuppressWarnings("unchecked")
  public static <T, W, S> NoOpEvictor<T, W, S> instance() {
    return (NoOpEvictor<T, W, S>) INSTANCE;
  }
}
