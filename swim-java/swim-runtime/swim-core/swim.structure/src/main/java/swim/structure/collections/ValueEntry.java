// Copyright 2015-2023 Nstream, inc.
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

import java.util.Map;
import swim.structure.Form;
import swim.structure.Value;

public final class ValueEntry<K, V> implements Map.Entry<K, V> {

  final Map.Entry<Value, Value> inner;
  final Form<K> keyForm;
  final Form<V> valueForm;
  volatile K keyObject;
  volatile V valueObject;

  public ValueEntry(Map.Entry<Value, Value> inner, Form<K> keyForm, Form<V> valueForm) {
    if (inner == null) {
      throw new NullPointerException();
    }
    this.inner = inner;
    this.keyForm = keyForm;
    this.valueForm = valueForm;
  }

  @Override
  public K getKey() {
    K keyObject = this.keyObject;
    if (keyObject == null) {
      keyObject = this.keyForm.cast(this.inner.getKey());
      if (keyObject == null) {
        keyObject = this.keyForm.unit();
      }
      this.keyObject = keyObject;
    }
    return keyObject;
  }

  @Override
  public V getValue() {
    V valueObject = this.valueObject;
    if (valueObject == null) {
      valueObject = this.valueForm.cast(this.inner.getValue());
      if (valueObject == null) {
        valueObject = this.valueForm.unit();
      }
      this.valueObject = valueObject;
    }
    return valueObject;
  }

  @Override
  public V setValue(V newValueObject) {
    final Value newValue = this.valueForm.mold(newValueObject).toValue();
    final Value oldValue = this.inner.setValue(newValue);
    final V oldValueObject = this.valueForm.cast(oldValue);
    if (oldValueObject != null) {
      return oldValueObject;
    }
    return this.valueForm.unit();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map.Entry<?, ?>) {
      final Map.Entry<?, ?> that = (Map.Entry<?, ?>) other;
      final K keyObject = this.getKey();
      if (keyObject == null ? that.getKey() != null : !keyObject.equals(that.getKey())) {
        return false;
      }
      final V valueObject = this.getValue();
      if (valueObject == null ? that.getValue() != null : !valueObject.equals(that.getValue())) {
        return false;
      }
      return true;
    }
    return false;
  }

  @Override
  public int hashCode() {
    final K keyObject = this.getKey();
    final V valueObject = this.getValue();
    return (keyObject == null ? 0 : keyObject.hashCode())
         ^ (valueObject == null ? 0 : valueObject.hashCode());
  }

  @Override
  public String toString() {
    return new StringBuilder().append(this.getKey()).append('=').append(this.getValue()).toString();
  }

}
