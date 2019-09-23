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

package swim.dataflow.graph.sinks;

import java.util.Iterator;
import java.util.Map;
import java.util.function.Supplier;
import swim.collections.HashTrieMap;
import swim.dataflow.connector.Deferred;
import swim.dataflow.connector.MapReceptacle;
import swim.dataflow.connector.MapView;
import swim.dataflow.graph.MapSink;
import swim.dataflow.graph.SwimStreamContext;
import swim.streamlet.AbstractMapOutlet;
import swim.streamlet.KeyEffect;
import swim.streamlet.MapInlet;

/**
 * Sink based on an external map inlet.
 *
 * @param <K> The key type of the inlet.
 * @param <V> The value type of the inlet.
 */
public class MapInletSink<K, V> implements MapSink<K, V> {

  private final Supplier<MapInlet<K, V, Map<K, V>>> inlet;

  public MapInletSink(final Supplier<MapInlet<K, V, Map<K, V>>> inletSupp) {
    inlet = inletSupp;
  }

  public MapInletSink(final MapInlet<K, V, Map<K, V>> in) {
    this(() -> in);
  }

  @Override
  public MapReceptacle<K, V> instantiateReceptacle(final SwimStreamContext.InitContext context) {
    final BridgeMapOutlet<K, V> bridge = new BridgeMapOutlet<>();
    inlet.get().bindInput(bridge);
    return bridge.getReceptacle();
  }
}

final class BridgeMapOutlet<K, V> extends AbstractMapOutlet<K, V, Map<K, V>> {

  private MapView<K, V> view;
  private int count = 0;

  private final MapReceptacle<K, V> receptacle = new MapReceptacle<K, V>() {

    @Override
    public void notifyChange(final K key, final Deferred<V> value, final Deferred<MapView<K, V>> map) {
      view = map.get();
      invalidateInputKey(key, KeyEffect.UPDATE);
      reconcileInputKey(key, count);
      ++count;
    }

    @Override
    public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {
      view = map.get();
      invalidateInputKey(key, KeyEffect.REMOVE);
      reconcileInputKey(key, count);
      ++count;
    }
  };

  public MapReceptacle<K, V> getReceptacle() {
    return receptacle;
  }

  @Override
  public boolean containsKey(final K key) {
    return view != null && view.containsKey(key);
  }

  @Override
  public V get(final K key) {
    return view == null ? null : view.get(key).get();
  }

  @Override
  public Map<K, V> get() {
    if (view != null) {
      HashTrieMap<K, V> map = HashTrieMap.empty();
      for (final Map.Entry<K, Deferred<V>> entry : view) {
        map = map.updated(entry.getKey(), entry.getValue().get());
      }
      return map;
    } else {
      return null;
    }
  }

  @Override
  public Iterator<K> keyIterator() {
    return view == null ? null : view.keys().iterator();
  }
}
