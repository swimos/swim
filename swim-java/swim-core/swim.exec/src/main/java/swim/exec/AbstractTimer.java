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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Generic implementation of a stateful {@link Timer}.
 */
@Public
@Since("5.0")
public abstract class AbstractTimer implements Timer {

  /**
   * The management context that binds this timer to a {@link TimerScheduler},
   * or {@code null} if this timer is not currently bound to a scheduler.
   */
  protected @Nullable TimerContext context;

  protected AbstractTimer() {
    this.context = null;
  }

  @Override
  public final @Nullable TimerContext timerContext() {
    return this.context;
  }

  @Override
  public void setTimerContext(@Nullable TimerContext context) {
    this.context = context;
  }

  @Override
  public abstract void run();

  /**
   * Returns the timer scheduler to which this timer is bound,
   * or {@code null} if this timer is not currently bound to a timer context.
   */
  public @Nullable TimerScheduler scheduler() {
    final TimerContext context = this.context;
    return context != null ? context.scheduler() : null;
  }

  /**
   * Returns {@code true} if this timer is currently scheduled for
   * future execution, otherwise returns {@code false} if the timer
   * is not currently scheduled, or if the timer is not currently
   * bound to a {@code TimerScheduler}.
   */
  public boolean isScheduled() {
    final TimerContext context = this.context;
    return context != null && context.isScheduled();
  }

  /**
   * Schedules this timer for future execution by the associated {@link
   * TimerScheduler} after {@code delay} milliseconds; if the timer is
   * currently scheduled, it will not execute at its previously scheduled
   * time, it will instead execute at the newly scheduled time. Returns
   * {@code true} if this call causes the scheduling of the timer;
   * otherwise returns {@code false} if the timer was already scheduled.
   *
   * @throws IllegalArgumentException if {@code delay} is negative.
   */
  public boolean debounce(long delay) {
    final TimerContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound timer");
    }
    return context.debounce(delay);
  }

  /**
   * Schedules this timer for future execution by the associated {@link
   * TimerScheduler} after {@code delay} milliseconds, unless the timer is
   * already scheduled, in which case the timer will remain scheduled to
   * execute at its previously scheduled time. Returns {@code true} if
   * this call causes the scheduling of the timer; otherwise returns
   * {@code false} if the timer was already scheduled.
   *
   * @throws IllegalArgumentException if {@code delay} is negative.
   */
  public boolean throttle(long delay) {
    final TimerContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound timer");
    }
    return context.throttle(delay);
  }

  /**
   * Prevents this timer from being executed by the associated {@link
   * TimerScheduler}, if the timer is currently scheduled; has no effect
   * if the timer is not currently scheduled. Returns {@code true} if this
   * call causes the cancellation of the timer; otherwise returns
   * {@code false} if the timer was not currently scheduled, or if the
   * timer is not currently bound to a {@code TimerScheduler}.
   */
  public boolean cancel() {
    final TimerContext context = this.context;
    return context != null && context.cancel();
  }

}
