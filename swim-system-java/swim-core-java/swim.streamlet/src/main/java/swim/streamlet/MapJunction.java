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

/**
 * Fundamental interface for all map connectors. Represents a flow component that represents the state of a map from
 * some key type to some value type.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public interface MapJunction<K, V> {

  /**
   * Handle representing a subscription to the values of a specific key.
   *
   * @param <K> The type of the key.
   * @param <V> The type of the value.
   */
  interface Handle<K, V> {

    /**
     * @return The key that this is attache dto.
     */
    K key();

    /**
     * @return The junction that owns this handle.
     */
    MapJunction<K, V> owner();

    /**
     * Remove this subscription.
     */
    void unsubscribe();
  }

  /**
   * Subscribe the outputs of this junction.
   *
   * @param receiver Receives updates and removals for all keys.
   */
  void subscribe(MapReceptacle<K, ? super V> receiver);

  /**
   * Subscribe to the values of a single key.
   *
   * @param key      The key.
   * @param receiver Receives updates for that key only.
   * @return Handle representing the subscription.
   */
  Handle<K, V> subscribe(K key, Receptacle<? super V> receiver);

}
