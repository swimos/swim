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

import java.util.Map;
import java.util.function.Function;
import swim.collections.HashTrieMap;
import swim.streamlet.persistence.ListPersister;
import swim.streamlet.persistence.SetPersister;
import swim.streamlet.persistence.TrivialPersistenceProvider.TrivialListPersister;
import swim.streamlet.persistence.TrivialPersistenceProvider.TrivialSetPersisiter;
import swim.util.Deferred;
import swim.util.Require;

/**
 * Conduit that buffers the values it receives and emits the values a fixed number of samples previous to the
 * most recently received value, for each key.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public class DelayMapConduit<K, V> extends AbstractMapJunction<K, V> implements MapConduit<K, K, V, V> {

  private HashTrieMap<K, ListPersister<V>> buffers;
  private final Function<K, ListPersister<V>> bufferPersisters;
  private final SetPersister<K> keys;
  private final int bufferSize;

  /**
   * Store the buffers persistently.
   *
   * @param bufferPersisters Factory for persistent buffers.
   * @param keys             Persistence for the active keys.
   * @param step             Number of samples of delay.
   */
  public DelayMapConduit(final Function<K, ListPersister<V>> bufferPersisters,
                         final SetPersister<K> keys,
                         final int step) {
    Require.that(step >= 1, "Delay must be at least 1.");
    this.buffers = HashTrieMap.empty();
    for (final K key : keys.get()) {
      buffers = buffers.updated(key, bufferPersisters.apply(key));
    }
    this.bufferPersisters = bufferPersisters;
    this.keys = keys;
    this.bufferSize = step + 1;
  }

  /**
   * Store the buffers transiently.
   *
   * @param step Number of samples of delay.
   */
  public DelayMapConduit(final int step) {
    this(k -> new TrivialListPersister<>(), new TrivialSetPersisiter<>(), step);
  }

  @Override
  public void notifyChange(final K key, final Deferred<V> value, final Deferred<MapView<K, V>> map) {
    ListPersister<V> buf = buffers.get(key);
    if (buf == null) {
      buf = bufferPersisters.apply(key);
      buffers = buffers.updated(key, buf);
      keys.add(key);
    }
    buf.append(value.get());
    buf.takeEnd(bufferSize);
    if (buf.size() == bufferSize) {
      final MapView<K, V> view = createView();
      final V current = buf.get(0);
      emit(key, current, view);
    }
  }

  private MapView<K, V> createView() {
    HashTrieMap<K, V> snapshot = HashTrieMap.empty();
    for (final Map.Entry<K, ListPersister<V>> entry : buffers.entrySet()) {
      final ListPersister<V> buf = entry.getValue();
      if (buf.size() >= bufferSize) {
        snapshot = snapshot.updated(entry.getKey(), buf.get(0));
      }
    }
    return MapView.wrap(snapshot);
  }

  @Override
  public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {
    final ListPersister<V> buf = buffers.get(key);
    if (buf != null) {
      try {
        buffers = buffers.removed(key);
        keys.remove(key);
      } finally {
        buf.close();
      }
      final MapView<K, V> view = createView();
      emitRemoval(key, view);
    }
  }


}
