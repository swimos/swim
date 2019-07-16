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

import swim.streamlet.function.MapFieldValuesFunction;

public class MapFieldValuesCombinator<K, VI, VO, I> extends MapFieldValuesOperator<K, VI, VO, I> {
  protected final MapFieldValuesFunction<? super K, ? super VI, ? extends VO> func;

  public MapFieldValuesCombinator(MapFieldValuesFunction<? super K, ? super VI, ? extends VO> func) {
    this.func = func;
  }

  @Override
  public VO evaluate(K key, VI value) {
    return this.func.apply(key, value);
  }
}
