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

package swim.dataflow.graph.impl;

import swim.collections.FingerTrieSeq;
import swim.dataflow.graph.impl.windows.PaneEvictor;
import swim.dataflow.graph.impl.windows.SequenceThresholdEvictor;
import swim.dataflow.graph.timestamps.WithTimestamp;
import swim.dataflow.graph.windows.eviction.ThresholdEviction;

/**
 * Eviction utility methods.
 */
final class EvictionUtil {

  private EvictionUtil() {
  }

  static <T, W, K extends Comparable<K>> PaneEvictor<T, W, FingerTrieSeq<WithTimestamp<T>>> createEvictor(
      final ThresholdEviction<T, K, W> strat) {
    return new SequenceThresholdEvictor<>(strat.getCriterion(), strat.getThreshold(), strat.assumeStateOrdered());
  }

}
