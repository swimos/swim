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
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import swim.api.data.ListData;
import swim.db.Database;
import swim.db.Page;
import swim.db.STree;
import swim.db.STreeDelegate;
import swim.db.STreeList;
import swim.db.Store;
import swim.db.Tree;
import swim.store.ListDataBinding;
import swim.store.ListDataContext;
import swim.store.ListDataView;
import swim.store.StoreBinding;
import swim.structure.Form;
import swim.structure.Value;
import swim.util.KeyedList;

public class ListDataModel implements ListDataBinding, STreeDelegate {
  protected final Value name;
  protected final STreeList tree;
  protected ListDataContext dataContext;
  protected StoreBinding storeBinding;

  public ListDataModel(Value name, STreeList tree) {
    this.name = name;
    this.tree = tree;
    tree.setTreeDelegate(this);
  }

  @Override
  public ListDataContext dataContext() {
    return this.dataContext;
  }

  @Override
  public void setDataContext(ListDataContext dataContext) {
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

  public final STreeList tree() {
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
  public Form<Value> valueForm() {
    return Form.forValue();
  }

  @Override
  public <V2> ListData<V2> valueForm(Form<V2> valueForm) {
    return new ListDataView<V2>(this, valueForm);
  }

  @Override
  public <V2> ListData<V2> valueClass(Class<V2> valueClass) {
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
  public ListDataModel isResident(boolean isResident) {
    this.tree.isResident(isResident);
    return this; 
  }

  @Override
  public boolean isTransient() {
    return this.tree.isTransient();
  }

  @Override
  public ListDataModel isTransient(boolean isTransient) {
    this.tree.isTransient(isTransient);
    return this;
  }

  @Override
  public int size() {
    return this.tree.size();
  }

  @Override
  public boolean isEmpty() {
    return this.tree.isEmpty();
  }

  @Override
  public boolean contains(Object value) {
    return this.tree.contains(value);
  }

  @Override
  public boolean containsAll(Collection<?> values) {
    return this.tree.containsAll(values);
  }

  @Override
  public int indexOf(Object value) {
    return this.tree.indexOf(value);
  }

  @Override
  public int lastIndexOf(Object value) {
    return this.tree.lastIndexOf(value);
  }

  @Override
  public Value get(int index) {
    return this.tree.get(index);
  }

  @Override
  public Value set(int index, Value value) {
    return this.tree.set(index, value);
  }

  @Override
  public boolean add(Value value) {
    return this.tree.add(value);
  }

  @Override
  public boolean addAll(Collection<? extends Value> values) {
    return this.tree.addAll(values);
  }

  @Override
  public void add(int index, Value value) {
    this.tree.add(index, value);
  }

  @Override
  public boolean addAll(int index, Collection<? extends Value> values) {
    return this.tree.addAll(index, values);
  }

  @Override
  public Value remove(int index) {
    return this.tree.remove(index);
  }

  @Override
  public boolean remove(Object value) {
    return this.tree.remove(value);
  }

  @Override
  public boolean removeAll(Collection<?> values) {
    return this.tree.removeAll(values);
  }

  @Override
  public boolean retainAll(Collection<?> values) {
    return this.tree.retainAll(values);
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
  public Iterator<Value> iterator() {
    return this.tree.iterator();
  }

  @Override
  public ListIterator<Value> listIterator() {
    return this.tree.listIterator();
  }

  @Override
  public ListIterator<Value> listIterator(int index) {
    return this.tree.listIterator(index);
  }

  @Override
  public List<Value> subList(int fromIndex, int toIndex) {
    return this.tree.subList(fromIndex, toIndex);
  }

  @Override
  public KeyedList<Value> snapshot() {
    return null; // TODO
  }

  @Override
  public Object[] toArray() {
    return this.tree.toArray();
  }

  @Override
  public <T> T[] toArray(T[] array) {
    return this.tree.toArray(array);
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
  public Value get(int index, Object key) {
    return this.tree.get(index, key);
  }

  @Override
  public Map.Entry<Object, Value> getEntry(int index) {
    return this.tree.getEntry(index);
  }

  @Override
  public Map.Entry<Object, Value> getEntry(int index, Object key) {
    return this.tree.getEntry(index, key);
  }

  @Override
  public Value set(int index, Value element, Object key) {
    return this.tree.set(index, element, key);
  }

  @Override
  public boolean add(Value element, Object key) {
    return this.tree.add(element, key);
  }

  @Override
  public void add(int index, Value element, Object key) {
    this.tree.add(index, element, key);
  }

  @Override
  public Value remove(int index, Object key) {
    return this.tree.remove(index, key);
  }

  @Override
  public void move(int fromIndex, int toIndex) {
    this.tree.move(fromIndex, toIndex);
  }

  @Override
  public void move(int fromIndex, int toIndex, Object key) {
    this.tree.move(fromIndex, toIndex, key);
  }

  @Override
  public ListIterator<Object> keyIterator() {
    return this.tree.keyIterator();
  }

  @Override
  public ListIterator<Map.Entry<Object, Value>> entryIterator() {
    return this.tree.entryIterator();
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
  public void streeDidUpdate(STree newTree, STree oldTree, long index, Value id, Value newValue, Value oldValue) {
    final ListDataContext dataContext = this.dataContext;
    if (dataContext != null) {
      dataContext.didUpdate(index, newValue, oldValue);
    }
  }

  @Override
  public void streeDidInsert(STree newTree, STree oldTree, long index, Value id, Value newValue) {
    final ListDataContext dataContext = this.dataContext;
    if (dataContext != null) {
      dataContext.didInsert(index, newValue);
    }
  }

  @Override
  public void streeDidRemove(STree newTree, STree oldTree, long index, Value id, Value oldValue) {
    final ListDataContext dataContext = this.dataContext;
    if (dataContext != null) {
      dataContext.didRemove(index, oldValue);
    }
  }

  @Override
  public void streeDidDrop(STree newTree, STree oldTree, long lower) {
    final ListDataContext dataContext = this.dataContext;
    if (dataContext != null) {
      dataContext.didDrop(lower);
    }
  }

  @Override
  public void streeDidTake(STree newTree, STree oldTree, long upper) {
    final ListDataContext dataContext = this.dataContext;
    if (dataContext != null) {
      dataContext.didTake(upper);
    }
  }
}
