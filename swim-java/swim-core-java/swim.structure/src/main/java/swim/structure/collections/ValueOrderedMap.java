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

import java.util.Comparator;
import swim.structure.Form;
import swim.structure.Value;
import swim.util.IterableMap;
import swim.util.OrderedMap;
import swim.util.OrderedMapCursor;

public class ValueOrderedMap<K, V> extends ValueIterableMap<K, V> implements OrderedMap<K, V> {
  public ValueOrderedMap(OrderedMap<? extends Value, ? extends Value> inner, Form<K> keyForm, Form<V> valueForm) {
    super((IterableMap<? extends Value, ? extends Value>) inner, keyForm, valueForm);
  }

  @Override
  public OrderedMap<Value, Value> inner() {
    return (OrderedMap<Value, Value>) this.inner;
  }

  @Override
  public <K2> ValueOrderedMap<K2, V> keyForm(Form<K2> keyForm) {
    return new ValueOrderedMap<K2, V>((OrderedMap<Value, Value>) this.inner, keyForm, this.valueForm);
  }

  @Override
  public <K2> ValueOrderedMap<K2, V> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  @Override
  public <V2> ValueOrderedMap<K, V2> valueForm(Form<V2> valueForm) {
    return new ValueOrderedMap<K, V2>((OrderedMap<Value, Value>) this.inner, this.keyForm, valueForm);
  }

  @Override
  public <V2> ValueOrderedMap<K, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  @SuppressWarnings("unchecked")
  @Override
  public int indexOf(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      return ((OrderedMap<Value, Value>) this.inner).indexOf(key);
    }
    throw new IllegalArgumentException(keyObject.toString());
  }

  @SuppressWarnings("unchecked")
  @Override
  public Entry<K, V> getEntry(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Entry<Value, Value> entry = ((OrderedMap<Value, Value>) this.inner).getEntry(key);
      if (entry != null) {
        return new ValueEntry<K, V>(entry, this.keyForm, this.valueForm);
      }
    }
    return null;
  }

  @Override
  public Entry<K, V> getIndex(int index) {
    final Entry<Value, Value> entry = ((OrderedMap<Value, Value>) this.inner).getIndex(index);
    if (entry != null) {
      return new ValueEntry<K, V>(entry, this.keyForm, this.valueForm);
    }
    return null;
  }

  @Override
  public Entry<K, V> firstEntry() {
    final Entry<Value, Value> entry = ((OrderedMap<Value, Value>) this.inner).firstEntry();
    if (entry != null) {
      return new ValueEntry<K, V>(entry, this.keyForm, this.valueForm);
    }
    return null;
  }

  @Override
  public K firstKey() {
    final Value key = ((OrderedMap<Value, Value>) this.inner).firstKey();
    final K keyObject = this.keyForm.cast(key);
    if (keyObject != null) {
      return keyObject;
    }
    return this.keyForm.unit();
  }

  @Override
  public V firstValue() {
    final Value value = ((OrderedMap<Value, Value>) this.inner).firstValue();
    final V object = this.valueForm.cast(value);
    if (object != null) {
      return object;
    }
    return this.valueForm.unit();
  }

  @Override
  public Entry<K, V> lastEntry() {
    final Entry<Value, Value> entry = ((OrderedMap<Value, Value>) this.inner).lastEntry();
    if (entry != null) {
      return new ValueEntry<K, V>(entry, this.keyForm, this.valueForm);
    }
    return null;
  }

  @Override
  public K lastKey() {
    final Value key = ((OrderedMap<Value, Value>) this.inner).lastKey();
    final K keyObject = this.keyForm.cast(key);
    if (keyObject != null) {
      return keyObject;
    }
    return this.keyForm.unit();
  }

  @Override
  public V lastValue() {
    final Value value = ((OrderedMap<Value, Value>) this.inner).lastValue();
    final V object = this.valueForm.cast(value);
    if (object != null) {
      return object;
    }
    return this.valueForm.unit();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Entry<K, V> nextEntry(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Entry<Value, Value> entry = ((OrderedMap<Value, Value>) this.inner).nextEntry(key);
      if (entry != null) {
        return new ValueEntry<K, V>(entry, this.keyForm, this.valueForm);
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public K nextKey(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Value nextKey = ((OrderedMap<Value, Value>) this.inner).nextKey(key);
      final K nextKeyObject = this.keyForm.cast(nextKey);
      if (nextKeyObject != null) {
        return nextKeyObject;
      }
      return this.keyForm.unit();
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public V nextValue(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Value nextValue = ((OrderedMap<Value, Value>) this.inner).nextValue(key);
      final V nextObject = this.valueForm.cast(nextValue);
      if (nextObject != null) {
        return nextObject;
      }
      return this.valueForm.unit();
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Entry<K, V> previousEntry(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Entry<Value, Value> entry = ((OrderedMap<Value, Value>) this.inner).previousEntry(key);
      if (entry != null) {
        return new ValueEntry<K, V>(entry, this.keyForm, this.valueForm);
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public K previousKey(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Value previousKey = ((OrderedMap<Value, Value>) this.inner).previousKey(key);
      final K previousKeyObject = this.keyForm.cast(previousKey);
      if (previousKeyObject != null) {
        return previousKeyObject;
      }
      return this.keyForm.unit();
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public V previousValue(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Value previousValue = ((OrderedMap<Value, Value>) this.inner).previousValue(key);
      final V previousObject = this.valueForm.cast(previousValue);
      if (previousObject != null) {
        return previousObject;
      }
      return this.valueForm.unit();
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public OrderedMap<K, V> headMap(K toKeyObject) {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      final Value toKey = this.keyForm.mold(toKeyObject).toValue();
      return new ValueOrderedMap<K, V>(((OrderedMap<Value, Value>) this.inner).headMap(toKey), this.keyForm, this.valueForm);
    } else {
      return (OrderedMap<K, V>) (OrderedMap<?, ?>) ((OrderedMap<Value, Value>) this.inner).headMap((Value) toKeyObject);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public OrderedMap<K, V> tailMap(K fromKeyObject) {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      final Value fromKey = this.keyForm.mold(fromKeyObject).toValue();
      return new ValueOrderedMap<K, V>(((OrderedMap<Value, Value>) this.inner).tailMap(fromKey), this.keyForm, this.valueForm);
    } else {
      return (OrderedMap<K, V>) (OrderedMap<?, ?>) ((OrderedMap<Value, Value>) this.inner).tailMap((Value) fromKeyObject);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public OrderedMap<K, V> subMap(K fromKeyObject, K toKeyObject) {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      final Value fromKey = this.keyForm.mold(fromKeyObject).toValue();
      final Value toKey = this.keyForm.mold(toKeyObject).toValue();
      return new ValueOrderedMap<K, V>(((OrderedMap<Value, Value>) this.inner).subMap(fromKey, toKey), this.keyForm, this.valueForm);
    } else {
      return (OrderedMap<K, V>) (OrderedMap<?, ?>) ((OrderedMap<Value, Value>) this.inner).subMap((Value) fromKeyObject, (Value) toKeyObject);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public OrderedMapCursor<K, V> iterator() {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      return new ValueOrderedMapCursor<K, V>(((OrderedMap<Value, Value>) this.inner).iterator(), this.keyForm, this.valueForm);
    } else {
      return (OrderedMapCursor<K, V>) (OrderedMapCursor<?, ?>) ((OrderedMap<Value, Value>) this.inner).iterator();
    }
  }

  @Override
  public Comparator<? super K> comparator() {
    return null;
  }
}
