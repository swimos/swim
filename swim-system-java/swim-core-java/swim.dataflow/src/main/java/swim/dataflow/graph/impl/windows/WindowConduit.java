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

package swim.dataflow.graph.impl.windows;

import java.util.function.LongSupplier;
import java.util.function.ToLongFunction;
import swim.concurrent.Schedule;
import swim.concurrent.TimerFunction;
import swim.dataflow.connector.AbstractJunction;
import swim.dataflow.connector.Conduit;
import swim.dataflow.connector.Deferred;
import swim.dataflow.graph.timestamps.TimestampAssigner;

public class WindowConduit<T, W, U> extends AbstractJunction<U> implements Conduit<T, U> {

  private final PaneManager<T, W, U> pane;
  private final ToLongFunction<T> timestamps;
  private final InternalTimeContext timeContext;

  /**
   * @param paneManager The window pane manager.
   * @param ts          Assigns timestamps to values.
   */
  public WindowConduit(final Schedule schedule,
                       final PaneManager<T, W, U> paneManager,
                       final TimestampAssigner<T> ts) {
    pane = paneManager;
    pane.setListener(this::propagateOutput);
    timeContext = ts.match(fromData -> new DataTimeContext(), fromClock -> new ScheduleTimeContext(schedule, fromClock));
    timestamps = ts.match(fromData -> fromData, fromClock -> ts);
  }

  private void propagateOutput(final W window, final U output) {
    emit(Deferred.value(output));
  }

  @Override
  public void notifyChange(final Deferred<T> value) {
    final T val = value.get();
    final long timestamp = timestamps.applyAsLong(val);
    timeContext.setNow(timestamp);
    pane.update(val, timestamp, timeContext);
  }

  /**
   * Time context that uses a {@link Schedule} to trigger events, using clock time.
   */
  private final class ScheduleTimeContext implements InternalTimeContext {

    private final Schedule schedule;
    private long now = Long.MIN_VALUE;
    private final LongSupplier clock;

    private ScheduleTimeContext(final Schedule schedule, final LongSupplier clock) {
      this.schedule = schedule;
      this.clock = clock;
    }

    @Override
    public void setNow(final long nowTs) {
      now = nowTs;
    }

    @Override
    public void scheduleAt(final long timestamp, final PaneManager.WindowCallback callback) {
      final long offset = Math.max(0, timestamp - now);
      final TimerFunction timerFun = () -> {
        final long calledAt = clock.getAsLong();
        callback.runEvent(timestamp, calledAt);
      };
      schedule.setTimer(offset, timerFun);
    }
  }
}
