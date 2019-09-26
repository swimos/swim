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

import java.util.function.Function;
import java.util.function.LongSupplier;
import java.util.function.ToLongFunction;
import swim.collections.HashTrieMap;
import swim.concurrent.Schedule;
import swim.concurrent.TimerFunction;
import swim.dataflow.graph.timestamps.TimestampAssigner;
import swim.streamlet.AbstractMapJunction;
import swim.streamlet.MapConduit;
import swim.streamlet.MapView;
import swim.streamlet.persistence.SetPersister;
import swim.streamlet.persistence.TrivialPersistenceProvider.TrivialSetPersisiter;
import swim.util.Deferred;

public class KeyedWindowConduit<K, V, W, U> extends AbstractMapJunction<K, U> implements MapConduit<K, K, V, U> {

  private final SetPersister<K> keyPersister;
  private final Function<K, PaneManager<V, W, U>> paneFactory;
  private final ToLongFunction<V> timestamps;
  private final InternalTimeContext timeContext;
  private HashTrieMap<K, PaneManager<V, W, U>> paneManagers = HashTrieMap.empty();
  private HashTrieMap<K, U> latest = HashTrieMap.empty();

  /**
   * @param schedule Schedule for timer callbacks.
   * @param keyPersister Persistence for the active keys.
   * @param paneFactory The window pane manager factory.
   * @param ts           Assigns timestamps to values.
   */
  public KeyedWindowConduit(final Schedule schedule,
                            final SetPersister<K> keyPersister,
                            final Function<K, PaneManager<V, W, U>> paneFactory,
                            final TimestampAssigner<V> ts) {
    this.paneFactory = paneFactory;
    this.keyPersister = keyPersister;
    timeContext = ts.match(fromData -> new DataTimeContext(), fromClock -> new ScheduleTimeContext(schedule, fromClock));
    timestamps = ts.match(fromData -> fromData, fromClock -> ts);
    for (final K key : keyPersister.get()) {
      final PaneManager<V, W, U> manager = getNewManager(key);
      paneManagers = paneManagers.updated(key, manager);
    }
  }

  /**
   * @param schedule Schedule for timer callbacks.
   * @param paneFactory The window pane manager factory.
   * @param ts           Assigns timestamps to values.
   */
  public KeyedWindowConduit(final Schedule schedule,
                            final Function<K, PaneManager<V, W, U>> paneFactory,
                            final TimestampAssigner<V> ts) {
    this(schedule, new TrivialSetPersisiter<>(), paneFactory, ts);
  }

  @Override
  public void notifyChange(final K key, final Deferred<V> defVal, final Deferred<MapView<K, V>> map) {
    final V value = defVal.get();
    PaneManager<V, W, U> manager = paneManagers.get(key);
    if (manager == null) {
      manager = getNewManager(key);
      paneManagers = paneManagers.updated(key, manager);
    }
    final long timestamp = timestamps.applyAsLong(value);
    timeContext.setNow(timestamp);
    manager.update(value, timestamp, timeContext);
  }

  private PaneManager<V, W, U> getNewManager(final K key) {
    final PaneManager<V, W, U> manager;
    manager = paneFactory.apply(key);
    manager.setListener((w, u) -> {
      latest = latest.updated(key, u);
      emit(key, Deferred.value(u), Deferred.value(MapView.wrap(latest)));
    });
    keyPersister.add(key);
    return manager;
  }

  @Override
  public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {
    final PaneManager<V, W, U> manager = paneManagers.get(key);
    if (manager != null) {
      paneManagers = paneManagers.removed(key);
      latest = latest.removed(key);
      keyPersister.remove(key);
      try {
        manager.close();
      } finally {
        emitRemoval(key, Deferred.value(MapView.wrap(latest)));
      }
    }
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
