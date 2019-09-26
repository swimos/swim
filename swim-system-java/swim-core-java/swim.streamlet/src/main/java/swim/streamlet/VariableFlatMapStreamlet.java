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
import java.util.function.Function;
import swim.collections.FingerTrieSeq;
import swim.concurrent.AbstractTimer;
import swim.concurrent.Schedule;
import swim.streaming.persistence.TrivialPersistenceProvider;
import swim.streaming.persistence.ValuePersister;
import swim.util.Deferred;
import swim.util.Require;

/**
 * {@link Streamlet} that, for each values of its input, emits a sequence of output values on a period that can be
 * controlled by an auxiliary input.
 *
 * @param <In>  The type of the inputs.
 * @param <Out> The type of the outputs.
 */
public class VariableFlatMapStreamlet<In, Out> extends AbstractJunction2<In, Duration, Out> {

  private FingerTrieSeq<Out> queue = FingerTrieSeq.empty();
  private final Function<In, Iterable<Out>> flatMapFun;
  private final AbstractTimer timer;
  private final ValuePersister<Duration> period;

  /**
   * @param flatMapFun Function to transform the inputs to the outputs.
   * @param schedule   Used to schedule the output emission.
   * @param periodPersister Durable persistence for the period.
   */
  public VariableFlatMapStreamlet(final Function<In, Iterable<Out>> flatMapFun,
                                  final Schedule schedule,
                                  final ValuePersister<Duration> periodPersister) {
    Require.that(periodPersister.get() != null && Duration.ZERO.compareTo(periodPersister.get()) < 0,
        "The period between outputs must be positive.");
    this.flatMapFun = flatMapFun;
    this.period = periodPersister;
    timer = new AbstractTimer() {
      @Override
      public void runTimer() {
        final FingerTrieSeq<Out> q = queue;
        final Out toEmit = q.head();
        queue = q.tail();
        emit(toEmit);
        if (!queue.isEmpty()) {
          timerContext.reschedule(period.get().toMillis());
        }
      }
    };
    schedule.timer(timer);
  }

  /**
   * @param flatMapFun Function to transform the inputs to the outputs.
   * @param schedule   Used to schedule the output emission.
   * @param period The initial period between output emit events.
   */
  public VariableFlatMapStreamlet(final Function<In, Iterable<Out>> flatMapFun,
                                  final Schedule schedule,
                                  final Duration period) {
    this(flatMapFun, schedule, new TrivialPersistenceProvider.TrivialValuePersister<>(period));
  }

  @Override
  protected void notifyChangeFirst(final Deferred<In> value) {
    final boolean wasEmpty = queue.isEmpty();
    for (final Out val : flatMapFun.apply(value.get())) {
      queue = queue.appended(val);
    }
    if (wasEmpty) {
      timer.runTimer();
    }
  }

  @Override
  protected void notifyChangeSecond(final Deferred<Duration> value) {
    final Duration delay = value.get();
    if (Duration.ZERO.compareTo(delay) < 0) {
      period.set(delay);
    }

  }
}
