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

package swim.dataflow.connector;

import java.time.Duration;
import java.util.function.Function;
import swim.collections.FingerTrieSeq;
import swim.concurrent.AbstractTimer;
import swim.concurrent.Schedule;
import swim.dataflow.graph.Require;
import swim.dataflow.graph.persistence.TrivialPersistenceProvider.TrivialValuePersister;
import swim.dataflow.graph.persistence.ValuePersister;

/**
 * {@link Conduit} that, for each values of its input, emits a sequence of output values on a configured period. The
 * function that is applied is modified by an auxiliary control input. Additionally, the period for the outputs can
 * be controlled using another input channel.
 *
 * @param <In>   The type of the inputs.
 * @param <Out>  The type of the outputs.
 * @param <Mode> The type of the control input.
 */
public class ModalFlatMapConduit<In, Out, Mode> extends AbstractJunction<Out> implements Junction3<In, Duration, Mode, Out> {

  private FingerTrieSeq<Out> queue = FingerTrieSeq.empty();
  private final Function<Mode, Function<In, Iterable<Out>>> switcher;
  private Function<In, Iterable<Out>> flatMapFun;
  private final AbstractTimer timer;
  private final ValuePersister<Duration> periodPersister;
  private final ValuePersister<Mode> modePersister;

  /**
   * @param initMode The initial value of the mode.
   * @param switcher Alters the function to apply depending on the mode.
   * @param schedule Scheduler for timing the output emission.
   * @param delay    Period between outputs.
   */
  public ModalFlatMapConduit(final Mode initMode,
                             final Function<Mode, Function<In, Iterable<Out>>> switcher,
                             final Schedule schedule,
                             final Duration delay) {
    this(new TrivialValuePersister<>(initMode),
        switcher,
        schedule,
        new TrivialValuePersister<>(delay));
  }

  /**
   * @param initMode The initial value of the mode.
   * @param switcher Alters the function to apply depending on the mode.
   * @param schedule Scheduler for timing the output emission.
   * @param periodPersister Durable persistence for the period.
   */
  public ModalFlatMapConduit(final Mode initMode,
                             final Function<Mode, Function<In, Iterable<Out>>> switcher,
                             final Schedule schedule,
                             final ValuePersister<Duration> periodPersister) {
    this(new TrivialValuePersister<>(initMode),
        switcher,
        schedule,
        periodPersister);
  }

  /**
   * @param modePersister   Persistence for the mode.
   * @param switcher Alters the function to apply depending on the mode.
   * @param schedule Scheduler for timing the output emission.
   * @param delay    Period between outputs.
   */
  public ModalFlatMapConduit(final ValuePersister<Mode> modePersister,
                             final Function<Mode, Function<In, Iterable<Out>>> switcher,
                             final Schedule schedule,
                             final Duration delay) {
    this(modePersister,
        switcher,
        schedule,
        new TrivialValuePersister<>(delay));
  }

  /**
   * @param modePersister   Persistence for the mode.
   * @param switcher        Alters the function to apply depending on the mode.
   * @param schedule        Scheduler for timing the output emission.
   * @param periodPersister Durable persistence for the period.
   */
  public ModalFlatMapConduit(final ValuePersister<Mode> modePersister,
                             final Function<Mode, Function<In, Iterable<Out>>> switcher,
                             final Schedule schedule,
                             final ValuePersister<Duration> periodPersister) {
    Require.that(periodPersister.get() != null && Duration.ZERO.compareTo(periodPersister.get()) < 0,
        "The delay must be positive.");
    this.modePersister = modePersister;
    this.switcher = switcher;
    this.flatMapFun = switcher.apply(modePersister.get());
    this.periodPersister = periodPersister;
    timer = new AbstractTimer() {
      @Override
      public void runTimer() {
        final FingerTrieSeq<Out> q = queue;
        final Out toEmit = q.head();
        queue = q.tail();
        emit(toEmit);
        if (!queue.isEmpty()) {
          timerContext.reschedule(periodPersister.get().toMillis());
        }
      }
    };
    schedule.timer(timer);

  }

  private final Receptacle<In> dataReceptacle = new Receptacle<In>() {
    @Override
    public void notifyChange(final Deferred<In> value) {
      final boolean wasEmpty = queue.isEmpty();
      for (final Out val : flatMapFun.apply(value.get())) {
        queue = queue.appended(val);
      }
      if (wasEmpty) {
        timer.runTimer();
      }
    }
  };

  private final Receptacle<Duration> delayReceptacle = new Receptacle<Duration>() {
    @Override
    public void notifyChange(final Deferred<Duration> value) {
      final Duration newDelay = value.get();
      if (Duration.ZERO.compareTo(newDelay) < 0) {
        periodPersister.set(newDelay);
      }
    }
  };

  private final Receptacle<Mode> modeReceptacle = new Receptacle<Mode>() {
    @Override
    public void notifyChange(final Deferred<Mode> value) {
      final Mode mode = value.get();
      modePersister.set(mode);
      flatMapFun = switcher.apply(mode);
    }
  };

  @Override
  public Receptacle<In> first() {
    return dataReceptacle;
  }

  @Override
  public Receptacle<Duration> second() {
    return delayReceptacle;
  }

  @Override
  public Receptacle<Mode> third() {
    return modeReceptacle;
  }
}
