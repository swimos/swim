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

public class ValueCursor<T> implements Cursor<T> {
  protected Cursor<Value> inner;
  protected Form<T> valueForm;

  @SuppressWarnings("unchecked")
  public ValueCursor(Cursor<? extends Value> inner, Form<T> valueForm) {
    this.inner = (Cursor<Value>) inner;
    this.valueForm = valueForm;
  }

  public Cursor<Value> inner() {
    return this.inner;
  }

  public Form<T> valueForm() {
    return this.valueForm;
  }

  public <T2> ValueCursor<T2> valueForm(Form<T2> valueForm) {
    return new ValueCursor<T2>(this.inner, valueForm);
  }

  public <T2> ValueCursor<T2> valueClass(Class<T2> valueClass) {
    return valueForm(Form.<T2>forClass(valueClass));
  }

  @Override
  public boolean isEmpty() {
    return this.inner.isEmpty();
  }

  @Override
  public T head() {
    final Value value = this.inner.head();
    final T object = this.valueForm.cast(value);
    if (object != null) {
      return object;
    }
    return this.valueForm.unit();
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
  public T next() {
    final Value value = this.inner.next();
    final T object = this.valueForm.cast(value);
    if (object != null) {
      return object;
    }
    return this.valueForm.unit();
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
  public T previous() {
    final Value value = this.inner.previous();
    final T object = this.valueForm.cast(value);
    if (object != null) {
      return object;
    }
    return this.valueForm.unit();
  }

  @Override
  public void set(T newObject) {
    final Value newValue = this.valueForm.mold(newObject).toValue();
    this.inner.set(newValue);
  }

  @Override
  public void add(T newObject) {
    final Value newValue = this.valueForm.mold(newObject).toValue();
    this.inner.add(newValue);
  }

  @Override
  public void remove() {
    this.inner.remove();
  }

  public void load() throws InterruptedException {
    this.inner.load();
  }
}
