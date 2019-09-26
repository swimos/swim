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

import swim.streaming.MapView;
import swim.streaming.persistence.MapPersister;
import swim.streaming.persistence.TrivialPersistenceProvider.TrivialMapPersister;
import swim.structure.Form;
import swim.util.Deferred;

/**
 * A streamlet that only emits the first value it receives for each key.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public class FirstValueMapStreamlet<K, V> extends AbstractMapJunction<K, V> implements MapStreamlet<K, K, V, V> {

  private final boolean resetOnRemoval;
  private final MapPersister<K, V> state;

  /**
   * Store the first values persistently.
   * @param resetOnRemoval Whether to reset the first value on removal of a key.
   * @param state Persister for the state.
   */
  public FirstValueMapStreamlet(final boolean resetOnRemoval, final MapPersister<K, V> state) {
    this.state = state;
    this.resetOnRemoval = resetOnRemoval;
  }

  /**
   * Store the first values transiently.
   * @param resetOnRemoval Whether to reset the first value on removal of a key.
   * @param form The form of the values.
   */
  public FirstValueMapStreamlet(final boolean resetOnRemoval, final Form<V> form) {
    this(resetOnRemoval, new TrivialMapPersister<>(form));
  }

  @Override
  public void notifyChange(final K key, final Deferred<V> value, final Deferred<MapView<K, V>> map) {
    if (!state.containsKey(key)) {
      final V first = value.get();
      state.put(key, value.get());
      emit(key, Deferred.value(first), Deferred.value(state.get()));
    }
  }

  @Override
  public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {
    if (resetOnRemoval && state.containsKey(key)) {
      state.remove(key);
      emitRemoval(key, state.get());
    }
  }
}
