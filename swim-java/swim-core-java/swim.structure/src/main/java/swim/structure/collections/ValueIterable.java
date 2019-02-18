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

public class ValueIterable<T> implements Iterable<T> {
  protected Iterable<Value> inner;
  protected Form<T> valueForm;

  @SuppressWarnings("unchecked")
  public ValueIterable(Iterable<? extends Value> inner, Form<T> valueForm) {
    this.inner = (Iterable<Value>) inner;
    this.valueForm = valueForm;
  }

  public Iterable<Value> inner() {
    return this.inner;
  }

  public Form<T> valueForm() {
    return this.valueForm;
  }

  public <T2> ValueIterable<T2> valueForm(Form<T2> valueForm) {
    return new ValueIterable<T2>(this.inner, valueForm);
  }

  public <T2> ValueIterable<T2> valueClass(Class<T2> valueClass) {
    return valueForm(Form.<T2>forClass(valueClass));
  }

  @SuppressWarnings("unchecked")
  @Override
  public Iterator<T> iterator() {
    if (this.valueForm == Form.forValue()) {
      return (Iterator<T>) this.inner.iterator();
    }
    return new ValueIterator<T>(this.inner.iterator(), this.valueForm);
  }
}
