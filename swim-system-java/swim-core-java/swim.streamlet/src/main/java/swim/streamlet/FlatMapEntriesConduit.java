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

import java.util.Set;
import java.util.function.BiFunction;
import java.util.function.Function;
import swim.collections.HashTrieMap;
import swim.streaming.MapView;
import swim.util.Deferred;
import swim.util.Pair;

/**
 * {@link Conduit} that transforms the entries of a map using a function that produces a sequence of key values pairs
 * for each each entry in the input.
 *
 * @param <K1> The type of the input keys.
 * @param <K2> The type of the output keys.
 * @param <V1> The type of the input values.
 * @param <V2> The type of the output values.
 */
public class FlatMapEntriesConduit<K1, K2, V1, V2> extends AbstractMapJunction<K2, V2> implements MapConduit<K1, K2, V1, V2> {

  private final BiFunction<K1, V1, Iterable<Pair<K2, V2>>> onUpdate;
  private final Function<K1, Set<K2>> onRemove;
  private HashTrieMap<K2, V2> state = HashTrieMap.empty();

  /**
   * @param onUpdate Function to transform the values.
   * @param onRemove Function to determine which keys should be removed from the output when a key is removed from
   *                 the input.
   */
  public FlatMapEntriesConduit(final BiFunction<K1, V1, Iterable<Pair<K2, V2>>> onUpdate,
                               final Function<K1, Set<K2>> onRemove) {
    this.onUpdate = onUpdate;
    this.onRemove = onRemove;
  }

  @Override
  public void notifyChange(final K1 key, final Deferred<V1> value, final Deferred<MapView<K1, V1>> map) {
    for (final Pair<K2, V2> pair : onUpdate.apply(key, value.get())) {
      state = state.updated(pair.getFirst(), pair.getSecond());
      emit(pair.getFirst(), pair.getSecond(), Deferred.value(MapView.wrap(state)));
    }
  }

  @Override
  public void notifyRemoval(final K1 key, final Deferred<MapView<K1, V1>> map) {
    for (final K2 toRemove : onRemove.apply(key)) {
      if (state.containsKey(toRemove)) {
        state = state.removed(toRemove);
        emitRemoval(toRemove, Deferred.value(MapView.wrap(state)));
      }
    }
  }
}
