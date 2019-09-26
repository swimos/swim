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

package swim.streamlet;

import java.time.Duration;
import swim.concurrent.Recurring;
import swim.concurrent.Schedule;
import swim.streaming.persistence.TrivialPersistenceProvider.TrivialValuePersister;
import swim.streaming.persistence.ValuePersister;
import swim.util.Deferred;
import swim.util.Require;

/**
 * Conduit that emits its outputs on a timer rather than on receipt of input. The period of the timer can be
 * controlled by an auxiliary input.
 *
 * @param <T> The type of the data.
 */
public class VariablePeriodicConduit<T> extends AbstractJunction2<T, Duration, T> {

  private Deferred<T> current = null;
  private final Schedule schedule;
  private Recurring recurring = null;
  private final ValuePersister<Duration> period;
  private final StreamInterpretation interp;

  /**
   * @param schedule      Scheduler for triggering the output.
   * @param periodPersister Durable persistence for the period.
   * @param interp        The semantic interpretation of the stream.
   */
  public VariablePeriodicConduit(final Schedule schedule,
                                 final ValuePersister<Duration> periodPersister,
                                 final StreamInterpretation interp) {
    Require.that(periodPersister.get() != null && Duration.ZERO.compareTo(periodPersister.get()) < 0,
        "The period between outputs must be positive.");
    this.schedule = schedule;
    this.period = periodPersister;
    this.interp = interp;
  }

  /**
   * @param schedule      Scheduler for triggering the output.
   * @param initialPeriod The initial period between output emit events.
   * @param interp        The semantic interpretation of the stream.
   */
  public VariablePeriodicConduit(final Schedule schedule,
                                 final Duration initialPeriod,
                                 final StreamInterpretation interp) {
    this(schedule, new TrivialValuePersister<>(initialPeriod), interp);
  }

  @Override
  protected void notifyChangeFirst(final Deferred<T> value) {
    current = value;
    if (recurring == null) {
      recurring = new Recurring(schedule, period.get().toMillis()) {
        @Override
        protected void onTrigger() {
          final Deferred<T> toEmit = current;
          if (toEmit != null) {
            if (interp == StreamInterpretation.DISCRETE) {
              current = null;
            }
            emit(toEmit);
          }
        }
      };
      recurring.start();
    }
  }

  @Override
  protected void notifyChangeSecond(final Deferred<Duration> value) {
    final Duration newPeriod = value.get();
    if (Duration.ZERO.compareTo(newPeriod) < 0) {
      period.set(newPeriod);
      if (recurring != null) {
        recurring.setPeriod(newPeriod.toMillis());
      }
    }
  }


  public void stop() {
    if (recurring != null) {
      recurring.stop();
    }
  }
}
