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

import swim.collections.BTreeMap;
import swim.streaming.windows.eviction.EvictionCriterionFunction;

/**
 * Window pane updater that stores the values keyed by their eviction criterion. Additionally allows an aggregation
 * to be stored in the tree nodes of the map.
 * @param <T> The type of the values.
 * @param <W> The type of the window.
 * @param <K> The type of the criterion.
 * @param <U> The state type of the map.
 */
public class MapPaneUpdater<T, W, K, U> implements PaneUpdater<T, W, BTreeMap<K, T, U>> {

  private final EvictionCriterionFunction<T, K> keyExtractor;

  /**
   *  @param keys Assigns the eviction criterion to the values.
   */
  public MapPaneUpdater(final EvictionCriterionFunction<T, K> keys) {
    keyExtractor = keys;
  }

  @Override
  public BTreeMap<K, T, U> createPane(final W window) {
    return BTreeMap.empty();
  }

  @Override
  public BTreeMap<K, T, U> addContribution(final BTreeMap<K, T, U> state,
                                           final W window,
                                           final T data,
                                           final long timestamp) {
    return state.updated(keyExtractor.apply(data, timestamp), data);
  }
}
