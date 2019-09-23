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

package swim.dataflow.graph.impl;

import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.function.Function;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.streamlet.AbstractMapOutlet;
import swim.streamlet.Inlet;
import swim.streamlet.KeyEffect;
import swim.streamlet.Outlet;

/**
 * Consumes a stream of collections and outputs a map stream based on the instantaneous values of the collection.
 * @param <T> The type of the members of the collection.
 * @param <C> The type of the collection.
 * @param <K> The type of the map keys.
 * @param <V> The type of the map values.
 */
final class CollectionToMapTransform<T, C extends Collection<T>, K, V> extends AbstractMapOutlet<K, V, Map<K, V>> implements Inlet<C> {

  private Outlet<? extends C> input;
  private int version;
  private HashTrieMap<K, V> state = HashTrieMap.empty();
  private final Function<T, K> toKey;
  private final Function<T, V> toValue;

  /**
   * @param toKey Extract keys from the members of the collection.
   * @param toValue Extract values from the members of the collection.
   */
  CollectionToMapTransform(final Function<T, K> toKey, final Function<T, V> toValue) {
    this.toKey = toKey;
    this.toValue = toValue;
  }


  @Override
  public Outlet<? extends C> input() {
    return this.input;
  }

  @Override
  public void bindInput(final Outlet<? extends C> input) {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = input;
    if (this.input != null) {
      this.input.bindOutput(this);
    }
  }

  @Override
  public void unbindInput() {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = null;
  }

  @Override
  public void disconnectInputs() {
    final Outlet<? extends C> input = this.input;
    if (input != null) {
      input.unbindOutput(this);
      this.input = null;
      input.disconnectInputs();
    }
  }


  @Override
  public void invalidateOutput() {
    if (this.version >= 0) {
      this.version = -1;
      invalidateInput();
    }
  }

  @Override
  public void reconcileOutput(final int version) {
    if (this.version < 0) {
      this.version = version;
      if (this.input != null) {
        this.input.reconcileInput(version);
        final C col = input.get();
        HashTrieSet<K> toRemove = HashTrieSet.from(state.keySet());
        for (final T entry : col) {
          final K key = toKey.apply(entry);
          final V value = toValue.apply(entry);
          state = state.updated(key, value);
          toRemove = toRemove.removed(key);
          invalidateInputKey(key, KeyEffect.UPDATE);
        }
        for (final K key : toRemove) {
          state = state.removed(key);
          invalidateInputKey(key, KeyEffect.REMOVE);
        }
      }
      reconcileInput(version);
    }
  }

  @Override
  public boolean containsKey(final K key) {
    return state.containsKey(key);
  }

  @Override
  public V get(final K key) {
    return state.get(key);
  }

  @Override
  public Map<K, V> get() {
    return state;
  }

  @Override
  public Iterator<K> keyIterator() {
    return state.keyIterator();
  }

}
