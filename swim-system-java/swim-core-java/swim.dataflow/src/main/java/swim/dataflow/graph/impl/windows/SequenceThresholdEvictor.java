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

import swim.collections.FingerTrieSeq;
import swim.dataflow.graph.timestamps.WithTimestamp;
import swim.dataflow.graph.windows.eviction.EvictionCriterionFunction;
import swim.dataflow.graph.windows.eviction.EvictionThresholdFunction;

/**
 * Evicts values from a window where the state is stored as an sequence of timestamped values.
 * @param <T> The type of the values.
 * @param <K> The type of the eviction criterion.
 * @param <W> The type of the windows.
 */
public class SequenceThresholdEvictor<T, K extends Comparable<K>, W>
        implements PaneEvictor<T, W, FingerTrieSeq<WithTimestamp<T>>> {

  private final EvictionCriterionFunction<T, K> criterion;
  private final EvictionThresholdFunction<T, W, K> threshold;
  private final boolean assumeOrdered;

  /**
   * @param criterion Gets the eviction criterion from each value.
   * @param threshold Gets the eviction threshold for the pane.
   * @param assumeOrdered If this is set it will be assumed that the elements in the state are ordered by the criterion
   *                      and the fold will stop when an item that is at least at the threshold is encountered.
   */
  public SequenceThresholdEvictor(final EvictionCriterionFunction<T, K> criterion,
                                  final EvictionThresholdFunction<T, W, K> threshold,
                                  final boolean assumeOrdered) {
    this.criterion = criterion;
    this.threshold = threshold;
    this.assumeOrdered = assumeOrdered;
  }

  @Override
  public FingerTrieSeq<WithTimestamp<T>> evict(final FingerTrieSeq<WithTimestamp<T>> state,
                                               final W window,
                                               final T data,
                                               final long timestamp) {
    final K expiry = threshold.apply(data, window, timestamp);

    FingerTrieSeq<WithTimestamp<T>> newState;
    if (assumeOrdered) {
      newState = state;
      while (!newState.isEmpty() && checkForExpiry(newState.head(), expiry)) {
        newState = newState.tail();
      }
    } else {
      newState = FingerTrieSeq.empty();
      //Iterate through the state an remove all expired records.
      for (final WithTimestamp<T> item : state) {
        if (!checkForExpiry(item, expiry)) {
          newState = newState.appended(item);
        }
      }
    }
    return newState;
  }

  private boolean checkForExpiry(final WithTimestamp<T> current, final K expiry) {
    return criterion.apply(current.getData(), current.getTimestamp()).compareTo(expiry) < 0;
  }
}
