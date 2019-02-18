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
import java.util.Set;
import swim.structure.Form;
import swim.structure.Value;

public class ValueSet<T> extends ValueCollection<T> implements Set<T> {
  public ValueSet(Set<? extends Value> inner, Form<T> valueForm) {
    super(inner, valueForm);
  }

  @Override
  public Set<Value> inner() {
    return (Set<Value>) this.inner;
  }

  @Override
  public <T2> ValueSet<T2> valueForm(Form<T2> valueForm) {
    return new ValueSet<T2>((Set<Value>) this.inner, valueForm);
  }

  @Override
  public <T2> ValueSet<T2> valueClass(Class<T2> valueClass) {
    return valueForm(Form.<T2>forClass(valueClass));
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Set<?>) {
      final Set<?> that = (Set<?>) other;
      if (size() == that.size()) {
        try {
          return containsAll(that);
        } catch (ClassCastException | NullPointerException e) {
          // swallow
        }
      }
    }
    return false;
  }

  @Override
  public int hashCode() {
    final Iterator<T> these = iterator();
    int code = 0;
    while (these.hasNext()) {
      final T object = these.next();
      if (object != null) {
        code += object.hashCode();
      }
    }
    return code;
  }
}
