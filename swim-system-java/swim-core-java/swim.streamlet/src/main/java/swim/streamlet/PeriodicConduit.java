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
import swim.streaming.Receptacle;
import swim.util.Deferred;
import swim.util.Require;

/**
 * Conduit that emits its outputs on a timer rather than on receipt of input.
 *
 * @param <T> The type of the data.
 */
public class PeriodicConduit<T> extends AbstractJunction<T> implements Receptacle<T> {

  private Deferred<T> current = null;
  private final Schedule schedule;
  private Recurring recurring = null;
  private final long periodMs;
  private final StreamInterpretation interp;

  /**
   * @param schedule Scheduler for triggering the output.
   * @param period   The period between output emit events.
   * @param interp   The semantic interpretation of the stream.
   */
  public PeriodicConduit(final Schedule schedule,
                         final Duration period,
                         final StreamInterpretation interp) {
    Require.that(Duration.ZERO.compareTo(period) < 0, "The period between outputs must be positive.");
    this.schedule = schedule;
    this.periodMs = period.toMillis();
    this.interp = interp;
  }

  @Override
  public void notifyChange(final Deferred<T> value) {
    current = value;
    if (recurring == null) {
      recurring = new Recurring(schedule, periodMs) {
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

  /**
   * Stop the periodic events.
   */
  public void stop() {
    if (recurring != null) {
      recurring.stop();
    }
  }
}
