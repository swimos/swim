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

package swim.streamlet.combinator;

import java.util.Iterator;
import swim.collections.HashTrieMap;
import swim.streamlet.AbstractMapInoutlet;
import swim.streamlet.KeyEffect;
import swim.streamlet.MapOutlet;

public class MemoizeMapCombinator<K, V, IO> extends AbstractMapInoutlet<K, V, V, IO, IO> {
  protected IO state;
  protected HashTrieMap<K, V> cache;

  public MemoizeMapCombinator() {
    this.state = null;
    this.cache = HashTrieMap.empty();
  }

  @Override
  public boolean containsKey(K key) {
    return this.cache.containsKey(key);
  }

  @Override
  public V get(K key) {
    return this.cache.get(key);
  }

  @Override
  public IO get() {
    if (this.state == null && this.input != null) {
      this.state = this.input.get();
    }
    return this.state;
  }

  @Override
  public Iterator<K> keyIterator() {
    return this.cache.keyIterator();
  }

  @Override
  protected void onReconcileKey(K key, KeyEffect effect, int version) {
    if (effect == KeyEffect.UPDATE) {
      if (this.input != null) {
        final V value = this.input.get(key);
        if (value != null) {
          this.cache = this.cache.updated(key, value);
        } else {
          this.cache = this.cache.removed(key);
        }
      }
    } else if (effect == KeyEffect.REMOVE) {
      this.cache = this.cache.removed(key);
    }
  }

  @Override
  protected void onReconcile(int version) {
    this.state = null;
  }

  @Override
  public MapOutlet<K, V, IO> memoize() {
    return this;
  }
}
