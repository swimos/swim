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

import java.util.Iterator;
import java.util.Map;
import swim.collections.HashTrieMap;

public class MapInput<K, V> extends AbstractMapOutlet<K, V, Map<K, V>> {
  protected HashTrieMap<K, V> state;

  public MapInput(HashTrieMap<K, V> state) {
    this.state = state;
    final Iterator<K> keys = state.keyIterator();
    while (keys.hasNext()) {
      this.effects = this.effects.updated(keys.next(), KeyEffect.UPDATE);
    }
  }

  public MapInput() {
    this(HashTrieMap.empty());
  }

  @Override
  public boolean containsKey(K key) {
    return this.state.containsKey(key);
  }

  @Override
  public V get(K key) {
    return this.state.get(key);
  }

  public V put(K key, V newValue) {
    final V oldValue = this.state.get(key);
    this.state = this.state.updated(key, newValue);
    invalidateInputKey(key, KeyEffect.UPDATE);
    return oldValue;
  }

  public boolean removeKey(K key) {
    final HashTrieMap<K, V> oldState = this.state;
    final HashTrieMap<K, V> newState = oldState.removed(key);
    if (oldState != newState) {
      this.state = newState;
      invalidateInputKey(key, KeyEffect.REMOVE);
      return true;
    } else {
      return false;
    }
  }

  @Override
  public Map<K, V> get() {
    return this.state;
  }

  @Override
  public Iterator<K> keyIterator() {
    return this.state.keyIterator();
  }
}
