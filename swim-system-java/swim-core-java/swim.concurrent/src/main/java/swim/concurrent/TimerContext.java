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
 * Internal context that binds a {@link Timer} to a {@link Schedule}.
 * A {@code TimerContext} can be used by a {@code Timer} to check its status,
 * to reschedule itself, and to cancel itself.  {@code TimerContext} is thread
 * safe.
 *
 * @see Timer
 */
public interface TimerContext extends TimerRef {
  /**
   * Returns the {@code Schedule} to which the timer is bound.
   */
  Schedule schedule();

  /**
   * Returns {@code true} if the timer is currently scheduled to execute.
   */
  @Override
  boolean isScheduled();

  /**
   * Schedules the timer to execute after {@code millis} milliseconds has
   * elapsed.  If the timer is currently scheduled, it will not ececute at its
   * previously scheduled time; it will only execute at the newly scheduled
   * time.
   *
   * @throws TimerException if {@code millis} is negative.
   */
  @Override
  void reschedule(long millis);

  /**
   * Cancels the timer to prevent it from executing.  Returns {@code true} if
   * this operation caused the cancellation of the timer; returns {@code false}
   * if the timer was not scheduled to execute.
   */
  @Override
  boolean cancel();
}
