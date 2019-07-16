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

package swim.structure.form;

import java.lang.reflect.Array;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;

/**
 * For some type, a transformation between a structurally typed {@code Item} and
 * an array of elements with that type.
 */
public final class ArrayForm extends Form<Object> {
  final Class<?> type;
  final Form<Object> form;
  Object unit;

  /**
   * @param type the {@code Class} to which <i>elements</i> of the desired
   *             arrays belong
   * @param form the desired {@code Form} that transforms instances of {@code type}
   */
  @SuppressWarnings("unchecked")
  public ArrayForm(Class<?> type, Form<?> form) {
    this.type = type;
    this.form = (Form<Object>) form;
  }

  @Override
  public Object unit() {
    if (this.unit == null) {
      this.unit = Array.newInstance(this.type, 0);
    }
    return this.unit;
  }

  @Override
  public Class<?> type() {
    return unit().getClass();
  }

  @Override
  public Item mold(Object array, Item item) {
    if (array != null) {
      final int n = Array.getLength(array);
      for (int i = 0; i < n; i += 1) {
        item = item.appended(this.form.mold(Array.get(array, i)));
      }
      return item;
    } else {
      return Item.extant();
    }
  }

  @Override
  public Item mold(Object array) {
    if (array != null) {
      final int n = Array.getLength(array);
      final Record record = Record.create(n);
      for (int i = 0; i < n; i += 1) {
        record.add(this.form.mold(Array.get(array, i)));
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public Object cast(Item item) {
    final Value value = item.toValue();
    final int n = value.length();
    if (n > 0) {
      final Object array = Array.newInstance(this.type, n);
      int k = 0;
      for (Item child : value) {
        final Object elem = this.form.cast(child);
        if (elem != null) {
          Array.set(array, k, elem);
          k += 1;
        }
      }
      if (k == n) {
        return array;
      } else {
        final Object newArray = Array.newInstance(this.type, k);
        System.arraycopy(array, 0, newArray, 0, k);
        return newArray;
      }
    } else if (value.isDefined()) {
      final Object elem = this.form.cast(value);
      if (elem != null) {
        final Object array = Array.newInstance(this.type, 1);
        Array.set(array, 0, elem);
        return array;
      }
    }
    return null;
  }
}
