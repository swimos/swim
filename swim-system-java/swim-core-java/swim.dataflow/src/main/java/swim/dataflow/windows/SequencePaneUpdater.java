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

import swim.collections.FingerTrieSeq;
import swim.streaming.timestamps.WithTimestamp;

/**
 * Window pane updater for panes which store the state as a sequence of timestamped values.
 * @param <T> The type of the values.
 * @param <W> The type of the windows.
 */
public class SequencePaneUpdater<T, W> implements PaneUpdater<T, W, FingerTrieSeq<WithTimestamp<T>>> {

  @Override
  public FingerTrieSeq<WithTimestamp<T>> createPane(final W window) {
    return FingerTrieSeq.empty();
  }

  @Override
  public FingerTrieSeq<WithTimestamp<T>> addContribution(final FingerTrieSeq<WithTimestamp<T>> state,
                                                         final W window,
                                                         final T data,
                                                         final long timestamp) {
    return state.appended(new WithTimestamp<>(data, timestamp));
  }
}
