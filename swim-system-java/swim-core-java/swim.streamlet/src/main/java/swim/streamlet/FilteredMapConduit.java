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
import java.util.function.BiPredicate;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.util.Deferred;

/**
 * {@link MapConduit} that filters out some key/value pairs from it's input.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public class FilteredMapConduit<K, V> extends AbstractMapJunction<K, V> implements MapConduit<K, K, V, V> {

  private final BiPredicate<K, V> predicate;
  private HashTrieSet<K> keys = HashTrieSet.empty();

  /**
   * @param predicate Predicate on the key/value pairs.
   */
  public FilteredMapConduit(final BiPredicate<K, V> predicate) {
    this.predicate = predicate;
  }

  @Override
  public void notifyChange(final K key, final Deferred<V> value, final Deferred<MapView<K, V>> map) {
    final V val = value.get();
    if (predicate.test(key, val)) {
      keys = keys.added(key);
      emit(key, val, map.andThen(m -> filterMap(m, predicate)));
    } else if (keys.contains(key)) {
      //In the case where a key was in the map but its new value leads to it being filtered, emit a removal notification.
      keys = keys.removed(key);
      emitRemoval(key, map.andThen(m -> filterMap(m, predicate)));
    }
  }

  /**
   * Filter a {@link MapView} by a predicate on the key value pairs.
   *
   * @param view      The view.
   * @param predicate The predicate.
   * @param <K>       The type of the keys.
   * @param <V>       The type of teh values.
   * @return The filtered view.
   */
  private static <K, V> MapView<K, V> filterMap(final MapView<K, V> view, final BiPredicate<K, V> predicate) {
    HashTrieMap<K, V> filtered = HashTrieMap.empty();
    for (final Map.Entry<K, Deferred<V>> entry : view) {
      final V val = entry.getValue().get();
      if (predicate.test(entry.getKey(), entry.getValue().get())) {
        filtered = filtered.updated(entry.getKey(), val);
      }
    }
    return MapView.wrap(filtered);
  }

  @Override
  public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {
    if (keys.contains(key)) {
      keys = keys.removed(key);
      emitRemoval(key, map.andThen(m -> filterMap(m, predicate)));
    }
  }
}
