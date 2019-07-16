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

package swim.store;

import swim.api.data.ValueData;
import swim.structure.Form;
import swim.structure.Value;

public class ValueDataView<V> implements ValueData<V>, ValueDataContext {
  protected final ValueDataBinding dataBinding;
  protected final Form<V> valueForm;

  public ValueDataView(ValueDataBinding dataBinding, Form<V> valueForm) {
    this.dataBinding = dataBinding;
    this.valueForm = valueForm;
  }

  public ValueDataBinding dataBinding() {
    return this.dataBinding;
  }

  @Override
  public Value name() {
    return this.dataBinding.name();
  }

  @Override
  public final Form<V> valueForm() {
    return this.valueForm;
  }

  public <V2> ValueDataView<V2> valueForm(Form<V2> valueForm) {
    return new ValueDataView<V2>(this.dataBinding, valueForm);
  }

  public <V2> ValueDataView<V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  @Override
  public boolean isResident() {
    return this.dataBinding.isResident();
  }

  @Override
  public ValueDataView<V> isResident(boolean isResident) {
    this.dataBinding.isResident(isResident);
    return this;
  }

  @Override
  public boolean isTransient() {
    return this.dataBinding.isTransient();
  }

  @Override
  public ValueDataView<V> isTransient(boolean isTransient) {
    this.dataBinding.isTransient(isTransient);
    return this;
  }

  @Override
  public V get() {
    final Value value = this.dataBinding.get();
    final V valueObject = this.valueForm.cast(value);
    if (valueObject != null) {
      return valueObject;
    }
    return this.valueForm.unit();
  }

  @Override
  public V set(V newValueObject) {
    final Value newValue = this.valueForm.mold(newValueObject).toValue();
    final Value oldValue = this.dataBinding.set(newValue);
    final V oldValueObject = this.valueForm.cast(oldValue);
    if (oldValueObject != null) {
      return oldValueObject;
    }
    return this.valueForm.unit();
  }

  @Override
  public void close() {
    this.dataBinding.close();
  }

  @Override
  public void didChange() {
    // stub
  }

  @Override
  public void didCommit() {
    // stub
  }

  @Override
  public void didSet(Value newValue, Value oldValue) {
    // stub
  }
}
