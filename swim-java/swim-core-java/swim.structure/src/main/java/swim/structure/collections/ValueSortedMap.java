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
import java.util.SortedMap;
import swim.structure.Form;
import swim.structure.Value;

public class ValueSortedMap<K, V> extends ValueMap<K, V> implements SortedMap<K, V> {
  public ValueSortedMap(SortedMap<Value, Value> inner, Form<K> keyForm, Form<V> valueForm) {
    super(inner, keyForm, valueForm);
  }

  @Override
  public SortedMap<Value, Value> inner() {
    return (SortedMap<Value, Value>) this.inner;
  }

  @Override
  public <K2> ValueSortedMap<K2, V> keyForm(Form<K2> keyForm) {
    return new ValueSortedMap<K2, V>((SortedMap<Value, Value>) this.inner, keyForm, this.valueForm);
  }

  @Override
  public <K2> ValueSortedMap<K2, V> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  @Override
  public <V2> ValueSortedMap<K, V2> valueForm(Form<V2> valueForm) {
    return new ValueSortedMap<K, V2>((SortedMap<Value, Value>) this.inner, this.keyForm, valueForm);
  }

  @Override
  public <V2> ValueSortedMap<K, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  @Override
  public K firstKey() {
    final Value key = ((SortedMap<Value, Value>) this.inner).firstKey();
    final K keyObject = this.keyForm.cast(key);
    if (keyObject != null) {
      return keyObject;
    }
    return this.keyForm.unit();
  }

  @Override
  public K lastKey() {
    final Value key = ((SortedMap<Value, Value>) this.inner).lastKey();
    final K keyObject = this.keyForm.cast(key);
    if (keyObject != null) {
      return keyObject;
    }
    return this.keyForm.unit();
  }

  @SuppressWarnings("unchecked")
  @Override
  public SortedMap<K, V> headMap(K toKeyObject) {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      final Value toKey = this.keyForm.mold(toKeyObject).toValue();
      return new ValueSortedMap<K, V>(((SortedMap<Value, Value>) this.inner).headMap(toKey), this.keyForm, this.valueForm);
    } else {
      return (SortedMap<K, V>) (SortedMap<?, ?>) ((SortedMap<Value, Value>) this.inner).headMap((Value) toKeyObject);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public SortedMap<K, V> tailMap(K fromKeyObject) {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      final Value fromKey = this.keyForm.mold(fromKeyObject).toValue();
      return new ValueSortedMap<K, V>(((SortedMap<Value, Value>) this.inner).tailMap(fromKey), this.keyForm, this.valueForm);
    } else {
      return (SortedMap<K, V>) (SortedMap<?, ?>) ((SortedMap<Value, Value>) this.inner).tailMap((Value) fromKeyObject);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public SortedMap<K, V> subMap(K fromKeyObject, K toKeyObject) {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      final Value fromKey = this.keyForm.mold(fromKeyObject).toValue();
      final Value toKey = this.keyForm.mold(toKeyObject).toValue();
      return new ValueSortedMap<K, V>(((SortedMap<Value, Value>) this.inner).subMap(fromKey, toKey), this.keyForm, this.valueForm);
    } else {
      return (SortedMap<K, V>) (SortedMap<?, ?>) ((SortedMap<Value, Value>) this.inner).subMap((Value) fromKeyObject, (Value) toKeyObject);
    }
  }

  @Override
  public Comparator<? super K> comparator() {
    return null;
  }
}
