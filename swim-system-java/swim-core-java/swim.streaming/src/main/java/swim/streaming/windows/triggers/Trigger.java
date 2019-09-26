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

/**
 * Strategy to determine when then contents of windows should be emitted. Triggers must be stateless.
 *
 * @param <T> The type of the values.
 * @param <W> The type of the windows.
 */
public interface Trigger<T, W> {

  /**
   * Determine what do do when a new value is added to a window.
   *
   * @param data   The new value.
   * @param window The window.
   * @param time   Clock for handling timestamps and events.
   * @return Action to perform.
   */
  TriggerAction onNewValue(T data, W window, TimestampContext time);

  /**
   * Determine what to do when a timer event fires.
   *
   * @param window The window.
   * @param time   Clock for handling timestamps and events.
   * @return Action to perform.
   */
  TriggerAction onTimer(W window, TimestampContext time);

  /**
   * Determine what to do with a window that has been restored from a previous run.
   *
   * @param window The window.
   * @param time   Clock for handling timestamps and events.
   * @return Action to perform.
   */
  TriggerAction onRestore(W window, TimestampContext time);

}
