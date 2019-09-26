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

import swim.util.Deferred;
import swim.util.Pair;

/**
 * Specification for a call to {@link WindowConduit#notifyChange(Deferred)}.
 */
final class Expectation {

  private final Pair<Long, Integer> data;
  private final long timestamp;
  private final Pair<Long, PaneManager.WindowCallback> willRequest;
  private final Pair<Integer, Integer> willOutput;


  /**
   * @param data Expected input data.
   * @param timestamp Expected timestamp for the input.
   * @param willRequest Callbacks that should be requested (may be null).
   * @param willOutput Immediate output to produce (may be null).
   */
  Expectation(final Pair<Long, Integer> data,
              final long timestamp,
              final Pair<Long, PaneManager.WindowCallback> willRequest,
              final Pair<Integer, Integer> willOutput) {
    this.data = data;
    this.timestamp = timestamp;
    this.willRequest = willRequest;
    this.willOutput = willOutput;
  }

  Expectation(final Pair<Long, Integer> data,
                      final long timestamp) {
    this(data, timestamp, null, null);
  }

  public Pair<Long, Integer> getData() {
    return data;
  }

  public long getTimestamp() {
    return timestamp;
  }

  public Pair<Long, PaneManager.WindowCallback> getWillRequest() {
    return willRequest;
  }

  public Pair<Integer, Integer> getWillOutput() {
    return willOutput;
  }
}
