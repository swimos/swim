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
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.concurrent.Recurring;
import swim.concurrent.Schedule;
import swim.streaming.MapReceptacle;
import swim.streaming.MapView;
import swim.streaming.Receptacle;
import swim.streaming.persistence.TrivialPersistenceProvider.TrivialValuePersister;
import swim.streaming.persistence.ValuePersister;
import swim.util.Deferred;
import swim.util.Require;

/**
 * Map streamlet that emits its outputs on a timer rather than on receipt of input. The changes that occur between two
 * output events are saved up and then, when an output triggers, all keys that have changed in the interim are emitted.
 * The period can be controlled by an auxiliary input.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public class RateLimitedMapStreamlet<K, V> extends AbstractMapJunction<K, V> implements MapJunction2<K, K, V, V, Duration> {

  private HashTrieSet<K> keys = HashTrieSet.empty();
  private HashTrieMap<K, Deferred<V>> delta = HashTrieMap.empty();
  private HashTrieSet<K> removals = HashTrieSet.empty();
  private Deferred<MapView<K, V>> view = null;

  private final Schedule schedule;
  private Recurring recurring = null;
  private final ValuePersister<Duration> period;

  /**
   * @param schedule  Schedule used to trigger the output events.
   * @param persister Durable persistence for the period.
   */
  public RateLimitedMapStreamlet(final Schedule schedule,
                                 final ValuePersister<Duration> persister) {
    Require.that(Duration.ZERO.compareTo(persister.get()) < 0, "The period between outputs must be positive.");
    this.schedule = schedule;
    this.period = persister;
  }

  /**
   * @param schedule Schedule used to trigger the output events.
   * @param period   Period between events.
   */
  public RateLimitedMapStreamlet(final Schedule schedule,
                                 final Duration period) {
    this(schedule, new TrivialValuePersister<>(period));
  }

  /**
   * Start the timer that will trigger the outputs.
   */
  private void initTimer() {
    recurring = new Recurring(schedule, period.get().toMillis()) {
      @Override
      protected void onTrigger() {
        if (view != null) {
          for (final Map.Entry<K, Deferred<V>> entry : delta) {
            emit(entry.getKey(), entry.getValue(), view);
            keys = keys.added(entry.getKey());
          }
          for (final K key : removals) {
            emitRemoval(key, view);
            keys = keys.removed(key);
          }
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
      view = map;
      if (removals.contains(key)) {
        removals = removals.removed(key);
      }
      delta = delta.updated(key, value);
      if (recurring == null) {
        initTimer();
        recurring.start();
      }
    }

    @Override
    public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {
      view = map;
      if (delta.containsKey(key)) {
        delta = delta.removed(key);
      }
      if (keys.contains(key)) {
        removals = removals.added(key);
      }
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
