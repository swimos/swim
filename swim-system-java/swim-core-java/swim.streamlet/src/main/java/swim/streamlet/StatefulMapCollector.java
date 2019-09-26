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

import java.util.function.Function;
import swim.streamlet.persistence.MapPersister;
import swim.util.Deferred;

/**
 * Collects values from a {@link Receptacle} and accumulates them into a map which it then outputs. The current state
 * of the map is stored persistently.
 *
 * @param <T> The type of the input values.
 * @param <K> The type of the output keys.
 * @param <V> The type of the output values.
 */
public class StatefulMapCollector<T, K, V> extends AbstractMapJunction<K, V> implements ValueToMapConduit<T, K, V> {

  private final Function<T, K> toKey;
  private final Function<T, V> toValue;
  private final MapPersister<K, V> persister;

  /**
   * @param toKey     Gets the map key for an input.
   * @param toValue   Gets the map value for an input.
   * @param persister Persistent store for the state of the map.
   */
  public StatefulMapCollector(final Function<T, K> toKey, final Function<T, V> toValue,
                              final MapPersister<K, V> persister) {
    this.toKey = toKey;
    this.toValue = toValue;
    this.persister = persister;
  }

  @Override
  public void notifyChange(final Deferred<T> el) {
    final T element = el.get();
    final K key = toKey.apply(element);
    final V val = toValue.apply(element);
    persister.put(key, val);
    emit(key, val, Deferred.value(persister.get()));
  }
}
