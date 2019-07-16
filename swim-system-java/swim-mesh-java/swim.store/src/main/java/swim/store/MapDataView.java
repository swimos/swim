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

import swim.api.data.MapData;
import swim.structure.Form;
import swim.structure.Value;
import swim.structure.collections.ValueEntry;
import swim.structure.collections.ValueOrderedMap;
import swim.util.OrderedMap;

public class MapDataView<K, V> extends ValueOrderedMap<K, V> implements MapData<K, V>, MapDataContext {
  public MapDataView(MapDataBinding dataBinding, Form<K> keyForm, Form<V> valueForm) {
    super(dataBinding, keyForm, valueForm);
    dataBinding.setDataContext(this);
  }

  public MapDataBinding dataBinding() {
    return (MapDataBinding) this.inner;
  }

  @Override
  public Value name() {
    return ((MapDataBinding) this.inner).name();
  }

  public <K2> MapDataView<K2, V> keyForm(Form<K2> keyForm) {
    return new MapDataView<K2, V>((MapDataBinding) this.inner, keyForm, this.valueForm);
  }

  public <K2> MapDataView<K2, V> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  public <V2> MapDataView<K, V2> valueForm(Form<V2> valueForm) {
    return new MapDataView<K, V2>((MapDataBinding) this.inner, this.keyForm, valueForm);
  }

  public <V2> MapDataView<K, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  @Override
  public boolean isResident() {
    return ((MapDataBinding) this.inner).isResident();
  }

  @Override
  public MapDataView<K, V> isResident(boolean isResident) {
    ((MapDataBinding) this.inner).isResident(isResident);
    return this;
  }

  @Override
  public boolean isTransient() {
    return ((MapDataBinding) this.inner).isTransient();
  }

  @Override
  public MapDataView<K, V> isTransient(boolean isTransient) {
    ((MapDataBinding) this.inner).isTransient(isTransient);
    return this;
  }

  @Override
  public Entry<K, V> getIndex(int index) {
    final Entry<Value, Value> entry = ((MapDataBinding) this.inner).getIndex(index);
    if (entry != null) {
      return new ValueEntry<K, V>(entry, this.keyForm, this.valueForm);
    } else {
      return null;
    }
  }

  @Override
  public void drop(int lower) {
    ((MapDataBinding) this.inner).drop(lower);
  }

  @Override
  public void take(int upper) {
    ((MapDataBinding) this.inner).take(upper);
  }

  @Override
  public OrderedMap<K, V> snapshot() {
    return new ValueOrderedMap<K, V>(((MapDataBinding) this.inner).snapshot(), this.keyForm, this.valueForm);
  }

  @Override
  public void close() {
    ((MapDataBinding) this.inner).close();
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
  public void didUpdate(Value key, Value newValue, Value oldValue) {
    // stub
  }

  @Override
  public void didRemove(Value key, Value oldValue) {
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
