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
 * External handle to a {@link TimerFunction} bound to a {@link Schedule}.  A
 * {@code TimerRef} can be used to check the status of a timer, to reschedule
 * it, and to cancel it.  {@code TimerRef} is thread safe.
 *
 * @see Schedule
 */
public interface TimerRef {
  /**
   * Returns {@code true} if the timer is currently scheduled to execute.
   */
  boolean isScheduled();

  /**
   * Schedules the timer to execute after {@code millis} milliseconds has
   * elapsed.  If the timer is currently scheduled, it will not execute at its
   * previously scheduled time; it will only execute at the newly scheduled
   * time.
   *
   * @throws TimerException if {@code millis} is negative.
   */
  void reschedule(long millis);

  /**
   * Cancels the timer to prevent it from executing.  Returns {@code true} if
   * this operation caused the cancellation of the timer; returns {@code false}
   * if the timer was not scheduled to execute.
   */
  boolean cancel();
}
