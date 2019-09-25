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

package swim.dataflow.connector;

import java.util.function.BiFunction;
import java.util.function.Function;
import swim.dataflow.graph.persistence.MapPersister;
import swim.dataflow.graph.persistence.ValuePersister;
import swim.util.Deferred;

/**
 * Map conduit that maintains an external state where the function that updates the state can be modified by an
 * auxiliary control input.
 *
 * @param <Key>   The key type.
 * @param <ValIn> The input value type.
 * @param <Mode>  The type of the control values.
 * @param <State> The type of the internal state.
 */
public class ModalStatefulMapConduit<Key, ValIn, Mode, State>
    extends ModalMapConduit<Key, Key, ValIn, State, Mode, BiFunction<State, ValIn, State>> {

  private final MapPersister<Key, State> statePersister;
  private final Function<Mode, BiFunction<State, ValIn, State>> switcher;

  /**
   * @param modePersister  External persistence for the mode.
   * @param statePersister External persistence for the state.
   * @param switcher       Alters the update function based on the mode.
   */
  public ModalStatefulMapConduit(final ValuePersister<Mode> modePersister,
                                 final MapPersister<Key, State> statePersister,
                                 final Function<Mode, BiFunction<State, ValIn, State>> switcher) {
    super(modePersister, switcher.apply(modePersister.get()));
    this.statePersister = statePersister;
    this.switcher = switcher;
  }

  @Override
  protected Deferred<BiFunction<State, ValIn, State>> changeMode(final Deferred<Mode> mode) {
    return mode.andThen(switcher);
  }

  @Override
  protected void notifyChange(final Deferred<BiFunction<State, ValIn, State>> update,
                              final Key key,
                              final Deferred<ValIn> value,
                              final Deferred<MapView<Key, ValIn>> map) {
    final State existing = statePersister.getOrDefault(key);
    final State newState = update.get().apply(existing, value.get());
    statePersister.put(key, newState);
    emit(key, newState, statePersister.get());
  }

  @Override
  protected void notifyRemoval(final Deferred<BiFunction<State, ValIn, State>> state,
                               final Key key, final Deferred<MapView<Key, ValIn>> map) {
    if (statePersister.containsKey(key)) {
      statePersister.remove(key);
      emitRemoval(key, Deferred.value(statePersister.get()));
    }
  }
}
