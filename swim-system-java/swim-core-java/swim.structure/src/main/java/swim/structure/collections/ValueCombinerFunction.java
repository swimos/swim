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

package swim.structure.collections;

import swim.structure.Form;
import swim.structure.Value;
import swim.util.CombinerFunction;

final class ValueCombinerFunction<V, U> implements CombinerFunction<Value, Value> {
  final CombinerFunction<? super V, U> combiner;
  final Form<U> resultForm;
  final Form<V> elementForm;

  ValueCombinerFunction(CombinerFunction<? super V, U> combiner, Form<U> resultForm, Form<V> elementForm) {
    this.combiner = combiner;
    this.resultForm = resultForm;
    this.elementForm = elementForm;
  }

  @Override
  public Value combine(Value resultValue, Value elementValue) {
    U result = this.resultForm.cast(resultValue);
    final V element = this.elementForm.cast(elementValue);
    result = this.combiner.combine(result, element);
    resultValue = this.resultForm.mold(result).toValue();
    return resultValue;
  }
}
