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

import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import swim.structure.Form;
import swim.structure.Record;
import swim.structure.Value;

public class ValueList<T> extends ValueCollection<T> implements List<T> {
  public ValueList(List<? extends Value> inner, Form<T> valueForm) {
    super(inner, valueForm);
  }

  @Override
  public List<Value> inner() {
    return (List<Value>) this.inner;
  }

  @Override
  public <T2> ValueList<T2> valueForm(Form<T2> valueForm) {
    return new ValueList<T2>((List<Value>) this.inner, valueForm);
  }

  @Override
  public <T2> ValueList<T2> valueClass(Class<T2> valueClass) {
    return valueForm(Form.<T2>forClass(valueClass));
  }

  @SuppressWarnings("unchecked")
  @Override
  public int indexOf(Object object) {
    final Class<?> valueType = this.valueForm.type();
    if (valueType == null || valueType.isInstance(object)) {
      final Value value = this.valueForm.mold((T) object).toValue();
      return ((List<Value>) this.inner).indexOf(value);
    }
    return -1;
  }

  @SuppressWarnings("unchecked")
  @Override
  public int lastIndexOf(Object object) {
    final Class<?> valueType = this.valueForm.type();
    if (valueType == null || valueType.isInstance(object)) {
      final Value value = this.valueForm.mold((T) object).toValue();
      return ((List<Value>) this.inner).lastIndexOf(value);
    }
    return -1;
  }

  @Override
  public T get(int index) {
    final Value value = ((List<Value>) this.inner).get(index);
    final T object = this.valueForm.cast(value);
    if (object != null) {
      return object;
    }
    return this.valueForm.unit();
  }

  @Override
  public T set(int index, T newObject) {
    final Value newValue = this.valueForm.mold(newObject).toValue();
    final Value oldValue = ((List<Value>) this.inner).set(index, newValue);
    final T oldObject = this.valueForm.cast(oldValue);
    if (oldObject != null) {
      return oldObject;
    }
    return this.valueForm.unit();
  }

  @Override
  public void add(int index, T newObject) {
    final Value newValue = this.valueForm.mold(newObject).toValue();
    ((List<Value>) this.inner).add(index, newValue);
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean addAll(int index, Collection<? extends T> newObjects) {
    final Iterator<?> those = newObjects.iterator();
    final Class<?> valueType = this.valueForm.type();
    final Record values = Record.create(newObjects.size());
    while (those.hasNext()) {
      final Object object = those.next();
      if (valueType == null || valueType.isInstance(object)) {
        final Value value = this.valueForm.mold((T) object).toValue();
        values.add(value);
      }
    }
    return ((List<Value>) this.inner).addAll(index, (Collection<Value>) (Collection<?>) values);
  }

  @Override
  public T remove(int index) {
    final Value value = ((List<Value>) this.inner).remove(index);
    final T object = this.valueForm.cast(value);
    if (object != null) {
      return object;
    }
    return this.valueForm.unit();
  }

  @SuppressWarnings("unchecked")
  @Override
  public List<T> subList(int fromIndex, int toIndex) {
    if (this.valueForm != Form.forValue()) {
      return new ValueList<T>(((List<Value>) this.inner).subList(fromIndex, toIndex), this.valueForm);
    } else {
      return (List<T>) ((List<Value>) this.inner).subList(fromIndex, toIndex);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public ListIterator<T> listIterator(int index) {
    if (this.valueForm != Form.forValue()) {
      return new ValueListIterator<T>(((List<Value>) this.inner).listIterator(index), this.valueForm);
    } else {
      return (ListIterator<T>) ((List<Value>) this.inner).listIterator();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public ListIterator<T> listIterator() {
    if (this.valueForm != Form.forValue()) {
      return new ValueListIterator<T>(((List<Value>) this.inner).listIterator(), this.valueForm);
    } else {
      return (ListIterator<T>) ((List<Value>) this.inner).listIterator();
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof List<?>) {
      final Iterator<T> these = iterator();
      final Iterator<?> those = ((List<?>) other).iterator();
      while (these.hasNext() && those.hasNext()) {
        final T x = these.next();
        final Object y = those.next();
        if (!(x == null ? y == null : x.equals(y))) {
          return false;
        }
      }
      return !(these.hasNext() || those.hasNext());
    } else {
      return false;
    }
  }

  @Override
  public int hashCode() {
    final Iterator<T> these = iterator();
    int code = 0;
    while (these.hasNext()) {
      final T object = these.next();
      code = 31 * code + (object == null ? 0 : object.hashCode());
    }
    return code;
  }
}
