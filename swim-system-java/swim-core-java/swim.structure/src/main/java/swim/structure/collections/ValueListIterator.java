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

import java.util.ListIterator;
import swim.structure.Form;
import swim.structure.Value;

public class ValueListIterator<T> extends ValueIterator<T> implements ListIterator<T> {
  public ValueListIterator(ListIterator<? extends Value> inner, Form<T> valueForm) {
    super(inner, valueForm);
  }

  @Override
  public <T2> ValueListIterator<T2> valueForm(Form<T2> valueForm) {
    return new ValueListIterator<T2>((ListIterator<Value>) this.inner, valueForm);
  }

  @Override
  public <T2> ValueListIterator<T2> valueClass(Class<T2> valueClass) {
    return valueForm(Form.<T2>forClass(valueClass));
  }

  @Override
  public ListIterator<Value> inner() {
    return (ListIterator<Value>) this.inner;
  }

  @Override
  public int nextIndex() {
    return ((ListIterator<Value>) this.inner).nextIndex();
  }

  @Override
  public boolean hasPrevious() {
    return ((ListIterator<Value>) this.inner).hasPrevious();
  }

  @Override
  public int previousIndex() {
    return ((ListIterator<Value>) this.inner).previousIndex();
  }

  @Override
  public T previous() {
    final Value value = ((ListIterator<Value>) this.inner).previous();
    final T object = this.valueForm.cast(value);
    if (object != null) {
      return object;
    }
    return this.valueForm.unit();
  }

  @Override
  public void add(T newObject) {
    final Value newValue = this.valueForm.mold(newObject).toValue();
    ((ListIterator<Value>) this.inner).add(newValue);
  }

  @Override
  public void set(T newObject) {
    final Value newValue = this.valueForm.mold(newObject).toValue();
    ((ListIterator<Value>) this.inner).set(newValue);
  }
}
