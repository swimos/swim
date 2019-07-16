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
import java.util.Map;
import java.util.Set;
import swim.structure.Form;
import swim.structure.Value;

public class ValueMap<K, V> implements Map<K, V> {
  protected Map<Value, Value> inner;
  protected Form<K> keyForm;
  protected Form<V> valueForm;

  @SuppressWarnings("unchecked")
  public ValueMap(Map<? extends Value, ? extends Value> inner, Form<K> keyForm, Form<V> valueForm) {
    this.inner = (Map<Value, Value>) inner;
    this.keyForm = keyForm;
    this.valueForm = valueForm;
  }

  public Map<Value, Value> inner() {
    return this.inner;
  }

  public Form<K> keyForm() {
    return this.keyForm;
  }

  public <K2> ValueMap<K2, V> keyForm(Form<K2> keyForm) {
    return new ValueMap<K2, V>(this.inner, keyForm, this.valueForm);
  }

  public <K2> ValueMap<K2, V> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  public Form<V> valueForm() {
    return this.valueForm;
  }

  public <V2> ValueMap<K, V2> valueForm(Form<V2> valueForm) {
    return new ValueMap<K, V2>(this.inner, this.keyForm, valueForm);
  }

  public <V2> ValueMap<K, V2> valueClass(Class<V2> valueClass) {
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
  public V put(K keyObject, V newValueObject) {
    final Value key = this.keyForm.mold(keyObject).toValue();
    final Value newValue = this.valueForm.mold(newValueObject).toValue();
    final Value oldValue = this.inner.put(key, newValue);
    final V oldValueObject = this.valueForm.cast(oldValue);
    if (oldValueObject != null) {
      return oldValueObject;
    }
    return this.valueForm.unit();
  }

  @SuppressWarnings("unchecked")
  @Override
  public void putAll(Map<? extends K, ? extends V> map) {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      for (Entry<? extends K, ? extends V> entry : map.entrySet()) {
        put(entry.getKey(), entry.getValue());
      }
    } else {
      this.inner.putAll((Map<? extends Value, ? extends Value>) map);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public V remove(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Value oldValue = this.inner.remove(key);
      final V oldValueObject = this.valueForm.cast(oldValue);
      if (oldValueObject != null) {
        return oldValueObject;
      }
    }
    return this.valueForm.unit();
  }

  @Override
  public void clear() {
    this.inner.clear();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Set<Entry<K, V>> entrySet() {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      return new ValueMapEntrySet<K, V>(this.inner, this.keyForm, this.valueForm);
    } else {
      return (Set<Entry<K, V>>) (Set<?>) this.inner.entrySet();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Set<K> keySet() {
    if (this.keyForm != Form.forValue()) {
      return new ValueSet<K>(this.inner.keySet(), this.keyForm);
    } else {
      return (Set<K>) this.inner.keySet();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Collection<V> values() {
    if (this.valueForm != Form.forValue()) {
      return new ValueCollection<V>(this.inner.values(), this.valueForm);
    } else {
      return (Collection<V>) this.inner.values();
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map<?, ?>) {
      final Map<?, ?> that = (Map<?, ?>) other;
      if (size() != that.size()) {
        return false;
      }
      try {
        final Iterator<Entry<K, V>> these = entrySet().iterator();
        while (these.hasNext()) {
          final Entry<K, V> entry = these.next();
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
    final Iterator<Entry<K, V>> these = entrySet().iterator();
    int code = 0;
    while (these.hasNext()) {
      code += these.next().hashCode();
    }
    return code;
  }

  @Override
  public String toString() {
    final Iterator<Entry<K, V>> these = entrySet().iterator();
    final StringBuilder sb = new StringBuilder();
    sb.append('{');
    if (these.hasNext()) {
      sb.append(these.next());
      while (these.hasNext()) {
        sb.append(", ").append(these.next());
      }
    }
    sb.append('}');
    return sb.toString();
  }
}
