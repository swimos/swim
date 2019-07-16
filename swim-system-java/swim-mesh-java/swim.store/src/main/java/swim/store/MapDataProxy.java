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

import java.util.Collection;
import java.util.Comparator;
import java.util.Map;
import java.util.Set;
import swim.api.data.MapData;
import swim.structure.Form;
import swim.structure.Value;
import swim.util.Cursor;
import swim.util.OrderedMap;
import swim.util.OrderedMapCursor;

public class MapDataProxy implements MapDataBinding, MapDataContext {
  protected final MapDataBinding dataBinding;
  protected MapDataContext dataContext;

  public MapDataProxy(MapDataBinding dataBinding) {
    this.dataBinding = dataBinding;
  }

  public final MapDataBinding dataBinding() {
    return this.dataBinding;
  }

  @Override
  public final MapDataContext dataContext() {
    return this.dataContext;
  }

  @Override
  public void setDataContext(MapDataContext dataContext) {
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
  public <K> MapData<K, Value> keyForm(Form<K> keyForm) {
    return new MapDataView<K, Value>(this, keyForm, Form.forValue());
  }

  @Override
  public <K> MapData<K, Value> keyClass(Class<K> keyClass) {
    return keyForm(Form.<K>forClass(keyClass));
  }

  @Override
  public Form<Value> valueForm() {
    return Form.forValue();
  }

  @Override
  public <V> MapData<Value, V> valueForm(Form<V> valueForm) {
    return new MapDataView<Value, V>(this, Form.forValue(), valueForm);
  }

  @Override
  public <V> MapData<Value, V> valueClass(Class<V> valueClass) {
    return valueForm(Form.<V>forClass(valueClass));
  }

  @Override
  public boolean isResident() {
    return this.dataBinding.isResident();
  }

  @Override
  public MapDataBinding isResident(boolean isResident) {
    this.dataBinding.isResident(isResident);
    return this;
  }

  @Override
  public boolean isTransient() {
    return this.dataBinding.isTransient();
  }

  @Override
  public MapDataBinding isTransient(boolean isTransient) {
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
  public boolean containsKey(Object key) {
    return this.dataBinding.containsKey(key);
  }

  @Override
  public boolean containsValue(Object value) {
    return this.dataBinding.containsValue(value);
  }

  @Override
  public int indexOf(Object key) {
    return this.dataBinding.indexOf(key);
  }

  @Override
  public Value get(Object key) {
    return this.dataBinding.get(key);
  }

  @Override
  public Entry<Value, Value> getEntry(Object key) {
    return this.dataBinding.getEntry(key);
  }

  @Override
  public Entry<Value, Value> getIndex(int index) {
    return this.dataBinding.getIndex(index);
  }

  @Override
  public Entry<Value, Value> firstEntry() {
    return this.dataBinding.firstEntry();
  }

  @Override
  public Value firstKey() {
    return this.dataBinding.firstKey();
  }

  @Override
  public Value firstValue() {
    return this.dataBinding.firstValue();
  }

  @Override
  public Entry<Value, Value> lastEntry() {
    return this.dataBinding.lastEntry();
  }

  @Override
  public Value lastKey() {
    return this.dataBinding.lastKey();
  }

  @Override
  public Value lastValue() {
    return this.dataBinding.lastValue();
  }

  @Override
  public Entry<Value, Value> nextEntry(Value key) {
    return this.dataBinding.nextEntry(key);
  }

  @Override
  public Value nextKey(Value key) {
    return this.dataBinding.nextKey(key);
  }

  @Override
  public Value nextValue(Value key) {
    return this.dataBinding.nextValue(key);
  }

  @Override
  public Entry<Value, Value> previousEntry(Value key) {
    return this.dataBinding.previousEntry(key);
  }

  @Override
  public Value previousKey(Value key) {
    return this.dataBinding.previousKey(key);
  }

  @Override
  public Value previousValue(Value key) {
    return this.dataBinding.previousValue(key);
  }

  @Override
  public Value put(Value key, Value value) {
    return this.dataBinding.put(key, value);
  }

  @Override
  public void putAll(Map<? extends Value, ? extends Value> items) {
    this.dataBinding.putAll(items);
  }

  @Override
  public Value remove(Object key) {
    return this.dataBinding.remove(key);
  }

  @Override
  public void drop(int lower) {
    this.dataBinding.drop(lower);
  }

  @Override
  public void take(int upper) {
    this.dataBinding.take(upper);
  }

  @Override
  public void clear() {
    this.dataBinding.clear();
  }

  @Override
  public OrderedMap<Value, Value> headMap(Value toKey) {
    return this.dataBinding.headMap(toKey);
  }

  @Override
  public OrderedMap<Value, Value> tailMap(Value fromKey) {
    return this.dataBinding.tailMap(fromKey);
  }

  @Override
  public OrderedMap<Value, Value> subMap(Value fromKey, Value toKey) {
    return this.dataBinding.subMap(fromKey, toKey);
  }

  @Override
  public Set<Entry<Value, Value>> entrySet() {
    return this.dataBinding.entrySet();
  }

  @Override
  public Set<Value> keySet() {
    return this.dataBinding.keySet();
  }

  @Override
  public Collection<Value> values() {
    return this.dataBinding.values();
  }

  @Override
  public OrderedMapCursor<Value, Value> iterator() {
    return this.dataBinding.iterator();
  }

  @Override
  public Cursor<Value> keyIterator() {
    return this.dataBinding.keyIterator();
  }

  @Override
  public Cursor<Value> valueIterator() {
    return this.dataBinding.valueIterator();
  }

  @Override
  public OrderedMap<Value, Value> snapshot() {
    return this.dataBinding.snapshot();
  }

  @Override
  public Comparator<? super Value> comparator() {
    return this.dataBinding.comparator();
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
  public void didUpdate(Value key, Value newValue, Value oldValue) {
    this.dataContext.didUpdate(key, newValue, oldValue);
  }

  @Override
  public void didRemove(Value key, Value oldValue) {
    this.dataContext.didRemove(key, oldValue);
  }

  @Override
  public void didDrop(long lower) {
    this.dataContext.didDrop(lower);
  }

  @Override
  public void didTake(long upper) {
    this.dataContext.didTake(upper);
  }

  @Override
  public void didClear() {
    this.dataContext.didClear();
  }
}
