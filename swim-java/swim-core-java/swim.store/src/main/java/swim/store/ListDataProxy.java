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
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import swim.api.data.ListData;
import swim.structure.Form;
import swim.structure.Value;
import swim.util.KeyedList;

public class ListDataProxy implements ListDataBinding, ListDataContext {
  protected final ListDataBinding dataBinding;
  protected ListDataContext dataContext;

  public ListDataProxy(ListDataBinding dataBinding) {
    this.dataBinding = dataBinding;
  }

  public final ListDataBinding dataBinding() {
    return this.dataBinding;
  }

  @Override
  public final ListDataContext dataContext() {
    return this.dataContext;
  }

  @Override
  public void setDataContext(ListDataContext dataContext) {
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
  public boolean isResident() {
    return this.dataBinding.isResident();
  }

  @Override
  public Form<Value> valueForm() {
    return Form.forValue();
  }

  @Override
  public <V> ListData<V> valueForm(Form<V> valueForm) {
    return new ListDataView<V>(this, valueForm);
  }

  @Override
  public <V> ListData<V> valueClass(Class<V> valueClass) {
    return valueForm(Form.<V>forClass(valueClass));
  }

  @Override
  public ListDataBinding isResident(boolean isResident) {
    this.dataBinding.isResident(isResident);
    return this;
  }

  @Override
  public boolean isTransient() {
    return this.dataBinding.isTransient();
  }

  @Override
  public ListDataBinding isTransient(boolean isTransient) {
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
  public boolean contains(Object value) {
    return this.dataBinding.contains(value);
  }

  @Override
  public boolean containsAll(Collection<?> values) {
    return this.dataBinding.containsAll(values);
  }

  @Override
  public int indexOf(Object value) {
    return this.dataBinding.indexOf(value);
  }

  @Override
  public int lastIndexOf(Object value) {
    return this.dataBinding.lastIndexOf(value);
  }

  @Override
  public Value get(int index) {
    return this.dataBinding.get(index);
  }

  @Override
  public Value get(int index, Object key) {
    return this.dataBinding.get(index, key);
  }

  @Override
  public Map.Entry<Object, Value> getEntry(int index) {
    return this.dataBinding.getEntry(index);
  }

  @Override
  public Map.Entry<Object, Value> getEntry(int index, Object key) {
    return this.dataBinding.getEntry(index, key);
  }

  @Override
  public Value set(int index, Value value) {
    return this.dataBinding.set(index, value);
  }

  @Override
  public Value set(int index, Value value, Object key) {
    return this.dataBinding.set(index, value, key);
  }

  @Override
  public boolean add(Value value) {
    return this.dataBinding.add(value);
  }

  @Override
  public boolean add(Value value, Object key) {
    return this.dataBinding.add(value, key);
  }

  @Override
  public boolean addAll(Collection<? extends Value> values) {
    return this.dataBinding.addAll(values);
  }

  @Override
  public void add(int index, Value value) {
    this.dataBinding.add(index, value);
  }

  @Override
  public void add(int index, Value value, Object key) {
    this.dataBinding.add(index, value, key);
  }

  @Override
  public boolean addAll(int index, Collection<? extends Value> values) {
    return this.dataBinding.addAll(index, values);
  }

  @Override
  public Value remove(int index) {
    return this.dataBinding.remove(index);
  }

  @Override
  public Value remove(int index, Object key) {
    return this.dataBinding.remove(index, key);
  }

  @Override
  public boolean remove(Object value) {
    return this.dataBinding.remove(value);
  }

  @Override
  public boolean removeAll(Collection<?> values) {
    return this.dataBinding.removeAll(values);
  }

  @Override
  public boolean retainAll(Collection<?> values) {
    return this.dataBinding.retainAll(values);
  }

  @Override
  public void move(int fromIndex, int toIndex) {
    this.dataBinding.move(fromIndex, toIndex);
  }

  @Override
  public void move(int fromIndex, int toIndex, Object key) {
    this.dataBinding.move(fromIndex, toIndex, key);
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
  public Iterator<Value> iterator() {
    return this.dataBinding.iterator();
  }

  @Override
  public ListIterator<Value> listIterator() {
    return this.dataBinding.listIterator();
  }

  @Override
  public ListIterator<Value> listIterator(int index) {
    return this.dataBinding.listIterator(index);
  }

  @Override
  public ListIterator<Object> keyIterator() {
    return this.dataBinding.keyIterator();
  }

  @Override
  public ListIterator<Map.Entry<Object, Value>> entryIterator() {
    return this.dataBinding.entryIterator();
  }

  @Override
  public List<Value> subList(int fromIndex, int toIndex) {
    return this.dataBinding.subList(fromIndex, toIndex);
  }

  @Override
  public KeyedList<Value> snapshot() {
    return this.dataBinding.snapshot();
  }

  @Override
  public Object[] toArray() {
    return this.dataBinding.toArray();
  }

  @Override
  public <T> T[] toArray(T[] array) {
    return this.dataBinding.toArray(array);
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
  public void didUpdate(long index, Value newValue, Value oldValue) {
    this.dataContext.didUpdate(index, newValue, oldValue);
  }

  @Override
  public void didInsert(long index, Value newValue) {
    this.dataContext.didInsert(index, newValue);
  }

  @Override
  public void didRemove(long index, Value oldValue) {
    this.dataContext.didRemove(index, oldValue);
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
