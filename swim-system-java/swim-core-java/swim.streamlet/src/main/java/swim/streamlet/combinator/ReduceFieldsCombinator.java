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

import swim.util.CombinerFunction;

public class ReduceFieldsCombinator<K, V, I, O> extends ReduceFieldsOperator<K, V, I, O> {
  protected final O identity;
  protected final CombinerFunction<? super V, O> accumulator;
  protected final CombinerFunction<O, O> combiner;

  public ReduceFieldsCombinator(O identity, CombinerFunction<? super V, O> accumulator,
                                CombinerFunction<O, O> combiner) {
    this.identity = identity;
    this.accumulator = accumulator;
    this.combiner = combiner;
  }

  @Override
  public O get() {
    return this.state.reduced(this.identity, this.accumulator, this.combiner);
  }

  @Override
  public O identity() {
    return this.identity;
  }

  @Override
  public O accumulate(O result, V value) {
    return this.accumulator.combine(result, value);
  }

  @Override
  public O combine(O result, O value) {
    return this.combiner.combine(result, value);
  }
}
