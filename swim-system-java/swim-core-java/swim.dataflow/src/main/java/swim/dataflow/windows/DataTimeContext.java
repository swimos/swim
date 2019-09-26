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

import java.util.Map;
import swim.collections.BTreeMap;
import swim.collections.FingerTrieSeq;

/**
 * A time context that uses the timestamp extracted from incoming data to trigger events.
 */
final class DataTimeContext implements InternalTimeContext {

  private BTreeMap<Long, FingerTrieSeq<PaneManager.WindowCallback>, Object> callbacks = BTreeMap.empty();

  @Override
  public void scheduleAt(final long timestamp, final PaneManager.WindowCallback callback) {
    final FingerTrieSeq<PaneManager.WindowCallback> existing = callbacks.getOrDefault(timestamp, FingerTrieSeq.empty());
    callbacks = callbacks.updated(timestamp, existing.appended(callback));
  }

  @Override
  public void setNow(final long nowTs) {
    for (final Map.Entry<Long, FingerTrieSeq<PaneManager.WindowCallback>> entry : callbacks) {
      if (entry.getKey() <= nowTs) {
        callbacks = callbacks.removed(entry.getKey());
        for (final PaneManager.WindowCallback cb : entry.getValue()) {
          cb.runEvent(entry.getKey(), nowTs);
        }
      } else {
        break;
      }
    }
  }
}
