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

import java.util.Iterator;
import java.util.Map;
import swim.structure.Form;
import swim.structure.Value;

public final class ValueEntryIterator<K, V> implements Iterator<Map.Entry<K, V>> {
  final Iterator<Map.Entry<Value, Value>> inner;
  final Form<K> keyForm;
  final Form<V> valueForm;

  @SuppressWarnings("unchecked")
  public ValueEntryIterator(Iterator<? extends Map.Entry<? extends Value, ? extends Value>> inner, Form<K> keyForm, Form<V> valueForm) {
    this.inner = (Iterator<Map.Entry<Value, Value>>) inner;
    this.keyForm = keyForm;
    this.valueForm = valueForm;
  }

  public Iterator<Map.Entry<Value, Value>> inner() {
    return this.inner;
  }

  public Form<K> keyForm() {
    return this.keyForm;
  }

  public <K2> ValueEntryIterator<K2, V> keyForm(Form<K2> keyForm) {
    return new ValueEntryIterator<K2, V>(this.inner, keyForm, this.valueForm);
  }

  public <K2> ValueEntryIterator<K2, V> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  public Form<V> valueForm() {
    return this.valueForm;
  }

  public <V2> ValueEntryIterator<K, V2> valueForm(Form<V2> valueForm) {
    return new ValueEntryIterator<K, V2>(this.inner, this.keyForm, valueForm);
  }

  public <V2> ValueEntryIterator<K, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  @Override
  public boolean hasNext() {
    return this.inner.hasNext();
  }

  @Override
  public Map.Entry<K, V> next() {
    return new ValueEntry<K, V>(this.inner.next(), this.keyForm, this.valueForm);
  }

  @Override
  public void remove() {
    this.inner.remove();
  }
}
