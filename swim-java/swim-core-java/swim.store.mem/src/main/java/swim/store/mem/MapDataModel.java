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

import java.util.Collection;
import java.util.Comparator;
import java.util.Map;
import java.util.Set;
import swim.api.data.MapData;
import swim.collections.BTreeMap;
import swim.store.MapDataBinding;
import swim.store.MapDataContext;
import swim.store.MapDataView;
import swim.store.StoreBinding;
import swim.structure.Form;
import swim.structure.Value;
import swim.util.Cursor;
import swim.util.OrderedMap;
import swim.util.OrderedMapCursor;

public class MapDataModel implements MapDataBinding {
  protected final Value name;
  protected final BTreeMap<Value, Value, Value> tree;
  protected MapDataContext dataContext;
  protected StoreBinding storeBinding;

  public MapDataModel(Value name, BTreeMap<Value, Value, Value> tree) {
    this.name = name;
    this.tree = tree;
  }

  @Override
  public MapDataContext dataContext() {
    return this.dataContext;
  }

  @Override
  public void setDataContext(MapDataContext dataContext) {
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

  public final BTreeMap<Value, Value, Value> tree() {
    return this.tree;
  }

  @Override
  public final Value name() {
    return this.name;
  }

  @Override
  public Form<Value> keyForm() {
    return Form.forValue();
  }

  @Override
  public <K2> MapData<K2, Value> keyForm(Form<K2> keyForm) {
    return new MapDataView<K2, Value>(this, keyForm, Form.forValue());
  }

  @Override
  public <K2> MapData<K2, Value> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  @Override
  public Form<Value> valueForm() {
    return Form.forValue();
  }

  @Override
  public <V2> MapData<Value, V2> valueForm(Form<V2> valueForm) {
    return new MapDataView<Value, V2>(this, Form.forValue(), valueForm);
  }

  @Override
  public <V2> MapData<Value, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  @Override
  public long dataSize() {
    return 0;
  }

  @Override
  public boolean isResident() {
    return true;
  }

  @Override
  public MapDataBinding isResident(boolean isResident) {
    return this;
  }

  @Override
  public boolean isTransient() {
    return true;
  }

  @Override
  public MapDataBinding isTransient(boolean isTransient) {
    return this;
  }

  @Override
  public boolean isEmpty() {
    return this.tree.isEmpty();
  }

  @Override
  public int size() {
    return this.tree.size();
  }

  @Override
  public boolean containsKey(Object key) {
    return this.tree.containsKey(key);
  }

  @Override
  public boolean containsValue(Object value) {
    return this.tree.containsValue(value);
  }

  @Override
  public int indexOf(Object key) {
    return this.tree.indexOf(key);
  }

  @Override
  public Value get(Object key) {
    Value res = this.tree.get(key);
    if (res == null) {
      res = Value.absent();
    }
    return res;
  }

  @Override
  public Entry<Value, Value> getEntry(Object key) {
    return this.tree.getEntry(key);
  }

  @Override
  public Entry<Value, Value> getIndex(int index) {
    return this.tree.getIndex(index);
  }

  @Override
  public Entry<Value, Value> firstEntry() {
    return this.tree.firstEntry();
  }

  @Override
  public Value firstKey() {
    Value res = this.tree.firstKey();
    if (res == null) {
      res = Value.absent();
    }
    return res;
  }

  @Override
  public Value firstValue() {
    Value res = this.tree.firstValue();
    if (res == null) {
      res = Value.absent();
    }
    return res;
  }

  @Override
  public Entry<Value, Value> lastEntry() {
    return this.tree.lastEntry();
  }

  @Override
  public Value lastKey() {
    Value res = this.tree.lastKey();
    if (res == null) {
      res = Value.absent();
    }
    return res;
  }

  @Override
  public Value lastValue() {
    Value res = this.tree.lastValue();
    if (res == null) {
      res = Value.absent();
    }
    return res;
  }

  @Override
  public Entry<Value, Value> nextEntry(Value key) {
    return this.tree.nextEntry(key);
  }

  @Override
  public Value nextKey(Value key) {
    Value res = this.tree.nextKey(key);
    if (res == null) {
      res = Value.absent();
    }
    return res;
  }

  @Override
  public Value nextValue(Value key) {
    Value res = this.tree.nextValue(key);
    if (res == null) {
      res = Value.absent();
    }
    return res;
  }

  @Override
  public Entry<Value, Value> previousEntry(Value key) {
    return this.tree.previousEntry(key);
  }

  @Override
  public Value previousKey(Value key) {
    Value res = this.tree.previousKey(key);
    if (res == null) {
      res = Value.absent();
    }
    return res;
  }

  @Override
  public Value previousValue(Value key) {
    Value res = this.tree.previousValue(key);
    if (res == null) {
      res = Value.absent();
    }
    return res;
  }

  @Override
  public Value put(Value key, Value value) {
    Value res = this.tree.put(key.commit(), value.commit());
    if (res == null) {
      res = Value.absent();
    }
    return res;
  }

  @Override
  public void putAll(Map<? extends Value, ? extends Value> items) {
    for (Map.Entry<? extends Value, ? extends Value> entry : items.entrySet()) {
      entry.getKey().commit();
      entry.getValue().commit();
    }
    this.tree.putAll(items);
  }

  @Override
  public Value remove(Object key) {
    Value res = this.tree.remove(key);
    if (res == null) {
      res = Value.absent();
    }
    return res;
  }

  @Override
  public void drop(int lower) {
    this.tree.drop(lower);
  }

  @Override
  public void take(int upper) {
    this.tree.take(upper);
  }

  @Override
  public void clear() {
    this.tree.clear();
  }

  @Override
  public OrderedMap<Value, Value> headMap(Value toKey) {
    return this.tree.headMap(toKey);
  }

  @Override
  public OrderedMap<Value, Value> tailMap(Value fromKey) {
    return this.tree.tailMap(fromKey);
  }

  @Override
  public OrderedMap<Value, Value> subMap(Value fromKey, Value toKey) {
    return this.tree.subMap(fromKey, toKey);
  }

  @Override
  public Set<Entry<Value, Value>> entrySet() {
    return this.tree.entrySet();
  }

  @Override
  public Set<Value> keySet() {
    return this.tree.keySet();
  }

  @Override
  public Collection<Value> values() {
    return this.tree.values();
  }

  @Override
  public OrderedMapCursor<Value, Value> iterator() {
    return this.tree.iterator();
  }

  @Override
  public Cursor<Value> keyIterator() {
    return this.tree.keyIterator();
  }

  @Override
  public Cursor<Value> valueIterator() {
    return this.tree.valueIterator();
  }

  @Override
  public OrderedMap<Value, Value> snapshot() {
    return this.tree.snapshot();
  }

  @Override
  public Comparator<? super Value> comparator() {
    return this.tree.comparator();
  }

  @Override
  public void close() {
    final StoreBinding storeBinding = this.storeBinding;
    if (storeBinding != null) {
      storeBinding.closeData(this.name);
    }
  }
}
