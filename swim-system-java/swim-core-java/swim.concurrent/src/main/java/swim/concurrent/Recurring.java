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

import java.util.concurrent.atomic.AtomicReference;

/**
 * A recurring time event (it will reschedule itself on successful completion).
 */
public abstract class Recurring implements TimerFunction {

  private final Schedule schedule;
  private long periodMillis;

  /**
   * @param schedule Scheduler to execute the events.
   * @param periodMillis Period between executions.
   */
  public Recurring(final Schedule schedule,
            final long periodMillis) {
    this.schedule = schedule;
    this.periodMillis = periodMillis;
  }

  /**
   * Update the period.
   * @param periodMs The new period in ms.
   */
  public void setPeriod(final long periodMs) {
    periodMillis = periodMs;
    if (isRunning()) {
      ref.reschedule(periodMillis);
    }
  }

  /**
   * State type for this class.
   */
  private enum State {
    NEW,
    RUNNING,
    STOPPED
  }

  /**
   * The current state of the recurring event.
   */
  private final AtomicReference<State> state = new AtomicReference<>(State.NEW);

  /**
   * Reference into the scheduler for the event.
   */
  private TimerRef ref = null;

  /**
   * Start executing the events.
   */
  public void start() {
    while (state.get() == State.NEW) {
      if (state.compareAndSet(State.NEW, State.RUNNING)) {
        ref = schedule.setTimer(periodMillis, this);
      }
    }
    if (state.get() == State.STOPPED) {
      throw new IllegalStateException("Recurring event already stopped.");
    }
  }

  /**
   * Determine if the events are running.
   * @return Whether we are in the running state.
   */
  public boolean isRunning() {
    return state.get() == State.RUNNING;
  }

  /**
   * Stop executing the events.
   */
  public void stop() {
    while (state.get() == State.RUNNING) {
      if (state.compareAndSet(State.RUNNING, State.STOPPED)) {
        ref.cancel();
      }
    }
  }

  /**
   * Called when the event triggers.
   */
  protected abstract void onTrigger();

  @Override
  public void runTimer() {
    if (state.get() == State.RUNNING) {
      try {
        onTrigger();
      } catch (final RuntimeException | Error ex) {
        stop();
        throw ex;
      } finally {
        if (state.get() == State.RUNNING && ref != null) {
          ref.reschedule(periodMillis);
        }
      }
    }
  }
}
