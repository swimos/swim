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

import java.util.function.BiFunction;
import swim.collections.HashTrieMap;
import swim.streaming.MapView;
import swim.util.Deferred;

/**
 * {@link MapStreamlet} that maintains an internal state for each key.
 *
 * @param <In>    The input type.
 * @param <State> The state type.
 */
public class TransientStatefulMapStreamlet<Key, In, State> extends AbstractMapJunction<Key, State> implements MapStreamlet<Key, Key, In, State> {

  private final BiFunction<Deferred<State>, Deferred<In>, Deferred<State>> update;
  private HashTrieMap<Key, Deferred<State>> state = HashTrieMap.empty();
  private final Deferred<State> seed;

  /**
   * @param seed   The initial value of the seed.
   * @param update Updates the state for new data.
   */
  public TransientStatefulMapStreamlet(final Deferred<State> seed, final BiFunction<Deferred<State>, Deferred<In>, Deferred<State>> update) {
    this.seed = seed;
    this.update = update;
  }

  @Override
  public void notifyChange(final Key key, final Deferred<In> value, final Deferred<MapView<Key, In>> map) {
    final Deferred<State> updVal = update.apply(state.getOrDefault(key, seed), value);
    state = state.updated(key, updVal);
    emit(key, updVal, Deferred.value(MapView.wrap(state)));
  }

  @Override
  public void notifyRemoval(final Key key, final Deferred<MapView<Key, In>> map) {
    if (state.containsKey(key)) {
      state = state.removed(key);
      emitRemoval(key, Deferred.value(MapView.wrap(state)));
    }
  }
}
