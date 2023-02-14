// Copyright 2015-2022 Swim.inc
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

package swim.exec;

import swim.annotations.Public;
import swim.annotations.Since;

/**
 * An external handle to a {@link TimerFunction} bound to an associated {@link
 * TimerScheduler}. A {@code TimerRef} can be used to {@link #debounce(long)
 * debounce}, {@link #throttle(long) throttle}, and {@link #cancel() cancel}
 * the future execution of a timer. {@code TimerRef} is thread safe.
 * <p>
 * The associated {@link TimerScheduler} will invoke {@link TimerFunction#run()}
 * exactly once for each time {@code debounce} or {@code throttle} returns
 * {@code true}, minus the number of times {@code cancel} returns {@code true}.
 * The timer becomes unscheduled immediately prior to the invocation of
 * {@code run}, enabling the timer to be rescheduled while executing.
 *
 * @see TimerScheduler
 */
@Public
@Since("5.0")
public interface TimerRef extends Task {

  /**
   * Returns the bound timer function.
   */
  Runnable timer();

  /**
   * Returns the scheduler to which the timer is bound.
   */
  TimerScheduler scheduler();

  /**
   * Returns {@code true} if the bound timer is currently scheduled
   * for future execution, otherwise returns {@code false}.
   */
  boolean isScheduled();

  /**
   * Schedules the bound timer for future execution by the associated {@link
   * TimerScheduler} after {@code delay} milliseconds; if the timer is
   * currently scheduled, it will not execute at its previously scheduled
   * time, it will instead execute at the newly scheduled time. Returns
   * {@code true} if this call causes the scheduling of the timer;
   * otherwise returns {@code false} if the timer was already scheduled.
   *
   * @throws IllegalArgumentException if {@code delay} is negative.
   */
  boolean debounce(long delay);

  /**
   * Schedules the bound timer for future execution by the associated {@link
   * TimerScheduler} after {@code delay} milliseconds, unless the timer is
   * already scheduled, in which case the timer will remain scheduled to
   * execute at its previously scheduled time. Returns {@code true} if this
   * call causes the scheduling of the timer; otherwise returns {@code false}
   * if the timer was already scheduled.
   *
   * @throws IllegalArgumentException if {@code delay} is negative.
   */
  boolean throttle(long delay);

  /**
   * Prevents the bound timer from being executed by the associated {@link
   * TimerScheduler}, if the timer is currently scheduled; has no effect if
   * the timer is not currently scheduled. Returns {@code true} if this call
   * causes the cancellation of the timer; otherwise returns {@code false}
   * if the timer was not currently scheduled.
   */
  boolean cancel();

}
