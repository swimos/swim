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
import swim.dataflow.graph.persistence.MapPersister;

/**
 * {@link MapConduit} that maintains an internal state for each key.
 *
 * @param <In>    The input type.
 * @param <State> The state type.
 */
public class StatefulMapConduit<Key, In, State> extends AbstractMapJunction<Key, State> implements MapConduit<Key, Key, In, State> {

  private final BiFunction<State, In, State> update;
  private final MapPersister<Key, State> persister;

  /**
   * @param persister Persister for the state.
   * @param update    Updates the state for new data.
   */
  public StatefulMapConduit(final MapPersister<Key, State> persister, final BiFunction<State, In, State> update) {
    this.persister = persister;
    this.update = update;
  }

  @Override
  public void notifyChange(final Key key, final Deferred<In> value, final Deferred<MapView<Key, In>> map) {
    final State updVal = update.apply(persister.getOrDefault(key), value.get());
    persister.put(key, updVal);
    emit(key, updVal, persister.get());
  }

  @Override
  public void notifyRemoval(final Key key, final Deferred<MapView<Key, In>> map) {
    persister.remove(key);
    emitRemoval(key, persister.get());
  }
}
