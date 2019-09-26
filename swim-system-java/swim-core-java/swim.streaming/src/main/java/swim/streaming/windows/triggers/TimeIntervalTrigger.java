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

package swim.streaming.windows.triggers;


import swim.streaming.timestamps.TimestampContext;
import swim.streaming.windows.TimeInterval;

/**
 * A trigger that fires and purges the window after the end of a fixed time interval.
 *
 * @param <T> The type of the values.
 */
public class TimeIntervalTrigger<T> implements Trigger<T, TimeInterval> {

  @Override
  public TriggerAction onNewValue(final T data, final TimeInterval window, final TimestampContext time) {
    time.scheduleAt(window.getEnd());
    return TriggerAction.NONE;
  }

  @Override
  public TriggerAction onTimer(final TimeInterval window, final TimestampContext time) {
    return TriggerAction.TRIGGER_AND_PURGE;
  }

  @Override
  public TriggerAction onRestore(final TimeInterval window, final TimestampContext time) {
    final long current = time.currentTimestamp();
    if (current >= window.getEnd()) {
      return TriggerAction.PURGE;
    } else {
      time.scheduleAt(window.getEnd());
      return TriggerAction.NONE;
    }
  }

}
