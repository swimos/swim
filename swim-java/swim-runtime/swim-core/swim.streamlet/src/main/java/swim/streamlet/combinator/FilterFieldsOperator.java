// Copyright 2015-2023 Nstream, inc.
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

package swim.streamlet.combinator;

import java.util.Iterator;
import java.util.Map;
import swim.collections.HashTrieMap;
import swim.streamlet.AbstractMapInletMapOutlet;
import swim.streamlet.KeyEffect;
import swim.util.Cursor;

public abstract class FilterFieldsOperator<K, V, I> extends AbstractMapInletMapOutlet<K, K, V, V, I, Map<K, V>> {

  public FilterFieldsOperator() {
    // nop
  }

  @Override
  public boolean containsKey(K key) {
    if (this.input != null) {
      final V value = this.input.get(key);
      return value != null && this.evaluate(key, value);
    }
    return false;
  }

  @Override
  public V get(K key) {
    if (this.input != null) {
      final V value = this.input.get(key);
      if (value != null && this.evaluate(key, value)) {
        return value;
      }
    }
    return null;
  }

  @Override
  public Map<K, V> get() {
    HashTrieMap<K, V> output = HashTrieMap.empty();
    final Iterator<K> keys = this.keyIterator();
    while (keys.hasNext()) {
      final K key = keys.next();
      final V value = this.input.get(key);
      if (value != null && this.evaluate(key, value)) {
        output = output.updated(key, value);
      }
    }
    return output;
  }

  @Override
  public Iterator<K> keyIterator() {
    if (this.input != null) {
      return this.input.keyIterator();
    } else {
      return Cursor.empty();
    }
  }

  @Override
  protected void onDecohereOutputKey(K key, KeyEffect effect) {
    this.decohereInputKey(key, effect);
  }

  @Override
  protected void onRecohereOutputKey(K key, KeyEffect effect, int version) {
    this.recohereInputKey(key, version);
  }

  @Override
  protected KeyEffect willRecohereInputKey(K key, KeyEffect effect, int version) {
    if (effect == KeyEffect.UPDATE) {
      if (this.input != null) {
        final V value = this.input.get(key);
        if (value == null || !this.evaluate(key, value)) {
          return KeyEffect.REMOVE;
        }
      }
    }
    return effect;
  }

  public abstract boolean evaluate(K key, V value);

}
