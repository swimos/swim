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
import java.util.Map;
import swim.concurrent.Recurring;
import swim.concurrent.Schedule;
import swim.streamlet.persistence.TrivialPersistenceProvider;
import swim.streamlet.persistence.ValuePersister;
import swim.util.Deferred;
import swim.util.Require;

/**
 * Map conduit that emits its outputs on a timer rather than on receipt of input. When the output triggers the entire
 * contents of the map are reported downstream together with any keys that have been removed since the last trigger.
 * The period can be controlled by an auxiliary input.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public class SamplingMapConduit<K, V> extends AbstractMapJunction<K, V> implements MapJunction2<K, K, V, V, Duration> {

  private MapView<K, V> oldView = null;
  private Deferred<MapView<K, V>> nextView = null;
  private final Schedule schedule;
  private Recurring recurring = null;
  private final ValuePersister<Duration> period;

  /**
   * @param schedule  Schedule for triggering outputs.
   * @param persister Durable persistence for the period.
   */
  public SamplingMapConduit(final Schedule schedule,
                            final ValuePersister<Duration> persister) {
    Require.that(Duration.ZERO.compareTo(persister.get()) < 0, "The period must be positive.");
    this.schedule = schedule;
    this.period = persister;
  }

  /**
   * @param schedule Schedule for triggering outputs.
   * @param period   The period between output triggers.
   */
  public SamplingMapConduit(final Schedule schedule,
                            final Duration period) {
    this(schedule, new TrivialPersistenceProvider.TrivialValuePersister<>(period));
  }

  private void initTimer() {
    recurring = new Recurring(schedule, period.get().toMillis()) {
      @Override
      protected void onTrigger() {
        if (nextView != null) {
          final MapView<K, V> nextMap = nextView.get();
          final Deferred<MapView<K, V>> defMap = Deferred.value(nextMap);
          if (oldView != null) {
            for (final K key : oldView.keys()) {
              if (!nextMap.containsKey(key)) {
                emitRemoval(key, defMap);
              }
            }
          }
          for (final Map.Entry<K, Deferred<V>> entry : nextMap) {
            emit(entry.getKey(), entry.getValue(), defMap);
          }
          oldView = nextMap;
        }
      }
    };
  }

  /**
   * Stop the periodic events.
   */
  public void stop() {
    if (recurring != null) {
      recurring.stop();
    }
  }

  private final MapReceptacle<K, V> dataReceptacle = new MapReceptacle<K, V>() {

    @Override
    public void notifyChange(final K key, final Deferred<V> value, final Deferred<MapView<K, V>> map) {
      nextView = map;
      if (recurring == null) {
        initTimer();
        recurring.start();
      }
    }

    @Override
    public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {
      nextView = map;
      if (recurring == null) {
        initTimer();
        recurring.start();
      }
    }
  };

  @Override
  public MapReceptacle<K, V> first() {
    return dataReceptacle;
  }

  private final Receptacle<Duration> periodReceptacle = new Receptacle<Duration>() {
    @Override
    public void notifyChange(final Deferred<Duration> value) {
      final Duration newPeriod = value.get();
      if (Duration.ZERO.compareTo(newPeriod) < 0) {
        period.set(newPeriod);
        if (recurring != null) {
          recurring.setPeriod(newPeriod.toMillis());
        }
      }
    }
  };

  @Override
  public Receptacle<Duration> second() {
    return periodReceptacle;
  }
}
