// Copyright 2015-2021 Swim Inc.
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

import swim.streamlet.AbstractMapInlet;
import swim.streamlet.KeyEffect;

public abstract class WatchFieldsOperator<K, V, O> extends AbstractMapInlet<K, V, O> {

  public WatchFieldsOperator() {
    // nop
  }

  @Override
  protected void onRecohereOutputKey(K key, KeyEffect effect, int version) {
    if (effect == KeyEffect.UPDATE) {
      if (this.input != null) {
        this.evaluate(key, this.input.get(key));
      } else {
        this.evaluate(key, null);
      }
    } else if (effect == KeyEffect.REMOVE) {
      this.evaluate(key, null);
    }
  }

  public abstract void evaluate(K key, V value);

}
