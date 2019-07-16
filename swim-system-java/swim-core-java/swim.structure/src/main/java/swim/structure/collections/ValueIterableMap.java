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
import swim.util.Cursor;
import swim.util.IterableMap;

public class ValueIterableMap<K, V> extends ValueMap<K, V> implements IterableMap<K, V> {
  public ValueIterableMap(IterableMap<? extends Value, ? extends Value> inner, Form<K> keyForm, Form<V> valueForm) {
    super(inner, keyForm, valueForm);
  }

  public IterableMap<Value, Value> inner() {
    return (IterableMap<Value, Value>) this.inner;
  }

  public <K2> ValueIterableMap<K2, V> keyForm(Form<K2> keyForm) {
    return new ValueIterableMap<K2, V>((IterableMap<Value, Value>) this.inner, keyForm, this.valueForm);
  }

  public <K2> ValueIterableMap<K2, V> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  public <V2> ValueIterableMap<K, V2> valueForm(Form<V2> valueForm) {
    return new ValueIterableMap<K, V2>((IterableMap<Value, Value>) this.inner, this.keyForm, valueForm);
  }

  public <V2> ValueIterableMap<K, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  @SuppressWarnings("unchecked")
  @Override
  public Cursor<Entry<K, V>> iterator() {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      return new ValueEntryCursor<K, V>(((IterableMap<Value, Value>) this.inner).iterator(), this.keyForm, this.valueForm);
    } else {
      return (Cursor<Entry<K, V>>) (Cursor<?>) ((IterableMap<Value, Value>) this.inner).iterator();
    }
  }

  @SuppressWarnings("unchecked")
  public Cursor<K> keyIterator() {
    if (this.keyForm != Form.forValue()) {
      return new ValueCursor<K>(((IterableMap<Value, Value>) this.inner).keyIterator(), this.keyForm);
    } else {
      return (Cursor<K>) ((IterableMap<Value, Value>) this.inner).keyIterator();
    }
  }

  @SuppressWarnings("unchecked")
  public Cursor<V> valueIterator() {
    if (this.valueForm != Form.forValue()) {
      return new ValueCursor<V>(((IterableMap<Value, Value>) this.inner).valueIterator(), this.valueForm);
    } else {
      return (Cursor<V>) ((IterableMap<Value, Value>) this.inner).valueIterator();
    }
  }
}
