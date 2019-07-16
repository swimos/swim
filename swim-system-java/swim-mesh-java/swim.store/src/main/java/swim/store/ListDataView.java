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

import swim.api.data.ListData;
import swim.structure.Form;
import swim.structure.Value;
import swim.structure.collections.ValueKeyedList;
import swim.util.KeyedList;

public class ListDataView<V> extends ValueKeyedList<V> implements ListData<V>, ListDataContext {
  public ListDataView(ListDataBinding dataBinding, Form<V> valueForm) {
    super(dataBinding, valueForm);
    dataBinding.setDataContext(this);
  }

  public ListDataBinding dataBinding() {
    return (ListDataBinding) this.inner;
  }

  @Override
  public Value name() {
    return ((ListDataBinding) this.inner).name();
  }

  public <V> ListDataView<V> valueForm(Form<V> valueForm) {
    return new ListDataView<V>((ListDataBinding) this.inner, valueForm);
  }

  public <V> ListDataView<V> valueClass(Class<V> valueClass) {
    return valueForm(Form.<V>forClass(valueClass));
  }

  @Override
  public boolean isResident() {
    return ((ListDataBinding) this.inner).isResident();
  }

  @Override
  public ListDataView<V> isResident(boolean isResident) {
    ((ListDataBinding) this.inner).isResident(isResident);
    return this;
  }

  @Override
  public boolean isTransient() {
    return ((ListDataBinding) this.inner).isTransient();
  }

  @Override
  public ListDataView<V> isTransient(boolean isTransient) {
    ((ListDataBinding) this.inner).isTransient(isTransient);
    return this;
  }

  @Override
  public void drop(int lower) {
    ((ListDataBinding) this.inner).drop(lower);
  }

  @Override
  public void take(int upper) {
    ((ListDataBinding) this.inner).take(upper);
  }

  @Override
  public KeyedList<V> snapshot() {
    return new ValueKeyedList<V>(((ListDataBinding) this.inner).snapshot(), this.valueForm);
  }

  @Override
  public void close() {
    ((ListDataBinding) this.inner).close();
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
  public void didUpdate(long index, Value newValue, Value oldValue) {
    // stub
  }

  @Override
  public void didInsert(long index, Value newValue) {
    // stub
  }

  @Override
  public void didRemove(long index, Value oldValue) {
    // stub
  }

  @Override
  public void didDrop(long lower) {
    // stub
  }

  @Override
  public void didTake(long upper) {
    // stub
  }

  @Override
  public void didClear() {
    // stub
  }
}
