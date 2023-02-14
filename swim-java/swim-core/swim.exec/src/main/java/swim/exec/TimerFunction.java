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
 * A {@link Runnable} function that can be scheduled for future {@linkplain
 * #run() execution} by a {@link TimerScheduler}.
 *
 * <h2>Scheduling</h2>
 * <p>
 * Before a timer can be scheduled for future execution, it must first
 * be bound to a {@code TimerScheduler}. Once bound, the {@link TimerRef}
 * returned by {@link TimerScheduler#bindTimer(TimerFunction)} can be used
 * to {@link TimerRef#debounce(long) debounce}, {@link TimerRef#throttle(long)
 * throttle}, and {@link TimerRef#cancel() cancel} the future execution of
 * the timer.
 *
 * <h2>Lifecycle</h2>
 * <p>
 * Timer lifecycle methods are provided to facilitate debugging, performance
 * monitoring, and other timer-specific bookkeeping functions. These methods
 * are invoked from the thread context of calls to {@code TimerScheduler} APIs,
 * which may execute concurrently to the timer function. Care must be taken
 * to not perform expensive, blocking, failable, or thread-unsafe operations
 * from within lifecycle callbacks.
 * <p>
 * When a {@code TimerScheduler} is about to schedule a timer for future
 * execution, the scheduler first invokes the timer's {@link #willSchedule(long)}
 * callback in the thread context of the caller that causes the scheduling of
 * the timer. Immediately after a {@code TimerScheduler} cancels the scheduled
 * execution of a timer, the scheduler invokes the timer's {@link #didCancel()}
 * callback in the thread context of the caller that causes the cancellation
 * of the timer.
 * <p>
 * A {@code TimerScheduler} invokes a timer's {@link #run()} method when its
 * scheduled timeout elapses, and the timer has not been cancelled. The {@code
 * willSchedule} and {@code didCancel} callbacks may execute concurrently to
 * the timer's {@code run} method.
 *
 * @see Timer
 * @see TimerScheduler
 */
@Public
@Since("5.0")
@FunctionalInterface
public interface TimerFunction extends Runnable {

  /**
   * Invoked by a bound {@link TimerScheduler} when a scheduled timeout
   * elapses, and the timer hasn't been cancelled in the interim between
   * the time the timer was scheduled, and the scheduled execution time.
   */
  @Override
  void run();

  /**
   * Invoked by a bound {@link TimerScheduler} immediately prior to
   * scheduling the timer for execution after {@code delay} milliseconds.
   * {@code willSchedule} is invoked from the thread context of the caller
   * that causes the scheduling of the timer, and therefore may execute
   * concurrently to the timer's {@link #run()} method, if the timer is
   * rescheduled by another thread during a concurrent {@code run}.
   */
  default void willSchedule(long delay) {
    // hook
  }

  /**
   * Invoked by a bound {@link TimerScheduler} immediately after cancelling
   * the scheduled execution of a timer. {@code didCancel} is invoked from the
   * thread context of the caller that causes the cancellation of the timer,
   * and therefore may execute concurrently to the timer's {@link #run()}
   * method, if the timer is rescheduled and then cancelled by another
   * thread during a concurrent {@code run}.
   */
  default void didCancel() {
    // hook
  }

}
