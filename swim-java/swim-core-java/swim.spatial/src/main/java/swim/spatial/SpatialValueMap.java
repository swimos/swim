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

package swim.spatial;

import java.util.Iterator;
import swim.structure.Form;
import swim.structure.Value;
import swim.structure.collections.ValueIterator;

public class SpatialValueMap<K, S, V> implements SpatialMap<K, S, V> {
  protected SpatialMap<Value, S, Value> inner;
  protected Form<K> keyForm;
  protected Form<V> valueForm;

  public SpatialValueMap(SpatialMap<Value, S, Value> inner, Form<K> keyForm, Form<V> valueForm) {
    this.inner = inner;
    this.keyForm = keyForm;
    this.valueForm = valueForm;
  }

  public SpatialMap<Value, S, Value> inner() {
    return this.inner;
  }

  public Form<K> keyForm() {
    return this.keyForm;
  }

  public <K2> SpatialValueMap<K2, S, V> keyForm(Form<K2> keyForm) {
    return new SpatialValueMap<K2, S, V>(this.inner, keyForm, this.valueForm);
  }

  public <K2> SpatialValueMap<K2, S, V> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  public Form<V> valueForm() {
    return this.valueForm;
  }

  public <V2> SpatialValueMap<K, S, V2> valueForm(Form<V2> valueForm) {
    return new SpatialValueMap<K, S, V2>(this.inner, this.keyForm, valueForm);
  }

  public <V2> SpatialValueMap<K, S, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  @Override
  public boolean isEmpty() {
    return this.inner.isEmpty();
  }

  @Override
  public int size() {
    return this.inner.size();
  }

  @Override
  public boolean containsKey(K keyObject, S shape) {
    final Value key = this.keyForm.mold(keyObject).toValue();
    return this.inner.containsKey(key, shape);
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean containsKey(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      return this.inner.containsKey(key);
    }
    return false;
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean containsValue(Object valueObject) {
    final Class<?> valueType = this.valueForm.type();
    if (valueType == null || valueType.isInstance(valueObject)) {
      final Value value = this.valueForm.mold((V) valueObject).toValue();
      return this.inner.containsValue(value);
    }
    return false;
  }

  @Override
  public V get(K keyObject, S shape) {
    final Value key = this.keyForm.mold(keyObject).toValue();
    final Value value = this.inner.get(key, shape);
    final V valueObject = this.valueForm.cast(value);
    if (valueObject != null) {
      return valueObject;
    }
    return this.valueForm.unit();
  }

  @SuppressWarnings("unchecked")
  @Override
  public V get(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Value value = this.inner.get(key);
      final V valueObject = this.valueForm.cast(value);
      if (valueObject != null) {
        return valueObject;
      }
    }
    return this.valueForm.unit();
  }

  @Override
  public V put(K keyObject, S shape, V newObject) {
    final Value key = this.keyForm.mold(keyObject).toValue();
    final Value newValue = this.valueForm.mold(newObject).toValue();
    final Value oldValue = this.inner.put(key, shape, newValue);
    final V oldObject = this.valueForm.cast(oldValue);
    if (oldObject != null) {
      return oldObject;
    }
    return this.valueForm.unit();
  }

  @Override
  public V move(K keyObject, S oldShape, S newShape, V newObject) {
    final Value key = this.keyForm.mold(keyObject).toValue();
    final Value newValue = this.valueForm.mold(newObject).toValue();
    final Value oldValue = this.inner.move(key, oldShape, newShape, newValue);
    final V oldObject = this.valueForm.cast(oldValue);
    if (oldObject != null) {
      return oldObject;
    }
    return this.valueForm.unit();
  }

  @Override
  public V remove(K keyObject, S shape) {
    final Value key = this.keyForm.mold(keyObject).toValue();
    final Value oldValue = this.inner.remove(key, shape);
    final V oldObject = this.valueForm.cast(oldValue);
    if (oldObject != null) {
      return oldObject;
    }
    return this.valueForm.unit();
  }

  @Override
  public void clear() {
    this.inner.clear();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Iterator<Entry<K, S, V>> iterator(S shape) {
    if (keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      return new SpatialValueEntryIterator<K, S, V>(this.inner.iterator(shape), this.keyForm, this.valueForm);
    } else {
      return (Iterator<Entry<K, S, V>>) (Iterator<?>) this.inner.iterator(shape);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Iterator<Entry<K, S, V>> iterator() {
    if (keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      return new SpatialValueEntryIterator<K, S, V>(this.inner.iterator(), this.keyForm, this.valueForm);
    } else {
      return (Iterator<Entry<K, S, V>>) (Iterator<?>) this.inner.iterator();
    }
  }

  @SuppressWarnings("unchecked")
  public Iterator<K> keyIterator() {
    if (keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      return new ValueIterator<K>(this.inner.keyIterator(), this.keyForm);
    } else {
      return (Iterator<K>) this.inner.keyIterator();
    }
  }

  @SuppressWarnings("unchecked")
  public Iterator<V> valueIterator() {
    if (keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      return new ValueIterator<V>(this.inner.valueIterator(), this.valueForm);
    } else {
      return (Iterator<V>) this.inner.valueIterator();
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof SpatialMap<?, ?, ?>) {
      final SpatialMap<?, ?, ?> that = (SpatialMap<?, ?, ?>) other;
      if (size() != that.size()) {
        return false;
      }
      try {
        final Iterator<Entry<K, S, V>> these = iterator();
        while (these.hasNext()) {
          final Entry<K, S, V> entry = these.next();
          final K keyObject = entry.getKey();
          final V valueObject = entry.getValue();
          if (valueObject != null) {
            if (!valueObject.equals(that.get(keyObject))) {
              return false;
            }
          } else {
            if (!(that.get(keyObject) == null && that.containsKey(keyObject))) {
              return false;
            }
          }
        }
        return true;
      } catch (ClassCastException | NullPointerException e) {
        // swallow
      }
    }
    return false;
  }

  @Override
  public int hashCode() {
    final Iterator<Entry<K, S, V>> these = iterator();
    int h = 0;
    while (these.hasNext()) {
      h += these.next().hashCode();
    }
    return h;
  }

  @Override
  public String toString() {
    final Iterator<Entry<K, S, V>> these = iterator();
    if (!these.hasNext()) {
      return "{}";
    }
    final StringBuilder sb = new StringBuilder();
    sb.append('{');
    do {
      sb.append(these.next());
      if (these.hasNext()) {
        sb.append(", ");
      } else {
        break;
      }
    } while (true);
    return sb.append('}').toString();
  }
}
