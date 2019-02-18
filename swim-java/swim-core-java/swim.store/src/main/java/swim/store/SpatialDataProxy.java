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

import java.util.Iterator;
import swim.api.data.SpatialData;
import swim.math.Z2Form;
import swim.spatial.SpatialMap;
import swim.structure.Form;
import swim.structure.Value;

public class SpatialDataProxy<S> implements SpatialDataBinding<S>, SpatialDataContext<S> {
  protected final SpatialDataBinding<S> dataBinding;
  protected SpatialDataContext<S> dataContext;

  public SpatialDataProxy(SpatialDataBinding<S> dataBinding) {
    this.dataBinding = dataBinding;
  }

  public final SpatialDataBinding<S> dataBinding() {
    return this.dataBinding;
  }

  @Override
  public final SpatialDataContext<S> dataContext() {
    return this.dataContext;
  }

  @Override
  public void setDataContext(SpatialDataContext<S> dataContext) {
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
  public Form<Value> keyForm() {
    return Form.forValue();
  }

  @Override
  public <K> SpatialData<K, S, Value> keyForm(Form<K> keyForm) {
    return new SpatialDataView<K, S, Value>(this, keyForm, Form.forValue());
  }

  @Override
  public <K> SpatialData<K, S, Value> keyClass(Class<K> keyClass) {
    return keyForm(Form.<K>forClass(keyClass));
  }

  @Override
  public Z2Form<S> shapeForm() {
    return this.dataBinding.shapeForm();
  }

  @Override
  public Form<Value> valueForm() {
    return Form.forValue();
  }

  @Override
  public <V> SpatialData<Value, S, V> valueForm(Form<V> valueForm) {
    return new SpatialDataView<Value, S, V>(this, Form.forValue(), valueForm);
  }

  @Override
  public <V> SpatialData<Value, S, V> valueClass(Class<V> valueClass) {
    return valueForm(Form.<V>forClass(valueClass));
  }

  @Override
  public boolean isResident() {
    return this.dataBinding.isResident();
  }

  @Override
  public SpatialDataBinding<S> isResident(boolean isResident) {
    this.dataBinding.isResident(isResident);
    return this;
  }

  @Override
  public boolean isTransient() {
    return this.dataBinding.isTransient();
  }

  @Override
  public SpatialDataBinding<S> isTransient(boolean isTransient) {
    this.dataBinding.isTransient(isTransient);
    return this;
  }

  @Override
  public boolean isEmpty() {
    return this.dataBinding.isEmpty();
  }

  @Override
  public int size() {
    return this.dataBinding.size();
  }

  @Override
  public boolean containsKey(Value key, S shape) {
    return this.dataBinding.containsKey(key, shape);
  }

  @Override
  public boolean containsKey(Object key) {
    return this.dataBinding.containsKey(key);
  }

  @Override
  public boolean containsValue(Object value) {
    return this.dataBinding.containsValue(value);
  }

  @Override
  public Value get(Value key, S shape) {
    return this.dataBinding.get(key, shape);
  }

  @Override
  public Value get(Object key) {
    return this.dataBinding.get(key);
  }

  @Override
  public Value put(Value key, S shape, Value newValue) {
    return this.dataBinding.put(key, shape, newValue);
  }

  @Override
  public Value move(Value key, S oldShape, S newShape, Value newValue) {
    return this.dataBinding.move(key, oldShape, newShape, newValue);
  }

  @Override
  public Value remove(Value key, S shape) {
    return this.dataBinding.remove(key, shape);
  }

  @Override
  public void clear() {
    this.dataBinding.clear();
  }

  @Override
  public Iterator<Entry<Value, S, Value>> iterator(S shape) {
    return this.dataBinding.iterator(shape);
  }

  @Override
  public Iterator<Entry<Value, S, Value>> iterator() {
    return this.dataBinding.iterator();
  }

  @Override
  public Iterator<Value> keyIterator() {
    return this.dataBinding.keyIterator();
  }

  @Override
  public Iterator<Value> valueIterator() {
    return this.dataBinding.valueIterator();
  }

  @Override
  public SpatialMap<Value, S, Value> snapshot() {
    return this.dataBinding.snapshot();
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
  public void didUpdate(Value key, long x, long y, Value newValue, Value oldValue) {
    this.dataContext.didUpdate(key, x, y, newValue, oldValue);
  }

  @Override
  public void didMove(Value key, long newX, long newY, Value newValue, long oldX, long oldY, Value oldValue) {
    this.dataContext.didMove(key, newX, newY, newValue, oldX, oldY, oldValue);
  }

  @Override
  public void didRemove(Value key, long x, long y, Value oldValue) {
    this.dataContext.didRemove(key, x, y, oldValue);
  }

  @Override
  public void didClear() {
    this.dataContext.didClear();
  }
}
