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

package swim.store.db;

import java.util.Collection;
import java.util.Comparator;
import java.util.Map;
import java.util.Set;
import swim.api.data.MapData;
import swim.db.BTree;
import swim.db.BTreeDelegate;
import swim.db.BTreeMap;
import swim.db.Database;
import swim.db.Page;
import swim.db.Store;
import swim.db.Tree;
import swim.store.MapDataBinding;
import swim.store.MapDataContext;
import swim.store.MapDataView;
import swim.store.StoreBinding;
import swim.structure.Form;
import swim.structure.Value;
import swim.util.Cursor;
import swim.util.OrderedMap;
import swim.util.OrderedMapCursor;

public class MapDataModel implements MapDataBinding, BTreeDelegate {
  protected final Value name;
  protected final BTreeMap tree;
  protected MapDataContext dataContext;
  protected StoreBinding storeBinding;

  public MapDataModel(Value name, BTreeMap tree) {
    this.name = name;
    this.tree = tree;
    tree.setTreeDelegate(this);
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

  public final BTreeMap tree() {
    return this.tree;
  }

  public final Database database() {
    return this.tree.database();
  }

  public final Store store() {
    return database().store();
  }

  public final Value treeName() {
    return this.tree.name();
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
    return this.tree.treeSize();
  }

  @Override
  public boolean isResident() {
    return this.tree.isResident();
  }

  @Override
  public MapDataBinding isResident(boolean isResident) {
    this.tree.isResident(isResident);
    return this;
  }

  @Override
  public boolean isTransient() {
    return this.tree.isTransient();
  }

  @Override
  public MapDataBinding isTransient(boolean isTransient) {
    this.tree.isTransient(isTransient);
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
    return this.tree.get(key);
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
    return this.tree.firstKey();
  }

  @Override
  public Value firstValue() {
    return this.tree.firstValue();
  }

  @Override
  public Entry<Value, Value> lastEntry() {
    return this.tree.lastEntry();
  }

  @Override
  public Value lastKey() {
    return this.tree.lastKey();
  }

  @Override
  public Value lastValue() {
    return this.tree.lastValue();
  }

  @Override
  public Entry<Value, Value> nextEntry(Value key) {
    return this.tree.nextEntry(key);
  }

  @Override
  public Value nextKey(Value key) {
    return this.tree.nextKey(key);
  }

  @Override
  public Value nextValue(Value key) {
    return this.tree.nextValue(key);
  }

  @Override
  public Entry<Value, Value> previousEntry(Value key) {
    return this.tree.previousEntry(key);
  }

  @Override
  public Value previousKey(Value key) {
    return this.tree.previousKey(key);
  }

  @Override
  public Value previousValue(Value key) {
    return this.tree.previousValue(key);
  }

  @Override
  public Value put(Value key, Value value) {
    return this.tree.put(key, value);
  }

  @Override
  public void putAll(Map<? extends Value, ? extends Value> items) {
    this.tree.putAll(items);
  }

  @Override
  public Value remove(Object key) {
    return this.tree.remove(key);
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
    // TODO: close tree
  }

  @Override
  public void treeDidLoadPage(Page page) {
    // nop
  }

  @Override
  public void treeDidChange(Tree newTree, Tree oldTree) {
    // nop
  }

  @Override
  public void treeDidCommit(Tree newTree, Tree oldTree) {
    // nop
  }

  @Override
  public void treeDidClear(Tree newTree, Tree oldTree) {
    // nop
  }

  @Override
  public void btreeDidUpdate(BTree newTree, BTree oldTree, Value key, Value newValue, Value oldValue) {
    final MapDataContext dataContext = this.dataContext;
    if (dataContext != null) {
      dataContext.didUpdate(key, newValue, oldValue);
    }
  }

  @Override
  public void btreeDidRemove(BTree newTree, BTree oldTree, Value key, Value oldValue) {
    final MapDataContext dataContext = this.dataContext;
    if (dataContext != null) {
      dataContext.didRemove(key, oldValue);
    }
  }

  @Override
  public void btreeDidDrop(BTree newTree, BTree oldTree, long lower) {
    final MapDataContext dataContext = this.dataContext;
    if (dataContext != null) {
      dataContext.didDrop(lower);
    }
  }

  @Override
  public void btreeDidTake(BTree newTree, BTree oldTree, long upper) {
    final MapDataContext dataContext = this.dataContext;
    if (dataContext != null) {
      dataContext.didTake(upper);
    }
  }
}
