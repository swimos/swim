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
import swim.structure.Form;
import swim.structure.Value;

public class ValueIterator<T> implements Iterator<T> {
  protected Iterator<Value> inner;
  protected Form<T> valueForm;

  @SuppressWarnings("unchecked")
  public ValueIterator(Iterator<? extends Value> inner, Form<T> valueForm) {
    this.inner = (Iterator<Value>) inner;
    this.valueForm = valueForm;
  }

  public Iterator<Value> inner() {
    return this.inner;
  }

  public Form<T> valueForm() {
    return this.valueForm;
  }

  public <T2> ValueIterator<T2> valueForm(Form<T2> valueForm) {
    return new ValueIterator<T2>(this.inner, valueForm);
  }

  public <T2> ValueIterator<T2> valueClass(Class<T2> valueClass) {
    return valueForm(Form.<T2>forClass(valueClass));
  }

  @Override
  public boolean hasNext() {
    return this.inner.hasNext();
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
  public void remove() {
    this.inner.remove();
  }
}
