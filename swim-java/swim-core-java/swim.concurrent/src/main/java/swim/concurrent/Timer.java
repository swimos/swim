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

package swim.concurrent;

/**
 * Stateful {@link TimerFunction} to invoke at a scheduled time, with lifecycle
 * callbacks, and a {@link TimerContext} for self-management.  Use {@link
 * Schedule#setTimer(long, TimerFunction)} to schedule a new {@code Timer} for
 * execution.
 *
 * @see AbstractTimer
 * @see Schedule
 */
public interface Timer extends TimerFunction {
  /**
   * Returns the context used to manage this {@code Timer}.  Returns {@code
   * null} if this {@code Timer} is not bound to a {@link Schedule}.
   */
  TimerContext timerContext();

  /**
   * Sets the context used to manage this {@code Timer}.  A {@code
   * TimerContext} is assigned when binding this {@code Timer} to a {@link
   * Schedule}.
   */
  void setTimerContext(TimerContext timerContext);

  /**
   * Executes scheduled logic when this {@code Timer} fires.
   */
  @Override
  void runTimer();

  /**
   * Lifecycle callback invoked before this {@code Timer} is scheduled for
   * execution.
   */
  void timerWillSchedule(long millis);

  /**
   * Lifecycle callback invoked after this {@code Timer} is explicitly
   * cancelled.
   */
  void timerDidCancel();
}
