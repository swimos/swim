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
import swim.util.OrderedMap;
import swim.util.ReducedMap;

public class ValueReducedMap<K, V, U> extends ValueOrderedMap<K, V> implements ReducedMap<K, V, U> {
  protected Form<U> reducedForm;

  public ValueReducedMap(ReducedMap<? extends Value, ? extends Value, ? extends Value> inner,
                         Form<K> keyForm, Form<V> valueForm, Form<U> reducedForm) {
    super((OrderedMap<? extends Value, ? extends Value>) inner, keyForm, valueForm);
    this.reducedForm = reducedForm;
  }

  @SuppressWarnings("unchecked")
  @Override
  public ReducedMap<Value, Value, Value> inner() {
    return (ReducedMap<Value, Value, Value>) this.inner;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <K2> ValueReducedMap<K2, V, U> keyForm(Form<K2> keyForm) {
    return new ValueReducedMap<K2, V, U>((ReducedMap<Value, Value, Value>) this.inner,
                                         keyForm, this.valueForm, this.reducedForm);
  }

  @Override
  public <K2> ValueReducedMap<K2, V, U> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  @SuppressWarnings("unchecked")
  @Override
  public <V2> ValueReducedMap<K, V2, U> valueForm(Form<V2> valueForm) {
    return new ValueReducedMap<K, V2, U>((ReducedMap<Value, Value, Value>) this.inner,
                                         this.keyForm, valueForm, this.reducedForm);
  }

  @Override
  public <V2> ValueReducedMap<K, V2, U> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  public Form<U> reducedForm() {
    return this.reducedForm;
  }

  @SuppressWarnings("unchecked")
  public <U2> ValueReducedMap<K, V, U2> reducedForm(Form<U2> reducedForm) {
    return new ValueReducedMap<K, V, U2>((ReducedMap<Value, Value, Value>) this.inner,
                                         this.keyForm, this.valueForm, reducedForm);
  }

  public <U2> ValueReducedMap<K, V, U2> reducedClass(Class<U2> reducedClass) {
    return reducedForm(Form.<U2>forClass(reducedClass));
  }

  @SuppressWarnings("unchecked")
  @Override
  public U reduced(U identity, CombinerFunction<? super V, U> accumulator, CombinerFunction<U, U> combiner) {
    final CombinerFunction<Value, Value> valueAccumulator = new ValueCombinerFunction<V, U>(accumulator, this.reducedForm, this.valueForm);
    final CombinerFunction<Value, Value> valueCombiner = new ValueCombinerFunction<U, U>(combiner, this.reducedForm, this.reducedForm);
    final Value identityValue = this.reducedForm.mold(identity).toValue();
    final Value reducedValue = ((ValueReducedMap<Value, Value, Value>) this.inner).reduced(identityValue, valueAccumulator, valueCombiner);
    final U reduced = this.reducedForm.cast(reducedValue);
    return reduced;
  }
}
