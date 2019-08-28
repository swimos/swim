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

import java.util.Iterator;
import swim.api.data.SpatialData;
import swim.db.Database;
import swim.db.Page;
import swim.db.QTree;
import swim.db.QTreeDelegate;
import swim.db.QTreeMap;
import swim.db.Store;
import swim.db.Tree;
import swim.math.Z2Form;
import swim.spatial.SpatialMap;
import swim.store.SpatialDataBinding;
import swim.store.SpatialDataContext;
import swim.store.SpatialDataView;
import swim.store.StoreBinding;
import swim.structure.Form;
import swim.structure.Value;

public class SpatialDataModel<S> implements SpatialDataBinding<S>, QTreeDelegate {
  protected final Value name;
  protected final QTreeMap<S> tree;
  protected SpatialDataContext<S> dataContext;
  protected StoreBinding storeBinding;

  public SpatialDataModel(Value name, QTreeMap<S> tree) {
    this.name = name;
    this.tree = tree;
    tree.setTreeDelegate(this);
  }

  @Override
  public SpatialDataContext<S> dataContext() {
    return this.dataContext;
  }

  @Override
  public void setDataContext(SpatialDataContext<S> dataContext) {
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

  public final QTreeMap<S> tree() {
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
  public <K2> SpatialData<K2, S, Value> keyForm(Form<K2> keyForm) {
    return new SpatialDataView<K2, S, Value>(this, keyForm, Form.forValue());
  }

  @Override
  public <K2> SpatialData<K2, S, Value> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  @Override
  public long dataSize() {
    return this.tree.treeSize();
  }

  public long leafCount() {
    return this.tree.span();
  }

  @Override
  public final Z2Form<S> shapeForm() {
    return this.tree.shapeForm();
  }

  @Override
  public Form<Value> valueForm() {
    return Form.forValue();
  }

  @Override
  public <V2> SpatialData<Value, S, V2> valueForm(Form<V2> valueForm) {
    return new SpatialDataView<Value, S, V2>(this, Form.forValue(), valueForm);
  }

  @Override
  public <V2> SpatialData<Value, S, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  @Override
  public boolean isResident() {
    return this.tree.isResident();
  }

  @Override
  public SpatialDataBinding<S> isResident(boolean isResident) {
    this.tree.isResident(isResident);
    return this;
  }

  @Override
  public boolean isTransient() {
    return this.tree.isTransient();
  }

  @Override
  public SpatialDataBinding<S> isTransient(boolean isTransient) {
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
  public boolean containsKey(Value key, S shape) {
    return this.tree.containsKey(key, shape);
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
  public Value get(Value key, S shape) {
    return this.tree.get(key, shape);
  }

  @Override
  public Value get(Object key) {
    return this.tree.get(key);
  }

  @Override
  public Value put(Value key, S shape, Value newValue) {
    return this.tree.put(key, shape, newValue);
  }

  @Override
  public Value move(Value key, S oldShape, S newShape, Value newValue) {
    return this.tree.move(key, oldShape, newShape, newValue);
  }

  @Override
  public Value remove(Value key, S shape) {
    return this.tree.remove(key, shape);
  }

  @Override
  public void clear() {
    this.tree.clear();
  }

  @Override
  public Iterator<Entry<Value, S, Value>> iterator(S shape) {
    return this.tree.iterator(shape);
  }

  @Override
  public Iterator<Entry<Value, S, Value>> iterator() {
    return this.tree.iterator();
  }

  @Override
  public Iterator<Value> keyIterator() {
    return this.tree.keyIterator();
  }

  @Override
  public Iterator<Value> valueIterator() {
    return this.tree.valueIterator();
  }

  @Override
  public SpatialMap<Value, S, Value> snapshot() {
    return this.tree.snapshot();
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
  public void qtreeDidUpdate(QTree newTree, QTree oldTree, Value key, long x, long y, Value newValue, Value oldValue) {
    final SpatialDataContext<S> dataContext = this.dataContext;
    if (dataContext != null) {
      dataContext.didUpdate(key, x, y, newValue, oldValue);
    }
  }

  @Override
  public void qtreeDidMove(QTree newTree, QTree oldTree, Value key, long newX, long newY, Value newValue, long oldX, long oldY, Value oldValue) {
    final SpatialDataContext<S> dataContext = this.dataContext;
    if (dataContext != null) {
      dataContext.didMove(key, newX, newY, newValue, oldX, oldY, oldValue);
    }
  }

  @Override
  public void qtreeDidRemove(QTree newTree, QTree oldTree, Value key, long x, long y, Value oldValue) {
    final SpatialDataContext<S> dataContext = this.dataContext;
    if (dataContext != null) {
      dataContext.didRemove(key, x, y, oldValue);
    }
  }
}
