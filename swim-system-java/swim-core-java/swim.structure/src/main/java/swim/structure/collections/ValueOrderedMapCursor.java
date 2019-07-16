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

import swim.structure.Form;
import swim.structure.Value;
import swim.util.OrderedMapCursor;

public class ValueOrderedMapCursor<K, V> extends ValueEntryCursor<K, V> implements OrderedMapCursor<K, V> {
  public ValueOrderedMapCursor(OrderedMapCursor<? extends Value, ? extends Value> inner, Form<K> keyForm, Form<V> valueForm) {
    super(inner, keyForm, valueForm);
  }

  @Override
  public OrderedMapCursor<Value, Value> inner() {
    return (OrderedMapCursor<Value, Value>) this.inner;
  }

  @Override
  public <K2> ValueOrderedMapCursor<K2, V> keyForm(Form<K2> keyForm) {
    return new ValueOrderedMapCursor<K2, V>((OrderedMapCursor<Value, Value>) this.inner, keyForm, this.valueForm);
  }

  @Override
  public <K2> ValueOrderedMapCursor<K2, V> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  @Override
  public <V2> ValueOrderedMapCursor<K, V2> valueForm(Form<V2> valueForm) {
    return new ValueOrderedMapCursor<K, V2>((OrderedMapCursor<Value, Value>) this.inner, this.keyForm, valueForm);
  }

  @Override
  public <V2> ValueOrderedMapCursor<K, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  @Override
  public K nextKey() {
    final Value key = ((OrderedMapCursor<Value, Value>) this.inner).nextKey();
    final K keyObject = this.keyForm.cast(key);
    if (keyObject != null) {
      return keyObject;
    }
    return this.keyForm.unit();
  }

  @Override
  public K previousKey() {
    final Value key = ((OrderedMapCursor<Value, Value>) this.inner).previousKey();
    final K keyObject = this.keyForm.cast(key);
    if (keyObject != null) {
      return keyObject;
    }
    return this.keyForm.unit();
  }
}
