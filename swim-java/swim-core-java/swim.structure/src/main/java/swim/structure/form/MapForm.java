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
import java.util.Map;
import swim.structure.Field;
import swim.structure.Form;
import swim.structure.FormException;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;

/**
 * For some {@link Map Map&lt;K,V&gt;}, a transformation between a structurally
 * typed {@code Item} and an instance of that {@code Map}.
 */
public final class MapForm<K, V> extends Form<Map<K, V>> {
  final Class<?> type;
  final Form<K> keyForm;
  final Form<V> valForm;
  final Constructor<Map<K, V>> constructor;

  @SuppressWarnings("unchecked")
  public MapForm(Class<?> type, Form<K> keyForm, Form<V> valForm) {
    this.type = type;
    this.keyForm = keyForm;
    this.valForm = valForm;
    try {
      this.constructor = (Constructor<Map<K, V>>) type.getConstructor();
    } catch (NoSuchMethodException cause) {
      throw new FormException(cause);
    }
  }

  @Override
  public Map<K, V> unit() {
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
  public Item mold(Map<K, V> map, Item item) {
    if (map != null) {
      for (Map.Entry<K, V> entry : map.entrySet()) {
        final Value key = this.keyForm.mold(entry.getKey()).toValue();
        final Value val = this.valForm.mold(entry.getValue()).toValue();
        item = item.updatedSlot(key, val);
      }
      return item;
    } else {
      return Item.extant();
    }
  }

  @Override
  public Item mold(Map<K, V> map) {
    if (map != null) {
      final Record record = Record.create();
      for (Map.Entry<K, V> entry : map.entrySet()) {
        final Value key = this.keyForm.mold(entry.getKey()).toValue();
        final Value val = this.valForm.mold(entry.getValue()).toValue();
        record.slot(key, val);
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public Map<K, V> cast(Item item, Map<K, V> map) {
    final Value value = item.toValue();
    for (Item child : value) {
      if (child instanceof Field) {
        final K key = this.keyForm.cast(child.key());
        if (key != null) {
          final V val = this.valForm.cast(child.toValue());
          if (val != null) {
            map.put(key, val);
          }
        }
      }
    }
    return map;
  }

  @Override
  public Map<K, V> cast(Item item) {
    final Value value = item.toValue();
    final int n = value.length();
    if (value instanceof Record) {
      final Map<K, V> map;
      try {
        map = this.constructor.newInstance();
      } catch (ReflectiveOperationException cause) {
        throw new FormException(cause);
      }
      for (Item child : value) {
        if (child instanceof Field) {
          final K key = this.keyForm.cast(child.key());
          if (key != null) {
            final V val = this.valForm.cast(child.toValue());
            if (val != null) {
              map.put(key, val);
            }
          }
        }
      }
      return map;
    }
    return null;
  }
}
