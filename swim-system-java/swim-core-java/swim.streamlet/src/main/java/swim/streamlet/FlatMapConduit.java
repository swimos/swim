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
import java.util.Iterator;
import java.util.function.Function;
import swim.collections.FingerTrieSeq;
import swim.concurrent.AbstractTimer;
import swim.concurrent.Schedule;
import swim.util.Deferred;
import swim.util.Require;

/**
 * {@link Conduit} that, for each values of its input, emits a sequence of output values on a configured period.
 *
 * @param <In>  The type of the inputs.
 * @param <Out> The type of the outputs.
 */
public class FlatMapConduit<In, Out> extends AbstractJunction<Out> implements Conduit<In, Out> {

  private FingerTrieSeq<Out> queue = FingerTrieSeq.empty();
  private final Function<In, Iterable<Out>> flatMapFun;
  private final AbstractTimer timer;

  /**
   * @param flatMapFun Function to transform the inputs to the outputs.
   * @param schedule   Used to schedule the output emission.
   * @param delay      Period between outputs.
   */
  public FlatMapConduit(final Function<In, Iterable<Out>> flatMapFun,
                        final Schedule schedule,
                        final Duration delay) {
    Require.that(Duration.ZERO.compareTo(delay) < 0, "The delay between outputs must be positive.");
    this.flatMapFun = flatMapFun;
    final long delayMs = delay.toMillis();
    timer = new AbstractTimer() {
      @Override
      public void runTimer() {
        final FingerTrieSeq<Out> q = queue;
        final Out toEmit = q.head();
        queue = q.tail();
        emit(toEmit);
        if (!queue.isEmpty()) {
          timerContext.reschedule(delayMs);
        }
      }
    };
    schedule.timer(timer);
  }

  @Override
  public void notifyChange(final Deferred<In> value) {
    final Iterable<Out> outputs = flatMapFun.apply(value.get());
    final Iterator<Out> it = outputs.iterator();
    if (it.hasNext()) {
      final boolean wasEmpty = queue.isEmpty();
      while (it.hasNext()) {
        queue = queue.appended(it.next());
      }
      if (wasEmpty) {
        timer.runTimer();
      }
    }

  }
}
