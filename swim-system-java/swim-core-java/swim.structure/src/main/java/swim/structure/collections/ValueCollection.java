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

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.Iterator;
import swim.structure.Form;
import swim.structure.Record;
import swim.structure.Value;

public class ValueCollection<T> extends ValueIterable<T> implements Collection<T> {
  public ValueCollection(Collection<? extends Value> inner, Form<T> valueForm) {
    super(inner, valueForm);
  }

  public Collection<Value> inner() {
    return (Collection<Value>) this.inner;
  }

  @Override
  public <T2> ValueCollection<T2> valueForm(Form<T2> valueForm) {
    return new ValueCollection<T2>((Collection<Value>) this.inner, valueForm);
  }

  @Override
  public <T2> ValueCollection<T2> valueClass(Class<T2> valueClass) {
    return valueForm(Form.<T2>forClass(valueClass));
  }

  @Override
  public boolean isEmpty() {
    return ((Collection<Value>) this.inner).isEmpty();
  }

  @Override
  public int size() {
    return ((Collection<Value>) this.inner).size();
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean contains(Object object) {
    final Class<?> valueType = this.valueForm.type();
    if (valueType == null || valueType.isInstance(object)) {
      final Value value = this.valueForm.mold((T) object).toValue();
      return ((Collection<Value>) this.inner).contains(value);
    }
    return false;
  }

  @Override
  public boolean containsAll(Collection<?> objects) {
    final Iterator<?> those = objects.iterator();
    while (those.hasNext()) {
      if (!contains(those.next())) {
        return false;
      }
    }
    return true;
  }

  @Override
  public boolean add(T newObject) {
    final Value newValue = this.valueForm.mold(newObject).toValue();
    return ((Collection<Value>) this.inner).add(newValue);
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean addAll(Collection<? extends T> newObjects) {
    if (this.valueForm != Form.forValue()) {
      final Iterator<?> those = newObjects.iterator();
      final Class<?> valueType = this.valueForm.type();
      final Record values = Record.create(newObjects.size());
      while (those.hasNext()) {
        final Object newObject = those.next();
        if (valueType == null || valueType.isInstance(newObject)) {
          final Value newValue = this.valueForm.mold((T) newObject).toValue();
          values.add(newValue);
        }
      }
      return ((Collection<Value>) this.inner).addAll((Collection<Value>) (Collection<?>) values);
    } else {
      return ((Collection<Value>) this.inner).addAll((Collection<? extends Value>) newObjects);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean remove(Object object) {
    final Class<?> valueType = this.valueForm.type();
    if (valueType == null || valueType.isInstance(object)) {
      final Value value = this.valueForm.mold((T) object).toValue();
      return ((Collection<Value>) this.inner).remove(value);
    }
    return false;
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean removeAll(Collection<?> objects) {
    if (this.valueForm != Form.forValue()) {
      final Class<?> valueType = this.valueForm.type();
      final Iterator<?> those = objects.iterator();
      boolean modified = false;
      while (those.hasNext()) {
        final Object object = those.next();
        if (valueType == null || valueType.isInstance(object)) {
          final Value value = this.valueForm.mold((T) object).toValue();
          if (((Collection<Value>) this.inner).remove(value)) {
            modified = true;
          }
        }
      }
      return modified;
    } else {
      return ((Collection<Value>) this.inner).removeAll((Collection<Value>) objects);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean retainAll(Collection<?> objects) {
    if (this.valueForm != Form.forValue()) {
      final Iterator<?> those = objects.iterator();
      final Class<?> valueType = this.valueForm.type();
      final Record values = Record.create(objects.size());
      while (those.hasNext()) {
        final Object object = those.next();
        if (valueType == null || valueType.isInstance(object)) {
          final Value value = this.valueForm.mold((T) object).toValue();
          values.add(value);
        }
      }
      return ((Collection<Value>) this.inner).retainAll(values);
    } else {
      return ((Collection<Value>) this.inner).retainAll((Collection<Value>) objects);
    }
  }

  @Override
  public void clear() {
    ((Collection<Value>) this.inner).clear();
  }

  @Override
  public Object[] toArray() {
    final Iterator<Value> these = ((Collection<Value>) this.inner).iterator();
    int i = 0;
    int n = ((Collection<Value>) this.inner).size();
    Object[] array = new Object[n];
    while (these.hasNext()) {
      final Value value = these.next();
      T object = this.valueForm.cast(value);
      if (object == null) {
        object = this.valueForm.unit();
      }
      if (i == n) {
        n = n + (n >> 1) + 1;
        if (n < 0) {
          n = Integer.MAX_VALUE;
        }
        final Object[] newArray = new Object[n];
        System.arraycopy(array, 0, newArray, 0, i);
        array = newArray;
      }
      array[i] = object;
      i += 1;
    }
    if (i < n) {
      final Object[] newArray = new Object[i];
      System.arraycopy(array, 0, newArray, 0, i);
      array = newArray;
    }
    return array;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T2> T2[] toArray(T2[] a) {
    final Iterator<Value> these = ((Collection<Value>) this.inner).iterator();
    int i = 0;
    int n = a.length;
    T2[] array = a;
    while (these.hasNext()) {
      final Value value = these.next();
      T object = this.valueForm.cast(value);
      if (object == null) {
        object = this.valueForm.unit();
      }
      if (i == n) {
        n = n + (n >> 1) + 1;
        if (n < 0) {
          n = Integer.MAX_VALUE;
        }
        final T2[] newArray = (T2[]) Array.newInstance(a.getClass().getComponentType(), n);
        System.arraycopy(array, 0, newArray, 0, i);
        array = newArray;
      }
      array[i] = (T2) object;
      i += 1;
    }
    if (i < n) {
      if (array == a) {
        array[i] = null;
      } else {
        final T2[] newArray = (T2[]) Array.newInstance(a.getClass().getComponentType(), i);
        System.arraycopy(array, 0, newArray, 0, i);
        array = newArray;
      }
    }
    return array;
  }

  @Override
  public String toString() {
    final Iterator<T> these = iterator();
    if (!these.hasNext()) {
      return "[]";
    }
    final StringBuilder sb = new StringBuilder();
    sb.append('[');
    do {
      sb.append(these.next());
      if (these.hasNext()) {
        sb.append(", ");
      } else {
        break;
      }
    } while (true);
    return sb.append(']').toString();
  }
}
