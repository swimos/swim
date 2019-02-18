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

public class ValueDataProxy implements ValueDataBinding, ValueDataContext {
  protected final ValueDataBinding dataBinding;
  protected ValueDataContext dataContext;

  public ValueDataProxy(ValueDataBinding dataBinding) {
    this.dataBinding = dataBinding;
  }

  public final ValueDataBinding dataBinding() {
    return this.dataBinding;
  }

  @Override
  public final ValueDataContext dataContext() {
    return this.dataContext;
  }

  @Override
  public void setDataContext(ValueDataContext dataContext) {
    this.dataContext = dataContext;
    this.dataBinding.setDataContext(this);
  }

  @Override
  public StoreBinding storeBinding() {
    return this.dataBinding.storeBinding();
  }

  @Override
  public void setStoreBinding(StoreBinding storeBinding) {
    this.dataBinding.setStoreBinding(storeBinding);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapData(Class<T> dataClass) {
    if (dataClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.dataBinding.unwrapData(dataClass);
    }
  }

  @Override
  public Value name() {
    return this.dataBinding.name();
  }

  @Override
  public long dataSize() {
    return this.dataBinding.dataSize();
  }

  @Override
  public Form<Value> valueForm() {
    return Form.forValue();
  }

  @Override
  public <V> ValueData<V> valueForm(Form<V> valueForm) {
    return new ValueDataView<V>(this, valueForm);
  }

  @Override
  public <V> ValueData<V> valueClass(Class<V> valueClass) {
    return valueForm(Form.<V>forClass(valueClass));
  }

  @Override
  public boolean isResident() {
    return this.dataBinding.isResident();
  }

  @Override
  public ValueDataBinding isResident(boolean isResident) {
    this.dataBinding.isResident(isResident);
    return this;
  }

  @Override
  public boolean isTransient() {
    return this.dataBinding.isTransient();
  }

  @Override
  public ValueDataBinding isTransient(boolean isTransient) {
    this.dataBinding.isTransient(isTransient);
    return this;
  }

  @Override
  public Value get() {
    return this.dataBinding.get();
  }

  @Override
  public Value set(Value newValue) {
    return this.dataBinding.set(newValue);
  }

  @Override
  public void close() {
    this.dataBinding.close();
  }

  @Override
  public void didChange() {
    this.dataContext.didChange();
  }

  @Override
  public void didCommit() {
    this.dataContext.didCommit();
  }

  @Override
  public void didSet(Value newValue, Value oldValue) {
    this.dataContext.didSet(newValue, oldValue);
  }
}
