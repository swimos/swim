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
import java.util.function.Function;
import swim.collections.HashTrieMap;
import swim.streaming.MapView;
import swim.util.Deferred;

/**
 * Map streamlet that maintains an internal state where the function that updates the state can be modified by an
 * auxiliary control input.
 *
 * @param <Key>   The key type.
 * @param <ValIn> The input value type.
 * @param <Mode>  The type of the control values.
 * @param <State> The type of the internal state.
 */
public class TransientModalStatefulMapStreamlet<Key, ValIn, Mode, State>
    extends ModalMapStreamlet<Key, Key, ValIn, State, Mode, BiFunction<Deferred<State>, Deferred<ValIn>, Deferred<State>>> {

  private final Function<Mode, BiFunction<Deferred<State>, Deferred<ValIn>, Deferred<State>>> switcher;
  private HashTrieMap<Key, Deferred<State>> states = HashTrieMap.empty();
  private final Deferred<State> seed;

  @Override
  protected Deferred<BiFunction<Deferred<State>, Deferred<ValIn>, Deferred<State>>> changeMode(final Deferred<Mode> mode) {
    return mode.andThen(switcher);
  }

  /**
   * @param init     The initial value of the mode.
   * @param seed     The initial value of the state.
   * @param switcher Alters the update function based on the mode.
   */
  public TransientModalStatefulMapStreamlet(final Mode init,
                                            final Deferred<State> seed,
                                            final Function<Mode, BiFunction<Deferred<State>, Deferred<ValIn>, Deferred<State>>> switcher) {
    super(switcher.apply(init));
    this.switcher = switcher;
    this.seed = seed;
  }

  @Override
  protected void notifyChange(final Deferred<BiFunction<Deferred<State>, Deferred<ValIn>, Deferred<State>>> update,
                              final Key key,
                              final Deferred<ValIn> value,
                              final Deferred<MapView<Key, ValIn>> map) {
    final Deferred<State> existing = states.getOrDefault(key, seed);
    final Deferred<State> newVal = update.get().apply(existing, value);
    states = states.updated(key, newVal);
    emit(key, newVal, Deferred.value(MapView.wrap(states)));
  }

  @Override
  protected void notifyRemoval(final Deferred<BiFunction<Deferred<State>, Deferred<ValIn>, Deferred<State>>> state,
                               final Key key,
                               final Deferred<MapView<Key, ValIn>> map) {
    states = states.removed(key);
    emitRemoval(key, Deferred.value(MapView.wrap(states)));
  }

}
