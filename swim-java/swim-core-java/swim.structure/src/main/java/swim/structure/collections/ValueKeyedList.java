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

package swim.structure.collections;

import java.util.AbstractMap;
import java.util.ListIterator;
import java.util.Map;
import swim.structure.Form;
import swim.structure.Value;
import swim.util.KeyedList;

public class ValueKeyedList<T> extends ValueList<T> implements KeyedList<T> {
  public ValueKeyedList(KeyedList<? extends Value> inner, Form<T> valueForm) {
    super(inner, valueForm);
  }

  @Override
  public KeyedList<Value> inner() {
    return (KeyedList<Value>) this.inner;
  }

  @Override
  public <T2> ValueKeyedList<T2> valueForm(Form<T2> valueForm) {
    return new ValueKeyedList<T2>((KeyedList<Value>) this.inner, valueForm);
  }

  @Override
  public <T2> ValueKeyedList<T2> valueClass(Class<T2> valueClass) {
    return valueForm(Form.<T2>forClass(valueClass));
  }

  @Override
  public T get(int index, Object key) {
    final Value value = ((KeyedList<Value>) this.inner).get(index, key);
    final T object = this.valueForm.cast(value);
    if (object != null) {
      return object;
    }
    return this.valueForm.unit();
  }

  @Override
  public Map.Entry<Object, T> getEntry(int index) {
    final Map.Entry<Object, Value> entry = ((KeyedList<Value>) this.inner).getEntry(index);
    T object = this.valueForm.cast(entry.getValue());
    if (object == null) {
      object = this.valueForm.unit();
    }
    return new AbstractMap.SimpleImmutableEntry<Object, T>(entry.getKey(), object);
  }

  @Override
  public Map.Entry<Object, T> getEntry(int index, Object key) {
    final Map.Entry<Object, Value> entry = ((KeyedList<Value>) this.inner).getEntry(index, key);
    if (entry != null) {
      T object = this.valueForm.cast(entry.getValue());
      if (object == null) {
        object = this.valueForm.unit();
      }
      return new AbstractMap.SimpleImmutableEntry<Object, T>(entry.getKey(), object);
    }
    return null;
  }

  @Override
  public T set(int index, T newObject, Object key) {
    final Value newValue = this.valueForm.mold(newObject).toValue();
    final Value oldValue = ((KeyedList<Value>) this.inner).set(index, newValue, key);
    final T oldObject = this.valueForm.cast(oldValue);
    if (oldObject != null) {
      return oldObject;
    }
    return this.valueForm.unit();
  }

  @Override
  public boolean add(T newObject, Object key) {
    final Value newValue = this.valueForm.mold(newObject).toValue();
    return ((KeyedList<Value>) this.inner).add(newValue, key);
  }

  @Override
  public void add(int index, T newObject, Object key) {
    final Value newValue = this.valueForm.mold(newObject).toValue();
    ((KeyedList<Value>) this.inner).add(index, newValue, key);
  }

  @Override
  public T remove(int index, Object key) {
    final Value value = ((KeyedList<Value>) this.inner).remove(index, key);
    final T object = this.valueForm.cast(value);
    if (object != null) {
      return object;
    }
    return this.valueForm.unit();
  }

  @Override
  public void move(int fromIndex, int toIndex) {
    ((KeyedList<Value>) this.inner).move(fromIndex, toIndex);
  }

  @Override
  public void move(int fromIndex, int toIndex, Object key) {
    ((KeyedList<Value>) this.inner).move(fromIndex, toIndex, key);
  }

  @SuppressWarnings("unchecked")
  @Override
  public ListIterator<Object> keyIterator() {
    return ((KeyedList<Value>) this.inner).keyIterator();
  }

  @SuppressWarnings("unchecked")
  @Override
  public ListIterator<Map.Entry<Object, T>> entryIterator() {
    if (this.valueForm != Form.forValue()) {
      return new ValueKeyedListEntryIterator<T>(((KeyedList<Value>) this.inner).entryIterator(), this.valueForm);
    } else {
      return (ListIterator<Map.Entry<Object, T>>) (ListIterator<?>) ((KeyedList<Value>) this.inner).entryIterator();
    }
  }
}

final class ValueKeyedListEntryIterator<T> implements ListIterator<Map.Entry<Object, T>> {
  final ListIterator<Map.Entry<Object, Value>> inner;
  final Form<T> valueForm;

  ValueKeyedListEntryIterator(ListIterator<Map.Entry<Object, Value>> inner, Form<T> valueForm) {
    this.inner = inner;
    this.valueForm = valueForm;
  }

  @Override
  public boolean hasNext() {
    return this.inner.hasNext();
  }

  @Override
  public int nextIndex() {
    return this.inner.nextIndex();
  }

  @Override
  public Map.Entry<Object, T> next() {
    final Map.Entry<Object, Value> next = this.inner.next();
    final Object nextKey = next.getKey();
    final T nextObject = this.valueForm.cast(next.getValue());
    return new AbstractMap.SimpleImmutableEntry<Object, T>(nextKey, nextObject);
  }

  @Override
  public boolean hasPrevious() {
    return this.inner.hasPrevious();
  }

  @Override
  public int previousIndex() {
    return this.inner.previousIndex();
  }

  @Override
  public Map.Entry<Object, T> previous() {
    final Map.Entry<Object, Value> previous = this.inner.previous();
    final Object previousKey = previous.getKey();
    final T previousObject = this.valueForm.cast(previous.getValue());
    return new AbstractMap.SimpleImmutableEntry<Object, T>(previousKey, previousObject);
  }

  @Override
  public void add(Map.Entry<Object, T> newEntry) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void set(Map.Entry<Object, T> newEntry) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void remove() {
    this.inner.remove();
  }
}
