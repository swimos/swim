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

import swim.collections.HashTrieMap;
import swim.streaming.MapJunction;
import swim.streaming.MapView;
import swim.util.Deferred;

/**
 * Streamlet that memoizes the state of a {@link MapJunction}.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public class MapMemoizingStreamlet<K, V> extends AbstractMapJunction<K, V> implements MapStreamlet<K, K, V, V> {

  private HashTrieMap<K, V> mapState = HashTrieMap.empty();

  @Override
  public void notifyChange(final K key, final Deferred<V> value, final Deferred<MapView<K, V>> map) {
    final V val = value.get();
    mapState = mapState.updated(key, val);
    emit(key, Deferred.value(val), Deferred.value(MapView.wrap(mapState)));
  }

  @Override
  public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {
    mapState = mapState.removed(key);
    emitRemoval(key, Deferred.value(MapView.wrap(mapState)));
  }
}
