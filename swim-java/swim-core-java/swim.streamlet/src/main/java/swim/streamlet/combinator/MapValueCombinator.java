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

import swim.streamlet.function.MapValueFunction;

public class MapValueCombinator<I, O> extends MapValueOperator<I, O> {
  protected final MapValueFunction<? super I, ? extends O> func;

  public MapValueCombinator(MapValueFunction<? super I, ? extends O> func) {
    this.func = func;
  }

  @Override
  public O evaluate(I value) {
    return this.func.apply(value);
  }
}
