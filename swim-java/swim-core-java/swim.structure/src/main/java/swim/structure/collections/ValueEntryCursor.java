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

import java.util.Map;
import swim.structure.Form;
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.Cursor;

public class ValueEntryCursor<K, V> implements Cursor<Map.Entry<K, V>> {
  final Cursor<Map.Entry<Value, Value>> inner;
  final Form<K> keyForm;
  final Form<V> valueForm;

  @SuppressWarnings("unchecked")
  public ValueEntryCursor(Cursor<? extends Map.Entry<? extends Value, ? extends Value>> inner, Form<K> keyForm, Form<V> valueForm) {
    this.inner = (Cursor<Map.Entry<Value, Value>>) inner;
    this.keyForm = keyForm;
    this.valueForm = valueForm;
  }

  public Cursor<Map.Entry<Value, Value>> inner() {
    return this.inner;
  }

  public Form<K> keyForm() {
    return this.keyForm;
  }

  public <K2> ValueEntryCursor<K2, V> keyForm(Form<K2> keyForm) {
    return new ValueEntryCursor<K2, V>(this.inner, keyForm, this.valueForm);
  }

  public <K2> ValueEntryCursor<K2, V> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  public Form<V> valueForm() {
    return this.valueForm;
  }

  public <V2> ValueEntryCursor<K, V2> valueForm(Form<V2> valueForm) {
    return new ValueEntryCursor<K, V2>(this.inner, this.keyForm, valueForm);
  }

  public <V2> ValueEntryCursor<K, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  @Override
  public boolean isEmpty() {
    return this.inner.isEmpty();
  }

  @Override
  public Map.Entry<K, V> head() {
    return new ValueEntry<K, V>(this.inner.head(), this.keyForm, this.valueForm);
  }

  @Override
  public void step() {
    this.inner.step();
  }

  @Override
  public void skip(long count) {
    this.inner.skip(count);
  }

  @Override
  public boolean hasNext() {
    return this.inner.hasNext();
  }

  @Override
  public long nextIndexLong() {
    return this.inner.nextIndexLong();
  }

  @Override
  public int nextIndex() {
    return this.inner.nextIndex();
  }

  @Override
  public Map.Entry<K, V> next() {
    return new ValueEntry<K, V>(this.inner.next(), this.keyForm, this.valueForm);
  }

  @Override
  public boolean hasPrevious() {
    return this.inner.hasPrevious();
  }

  @Override
  public long previousIndexLong() {
    return this.inner.previousIndexLong();
  }

  @Override
  public int previousIndex() {
    return this.inner.previousIndex();
  }

  @Override
  public Map.Entry<K, V> previous() {
    return new ValueEntry<K, V>(this.inner.previous(), this.keyForm, this.valueForm);
  }

  @Override
  public void set(Map.Entry<K, V> newEntry) {
    final Value newKey = this.keyForm.mold(newEntry.getKey()).toValue();
    final Value newValue = this.valueForm.mold(newEntry.getValue()).toValue();
    this.inner.set(Slot.of(newKey, newValue));
  }

  @Override
  public void add(Map.Entry<K, V> newEntry) {
    final Value newKey = this.keyForm.mold(newEntry.getKey()).toValue();
    final Value newValue = this.valueForm.mold(newEntry.getValue()).toValue();
    this.inner.add(Slot.of(newKey, newValue));
  }

  @Override
  public void remove() {
    this.inner.remove();
  }

  public void load() throws InterruptedException {
    this.inner.load();
  }
}
