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

package swim.streaming;

import swim.util.Deferred;

/**
 * Interface for handlers that can consume the output of a {@link MapJunction}.
 *
 * @param <K> The type of the map keys.
 * @param <V> The type of the map values.
 */
public interface MapReceptacle<K, V> {

  /**
   * Handle an update to the map.
   *
   * @param key   The key being updated.
   * @param value The new value.
   * @param map   View of the current state of the map.
   */
  void notifyChange(K key, Deferred<V> value, Deferred<MapView<K, V>> map);

  /**
   * Handle an removal from the map.
   *
   * @param key The key being removed.
   * @param map View of the current state of the map.
   */
  void notifyRemoval(K key, Deferred<MapView<K, V>> map);

}
