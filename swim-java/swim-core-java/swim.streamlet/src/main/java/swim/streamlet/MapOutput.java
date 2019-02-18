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

import java.util.Map;
import swim.collections.HashTrieMap;

public class MapOutput<K, V> extends AbstractMapInlet<K, V, Map<K, V>> {
  protected HashTrieMap<K, V> state;

  public MapOutput() {
    this.state = HashTrieMap.empty();
  }

  public Map<K, V> get() {
    return this.state;
  }

  @Override
  protected void onReconcileOutputKey(K key, KeyEffect effect, int version) {
    if (effect == KeyEffect.UPDATE) {
      if (this.input != null) {
        final V value = this.input.get(key);
        if (value != null) {
          this.state = this.state.updated(key, value);
        } else {
          this.state = this.state.removed(key);
        }
      }
    } else if (effect == KeyEffect.REMOVE) {
      this.state = this.state.removed(key);
    }
  }
}
