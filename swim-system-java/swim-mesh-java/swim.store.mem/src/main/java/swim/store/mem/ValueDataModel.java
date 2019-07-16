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

package swim.store.mem;

import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.data.ValueData;
import swim.store.StoreBinding;
import swim.store.ValueDataBinding;
import swim.store.ValueDataContext;
import swim.store.ValueDataView;
import swim.structure.Form;
import swim.structure.Value;

public class ValueDataModel implements ValueDataBinding {
  protected final Value name;
  protected volatile Value value;
  protected ValueDataContext dataContext;
  protected StoreBinding storeBinding;

  public ValueDataModel(Value name, Value value) {
    this.name = name;
    this.value = value.commit();
  }

  @Override
  public ValueDataContext dataContext() {
    return this.dataContext;
  }

  @Override
  public void setDataContext(ValueDataContext dataContext) {
    this.dataContext = dataContext;
  }

  @Override
  public StoreBinding storeBinding() {
    return this.storeBinding;
  }

  @Override
  public void setStoreBinding(StoreBinding storeBinding) {
    this.storeBinding = storeBinding;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapData(Class<T> dataClass) {
    if (dataClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public Value name() {
    return this.name;
  }

  @Override
  public long dataSize() {
    return 0;
  }

  @Override
  public Form<Value> valueForm() {
    return Form.forValue();
  }

  @Override
  public <V2> ValueData<V2> valueForm(Form<V2> valueForm) {
    return new ValueDataView<V2>(this, valueForm);
  }

  @Override
  public <V2> ValueData<V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  @Override
  public boolean isResident() {
    return true;
  }

  @Override
  public ValueDataBinding isResident(boolean isResident) {
    return this;
  }

  @Override
  public boolean isTransient() {
    return true;
  }

  @Override
  public ValueDataBinding isTransient(boolean isTransient) {
    return this;
  }

  @Override
  public Value get() {
    return this.value;
  }

  @Override
  public Value set(Value newValue) {
    do {
      final Value oldValue = this.value;
      if (!oldValue.equals(newValue)) {
        if (VALUE.compareAndSet(this, oldValue, newValue.commit())) {
          return oldValue;
        }
      } else {
        return oldValue;
      }
    } while (true);
  }

  @Override
  public void close() {
    final StoreBinding storeBinding = this.storeBinding;
    if (storeBinding != null) {
      storeBinding.closeData(this.name);
    }
  }

  static final AtomicReferenceFieldUpdater<ValueDataModel, Value> VALUE =
      AtomicReferenceFieldUpdater.newUpdater(ValueDataModel.class, Value.class, "value");
}
