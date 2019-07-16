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

import swim.api.data.SpatialData;
import swim.math.Z2Form;
import swim.spatial.SpatialMap;
import swim.spatial.SpatialValueMap;
import swim.structure.Form;
import swim.structure.Value;

public class SpatialDataView<K, S, V> extends SpatialValueMap<K, S, V> implements SpatialData<K, S, V>, SpatialDataContext<S> {
  public SpatialDataView(SpatialDataBinding<S> dataBinding, Form<K> keyForm, Form<V> valueForm) {
    super(dataBinding, keyForm, valueForm);
    dataBinding.setDataContext(this);
  }

  @SuppressWarnings("unchecked")
  public SpatialDataBinding<S> dataBinding() {
    return (SpatialDataBinding<S>) this.inner;
  }

  @Override
  public Value name() {
    return ((SpatialDataBinding<?>) this.inner).name();
  }

  @SuppressWarnings("unchecked")
  public <K2> SpatialDataView<K2, S, V> keyForm(Form<K2> keyForm) {
    return new SpatialDataView<K2, S, V>((SpatialDataBinding<S>) this.inner, keyForm, this.valueForm);
  }

  public <K2> SpatialDataView<K2, S, V> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }
  @SuppressWarnings("unchecked")
  @Override
  public Z2Form<S> shapeForm() {
    return ((SpatialDataBinding<S>) this.inner).shapeForm();
  }

  @SuppressWarnings("unchecked")
  public <V2> SpatialDataView<K, S, V2> valueForm(Form<V2> valueForm) {
    return new SpatialDataView<K, S, V2>((SpatialDataBinding<S>) this.inner, this.keyForm, valueForm);
  }

  public <V2> SpatialDataView<K, S, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  @Override
  public boolean isResident() {
    return ((SpatialDataBinding<?>) this.inner).isResident();
  }

  @Override
  public SpatialDataView<K, S, V> isResident(boolean isResident) {
    ((SpatialDataBinding<?>) this.inner).isResident(isResident);
    return this;
  }

  @Override
  public boolean isTransient() {
    return ((SpatialDataBinding<?>) this.inner).isTransient();
  }

  @Override
  public SpatialDataView<K, S, V> isTransient(boolean isTransient) {
    ((SpatialDataBinding<?>) this.inner).isTransient(isTransient);
    return this;
  }

  @SuppressWarnings("unchecked")
  @Override
  public SpatialMap<K, S, V> snapshot() {
    return new SpatialValueMap<K, S, V>(((SpatialDataBinding<S>) this.inner).snapshot(), this.keyForm, this.valueForm);
  }

  @Override
  public void close() {
    ((SpatialDataBinding<?>) this.inner).close();
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
  public void didUpdate(Value key, long x, long y, Value newValue, Value oldValue) {
    // stub
  }

  @Override
  public void didMove(Value key, long newX, long newY, Value newValue,
                      long oldX, long oldY, Value oldValue) {
    // stub
  }

  @Override
  public void didRemove(Value key, long x, long y, Value oldValue) {
    // stub
  }

  @Override
  public void didClear() {
    // stub
  }
}
