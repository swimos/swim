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

import swim.collections.BTreeMap;
import swim.streamlet.AbstractMapInletOutlet;
import swim.streamlet.KeyEffect;

public abstract class ReduceFieldsOperator<K, V, I, O> extends AbstractMapInletOutlet<K, V, I, O> {
  protected BTreeMap<K, V, O> state;

  public ReduceFieldsOperator() {
    this.state = new BTreeMap<K, V, O>();
  }

  @Override
  public O get() {
    return this.state.reduced(this.identity(), this::accumulate, this::combine);
  }

  @Override
  protected void onReconcileOutputKey(K key, KeyEffect effect, int version) {
    if (effect == KeyEffect.UPDATE) {
      if (this.input != null) {
        final V value = this.input.get(key);
        if (value != null) {
          this.state.put(key, value);
        } else {
          this.state.remove(key);
        }
      }
    } else if (effect == KeyEffect.REMOVE) {
      this.state.remove(key);
    }
  }

  public abstract O identity();

  public abstract O accumulate(O result, V value);

  public abstract O combine(O result, O value);
}
