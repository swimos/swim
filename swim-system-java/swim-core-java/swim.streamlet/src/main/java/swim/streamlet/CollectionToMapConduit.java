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

import java.util.Collection;
import java.util.function.Function;
import swim.collections.HashTrieSet;
import swim.streaming.MapJunction;
import swim.streaming.persistence.MapPersister;
import swim.streaming.persistence.TrivialPersistenceProvider.TrivialMapPersister;
import swim.structure.Form;
import swim.util.Deferred;

/**
 * Conduit that consumes collections and emits them as key/value pairs from a {@link MapJunction}.
 *
 * @param <T> The type of the members of the collections.
 * @param <C> The type of the collections.
 * @param <K> The type of the output keys.
 * @param <V> The type of the output values.
 */
public class CollectionToMapConduit<T, C extends Collection<T>, K, V> extends AbstractMapJunction<K, V> implements ValueToMapConduit<C, K, V> {

  private final MapPersister<K, V> persister;
  private final Function<T, K> toKey;
  private final Function<T, V> toValue;

  /**
   * @param toKey   Extract keys from the members of the collection.
   * @param toValue Extract values from the members of the collection.
   */
  public CollectionToMapConduit(final Function<T, K> toKey, final Function<T, V> toValue,
                                final MapPersister<K, V> persister) {
    this.toKey = toKey;
    this.toValue = toValue;
    this.persister = persister;
  }

  /**
   * @param toKey   Extract keys from the members of the collection.
   * @param toValue Extract values from the members of the collection.
   */
  public CollectionToMapConduit(final Function<T, K> toKey, final Function<T, V> toValue,
                                final Form<V> valForm) {
    this(toKey, toValue, new TrivialMapPersister<>(valForm));
  }

  @Override
  public void notifyChange(final Deferred<C> defColl) {
    final C col = defColl.get();
    HashTrieSet<K> toRemove = HashTrieSet.from(persister.keys());
    for (final T entry : col) {
      final K key = toKey.apply(entry);
      final V value = toValue.apply(entry);
      toRemove = toRemove.removed(key);
      if (!value.equals(persister.get(key))) {
        persister.put(key, value);
        emit(key, value, persister.get());
      }
    }
    for (final K key : toRemove) {
      if (persister.containsKey(key)) {
        persister.remove(key);
        emitRemoval(key, persister.get());
      }
    }
  }
}
