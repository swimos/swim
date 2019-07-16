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

import java.lang.reflect.Constructor;
import java.util.Collection;
import swim.structure.Form;
import swim.structure.FormException;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;

public final class CollectionForm<T> extends Form<Collection<T>> {
  final Class<?> type;
  final Form<T> form;
  final Constructor<Collection<T>> constructor;

  @SuppressWarnings("unchecked")
  public CollectionForm(Class<?> type, Form<T> form) {
    this.type = type;
    this.form = form;
    try {
      this.constructor = (Constructor<Collection<T>>) type.getConstructor();
    } catch (NoSuchMethodException cause) {
      throw new FormException(cause);
    }
  }

  @Override
  public Collection<T> unit() {
    try {
      return this.constructor.newInstance();
    } catch (ReflectiveOperationException cause) {
      throw new FormException(cause);
    }
  }

  @Override
  public Class<?> type() {
    return this.type;
  }

  @Override
  public Item mold(Collection<T> collection, Item item) {
    if (collection != null) {
      for (T elem : collection) {
        item = item.appended(this.form.mold(elem));
      }
      return item;
    } else {
      return Item.extant();
    }
  }

  @Override
  public Item mold(Collection<T> collection) {
    if (collection != null) {
      final Record record = Record.create();
      for (T elem : collection) {
        record.add(this.form.mold(elem));
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public Collection<T> cast(Item item, Collection<T> collection) {
    final Value value = item.toValue();
    for (Item child : value) {
      final T elem = this.form.cast(child);
      if (elem != null) {
        collection.add(elem);
      }
    }
    return collection;
  }

  @Override
  public Collection<T> cast(Item item) {
    final Value value = item.toValue();
    final int n = value.length();
    if (n > 0) {
      final Collection<T> collection;
      try {
        collection = this.constructor.newInstance();
      } catch (ReflectiveOperationException cause) {
        throw new FormException(cause);
      }
      for (Item child : value) {
        final T elem = this.form.cast(child);
        if (elem != null) {
          collection.add(elem);
        }
      }
      return collection;
    } else if (value.isDefined()) {
      final T elem = this.form.cast(value);
      if (elem != null) {
        final Collection<T> collection;
        try {
          collection = this.constructor.newInstance();
        } catch (ReflectiveOperationException cause) {
          throw new FormException(cause);
        }
        collection.add(elem);
        return collection;
      }
    }
    return null;
  }
}
