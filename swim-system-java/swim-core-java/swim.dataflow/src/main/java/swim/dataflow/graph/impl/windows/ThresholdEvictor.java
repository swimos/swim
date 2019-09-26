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

import swim.collections.BTreeMap;
import swim.dataflow.graph.windows.eviction.EvictionThresholdFunction;
import swim.util.Iterables;

/**
 * Evicts values from a window, where the state is stored in a map by eviction criterion, usig a threshold function.
 * @param <T> The type of the values.
 * @param <K> The type of the criterion.
 * @param <W> The type of the widow.
 * @param <U> The type of the state cached in the map.
 */
public class ThresholdEvictor<T, K extends Comparable<K>, W, U> implements PaneEvictor<T, W, BTreeMap<K, T, U>> {

  private final EvictionThresholdFunction<T, W, K> theshold;

  /**
   * @param theshold Function to determine the eviction threshold for the pane.
   */
  public ThresholdEvictor(final EvictionThresholdFunction<T, W, K> theshold) {
    this.theshold = theshold;
  }

  @Override
  public BTreeMap<K, T, U> evict(final BTreeMap<K, T, U> state,
                                 final W window,
                                 final T data,
                                 final long timestamp) {
    final K expiry = theshold.apply(data, window, timestamp);
    final int boundary = Iterables.findFirstIndex(state.keyIterator(), k -> k.compareTo(expiry) >= 0);
    if (boundary < 0) {
      return BTreeMap.empty();
    } else {
      return state.drop(boundary);
    }
  }
}
