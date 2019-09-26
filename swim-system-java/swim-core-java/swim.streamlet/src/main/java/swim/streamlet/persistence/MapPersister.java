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

package swim.streamlet.persistence;

import java.util.Set;
import swim.streamlet.MapView;

/**
 * Provides durable persistence for a map.
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public interface MapPersister<K, V> {

  /**
   * Get the value for a key.
   * @param key The key.
   * @return The value for the key.
   */
  V get(K key);

  /**
   * Get the value for a key or a configured default.
   * @param key The key.
   * @return The value or the configured default.
   */
  V getOrDefault(K key);

  /**
   * Determine whether the key is in the state.
   *
   * @param key The key.
   * @return Whether the key has an entry in the state.
   */
  boolean containsKey(K key);

  /**
   * @return A view of the state.
   */
  MapView<K, V> get();

  /**
   * @return All keys currently in the state.
   */
  Set<K> keys();

  /**
   * Change the value for a given key.
   * @param key The key.
   * @param value The new value.
   */
  void put(K key, V value);

  /**
   * Remove the value associated with a key.
   * @param key The key.
   */
  void remove(K key);

  /**
   * Close the persister. It should be be used again afterwards.
   */
  void close();
}
