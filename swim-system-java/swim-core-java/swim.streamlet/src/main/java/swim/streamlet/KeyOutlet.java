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

public class KeyOutlet<K, V> extends AbstractOutlet<V> {
  protected final MapOutlet<? super K, ? extends V, ?> input;
  protected final K key;

  public KeyOutlet(MapOutlet<? super K, ? extends V, ?> input, K key) {
    this.input = input;
    this.key = key;
  }

  public MapOutlet<? super K, ? extends V, ?> input() {
    return this.input;
  }

  public K key() {
    return this.key;
  }

  @Override
  public V get() {
    return this.input.get(this.key);
  }
}
