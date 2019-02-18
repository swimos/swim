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

import swim.structure.Field;
import swim.structure.Form;
import swim.structure.FormException;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;

public final class SlotForm<T> extends FieldForm<T> {
  final java.lang.reflect.Field field;
  final Value key;
  final Form<?> form;

  public SlotForm(java.lang.reflect.Field field, Value key, Form<?> form) {
    this.field = field;
    this.key = key.commit();
    this.form = form;
  }

  @Override
  public java.lang.reflect.Field field() {
    return this.field;
  }

  @Override
  public Value key() {
    return this.key;
  }

  @Override
  public Class<?> type() {
    return this.field.getDeclaringClass();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Item mold(T object, Item item) {
    if (object != null) {
      try {
        final Value value = ((Form<Object>) this.form).mold(this.field.get(object)).toValue();
        if (item instanceof Field) {
          return ((Field) item).updatedValue(value);
        } else {
          return item.updatedSlot(this.key, value);
        }
      } catch (IllegalAccessException cause) {
        return Item.absent();
      }
    } else {
      return Item.extant();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Item mold(T object) {
    if (object != null) {
      try {
        final Value value = ((Form<Object>) this.form).mold(this.field.get(object)).toValue();
        return Slot.of(this.key, value);
      } catch (IllegalAccessException cause) {
        return Item.absent();
      }
    } else {
      return Item.extant();
    }
  }

  @Override
  public T cast(Item item, T object) {
    try {
      if (item instanceof Record) {
        final Value value = item.get(this.key);
        if (value.isDefined()) {
          this.field.set(object, this.form.cast(value));
        }
      } else if (item.keyEquals(this.key)) {
        this.field.set(object, this.form.cast(item.toValue()));
      }
    } catch (IllegalAccessException cause) {
      throw new FormException(cause);
    }
    return object;
  }
}
