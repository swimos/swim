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

import swim.streamlet.function.WatchFieldsFunction;

public class WatchFieldsCombinator<K, V, O> extends WatchFieldsOperator<K, V, O> {
  protected final WatchFieldsFunction<? super K, ? super V> func;

  public WatchFieldsCombinator(WatchFieldsFunction<? super K, ? super V> func) {
    this.func = func;
  }

  @Override
  public void evaluate(K key, V value) {
    this.func.apply(key, value);
  }
}
