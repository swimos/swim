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
import swim.collections.HashTrieMap;
import swim.util.Deferred;

/**
 * Consumes the keys and values of a map and outputs them a single object.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public class MapExtractor<K, V> extends AbstractJunction<Map<K, V>> implements MapToValueConduit<K, V, Map<K, V>> {

  private HashTrieMap<K, V> acc = HashTrieMap.empty();

  @Override
  public void notifyChange(final K key, final Deferred<V> value, final Deferred<MapView<K, V>> map) {
    acc = acc.updated(key, value.get());
    emit(acc);
  }

  @Override
  public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {
    acc = acc.removed(key);
    emit(acc);
  }
}
