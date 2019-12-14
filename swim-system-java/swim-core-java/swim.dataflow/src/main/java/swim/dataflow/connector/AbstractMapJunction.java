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

import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.dataflow.graph.Require;
import swim.util.Deferred;

/**
 * Abstract implementation of {@link MapJunction} which provides methods to pass on changes to the values for each
 * key to any number of subscribers to the outputs of the junction.
 *
 * @param <K> The type of the output keys.
 * @param <V> The type of the output values.
 */
public abstract class AbstractMapJunction<K, V> implements MapJunction<K, V> {
  private FingerTrieSeq<MapReceptacle<K, ? super V>> receptacles = FingerTrieSeq.empty();
  private HashTrieMap<K, FingerTrieSeq<Receptacle<? super V>>> keyReceptacles = HashTrieMap.empty();

  @Override
  public final void subscribe(final MapReceptacle<K, ? super V> receiver) {
    Require.that(receiver != null, "Receiver must not be null.");
    receptacles = receptacles.appended(receiver);
  }

  @Override
  public final Handle<K, V> subscribe(final K key, final Receptacle<? super V> receiver) {
    final FingerTrieSeq<Receptacle<? super V>> seq;
    if (keyReceptacles.containsKey(key)) {
      seq = keyReceptacles.get(key);
    } else {
      seq = FingerTrieSeq.empty();
    }
    keyReceptacles = keyReceptacles.updated(key, seq.appended(receiver));
    return new SubHandle(key, receiver);
  }

  /**
   * Handle which allows consumers to unsubscribe from a key of the map.
   */
  private final class SubHandle implements Handle<K, V> {

    private final K key;
    private final Receptacle<? super V> target;

    private SubHandle(final K key, final Receptacle<? super V> target) {
      this.key = key;
      this.target = target;
    }

    @Override
    public K key() {
      return key;
    }

    @Override
    public MapJunction<K, V> owner() {
      return AbstractMapJunction.this;
    }

    @Override
    public void unsubscribe() {
      final FingerTrieSeq<Receptacle<? super V>> receps = keyReceptacles.get(key);
      if (receps != null) {
        keyReceptacles = keyReceptacles.updated(key, receps.removed(target));
      }
    }
  }

  /**
   * Emit a value for a specific key.
   *
   * @param key   The key.
   * @param value The updated value for the key.
   * @param map   View of the state of the map after the update.
   */
  protected final void emit(final K key, final Deferred<V> value, final Deferred<MapView<K, V>> map) {
    for (final MapReceptacle<K, ? super V> receptacle : receptacles) {
      emitOn(key, value, map, receptacle);
    }
    if (keyReceptacles.containsKey(key)) {
      for (final Receptacle<? super V> receptacle : keyReceptacles.get(key)) {
        emitOn(value, receptacle);
      }
    }
  }

  /**
   * Emit a value for a specific key.
   *
   * @param key   The key.
   * @param value The updated value for the key.
   * @param map   View of the state of the map after the update.
   */
  protected final void emit(final K key, final V value, final MapView<K, V> map) {
    emit(key, Deferred.value(value), Deferred.value(map));
  }

  /**
   * Emit a removal fom the map.
   *
   * @param key The key to remove.
   * @param map View of the state of the map after the removal.
   */
  protected final void emitRemoval(final K key, final Deferred<MapView<K, V>> map) {
    for (final MapReceptacle<K, ? super V> receptacle : receptacles) {
      receptacle.notifyRemoval(key, covCast(map));
    }
  }

  /**
   * Emit a removal fom the map.
   *
   * @param key The key to remove.
   * @param map View of the state of the map after the removal.
   */
  protected final void emitRemoval(final K key, final MapView<K, V> map) {
    emitRemoval(key, Deferred.value(map));
  }

  /**
   * Emit a value for a specific key.
   *
   * @param key   The key.
   * @param value The updated value for the key.
   * @param map   View of the state of the map after the update.
   */
  protected final void emit(final K key, final V value, final Deferred<MapView<K, V>> map) {
    emit(key, Deferred.value(value), map);
  }

  private static <K, U1, U2 extends U1> void emitOn(final K key, final Deferred<U2> value,
                                                    final Deferred<MapView<K, U2>> map,
                                                    final MapReceptacle<K, U1> receptacle) {
    receptacle.notifyChange(key, Deferred.covCast(value), covCast(map));
  }

  private static <U1, U2 extends U1> void emitOn(final Deferred<U2> value,
                                                 final Receptacle<U1> receptacle) {
    receptacle.notifyChange(Deferred.covCast(value));
  }

  @SuppressWarnings("unchecked")
  private static <K, U1, U2 extends U1> Deferred<MapView<K, U1>> covCast(final Deferred<MapView<K, U2>> def) {
    return (Deferred<MapView<K, U1>>) (Deferred<?>) def;
  }

}
