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
 * Skeletal implementation of a stateful {@link Timer}.
 */
public abstract class AbstractTimer implements Timer {
  /**
   * Context used to manage this {@code Timer}; {@code null} if this {@code
   * Timer} is not bound to a {@link Schedule}.
   */
  protected TimerContext timerContext;

  @Override
  public final TimerContext timerContext() {
    return this.timerContext;
  }

  @Override
  public void setTimerContext(TimerContext timerContext) {
    this.timerContext = timerContext;
  }

  @Override
  public abstract void runTimer();

  @Override
  public void timerWillSchedule(long millis) {
    // stub
  }

  @Override
  public void timerDidCancel() {
    // stub
  }

  /**
   * Returns the {@code Schedule} to which this timer is bound.  Delegates to
   * the assigned {@link #timerContext}.
   *
   * @throws TimerException if {@link #timerContext} is {@code null}.
   */
  public Schedule schedule() {
    final TimerContext timerContext = this.timerContext;
    if (timerContext == null) {
      throw new TimerException("Unbound Timer");
    }
    return timerContext.schedule();
  }

  /**
   * Returns {@code true} if this timer is currently scheduled to execute.
   * Delegates to the assigned {@link #timerContext}, if set; otherwise returns
   * {@code false}.
   */
  public boolean isScheduled() {
    final TimerContext timerContext = this.timerContext;
    return timerContext != null && timerContext.isScheduled();
  }

  /**
   * Schedules this timer to execute after {@code millis} milliseconds has
   * elapsed.  If this timer is currently scheduled, it will not execute at its
   * previously scheduled time; it will only execute at the newly scheduled
   * time.  Delegates to the assigned {@link #timerContext}.
   *
   * @throws TimerException if {@link #timerContext} is {@code null}, or if
   *         {@code millis} is negative.
   */
  public void reschedule(long millis) {
    final TimerContext timerContext = this.timerContext;
    if (timerContext == null) {
      throw new TimerException("Unbound Timer");
    }
    timerContext.reschedule(millis);
  }

  /**
   * Cancels this timer to prevent it from executing.  Returns {@code true} if
   * this operation caused the cancellation of this timer; returns {@code false}
   * if this {@code Timer} was not scheduled to execute.
   */
  public boolean cancel() {
    final TimerContext timerContext = this.timerContext;
    if (timerContext == null) {
      return false;
    }
    return timerContext.cancel();
  }
}
