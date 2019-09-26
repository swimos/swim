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

package swim.streaming.timestamps;

/**
 * A clock for managing events relative to a timescale.
 */
public interface TimestampContext {

  /**
   * Get the current timestamp, according to the clock, in ms.
   *
   * @return The timestamp.
   */
  long currentTimestamp();

  /**
   * Schedule a callback after the clock reaches a specified timestamp.
   *
   * @param ts The timestamp.
   */
  void scheduleAt(long ts);

}
