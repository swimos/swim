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
 * {@link Clock} that invokes timer functions on an execution {@link Stage},
 * rather than on the clock thread.
 */
public class StageClock extends Clock {
  /**
   * {@code Stage} on which to execute timer functions.
   */
  protected final Stage stage;

  /**
   * Constructs a new {@code StageClock} with a timer resolution of {@code
   * tickMillis} milliseconds, and a clock period of {@code tickCount} ticks
   * per revolution, that executes timer functions on the given {@code stage}.
   */
  public StageClock(Stage stage, int tickMillis, int tickCount) {
    super(tickMillis, tickCount);
    this.stage = stage;
  }

  /**
   * Constructs a new {@code StageClock}, with the timer resolution and clock
   * period specified by the given {@code clockDef}, that executes timer
   * functions on the given {@code stage}.
   */
  public StageClock(Stage stage, ClockDef clockDef) {
    this(stage, clockDef.tickMillis, clockDef.tickCount);
  }

  /**
   * Constructs a new {@code StageClock} with a timer resolution of {@link
   * #TICK_MILLIS} milliseconds, and a clock period of {@link #TICK_COUNT}
   * ticks per revolution, that executes timer functions on the given
   * {@code stage}.
   */
  public StageClock(Stage stage) {
    this(stage, TICK_MILLIS, TICK_COUNT);
  }

  /**
   * Returns the stage on which to execute timer functions.
   */
  public final Stage stage() {
    return this.stage;
  }

  /**
   * Schedules the {@code runnable} to invoke {@code timer.runTimer()}
   * on the execution {@link #stage}.
   */
  @Override
  protected void runTimer(TimerFunction timer, Runnable runnable) {
    this.stage.execute(runnable);
  }
}
