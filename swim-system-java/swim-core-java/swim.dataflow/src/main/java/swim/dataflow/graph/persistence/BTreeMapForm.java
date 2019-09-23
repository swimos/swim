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

package swim.dataflow.graph.persistence;

import java.util.Map;
import swim.collections.BTreeMap;
import swim.structure.Field;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;

/**
 * Form for {@link BTreeMap} collections.
 * @param <K> The type of the map keys.
 * @param <V> The type of the map values.
 * @param <U> The aggregation type.
 */
public class BTreeMapForm<K, V, U> extends Form<BTreeMap<K, V, U>> {

  private final Form<K> keyForm;
  private final Form<V> valForm;

  public BTreeMapForm(final Form<K> keyForm, final Form<V> valForm) {
    this.keyForm = keyForm;
    this.valForm = valForm;
  }

  @Override
  public Class<?> type() {
    return BTreeMap.class;
  }

  @Override
  public Item mold(final BTreeMap<K, V, U> map, Item item) {
    if (map != null) {
      for (final Map.Entry<K, V> entry : map.entrySet()) {
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
  public Item mold(final BTreeMap<K, V, U> map) {
    if (map != null) {
      final Record record = Record.create();
      for (final Map.Entry<K, V> entry : map.entrySet()) {
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
  public BTreeMap<K, V, U> cast(final Item item) {
    final Value value = item.toValue();
    if (value instanceof Record) {
      BTreeMap<K, V, U> map = BTreeMap.empty();
      for (final Item child : value) {
        if (child instanceof Field) {
          final K key = this.keyForm.cast(child.key());
          if (key != null) {
            final V val = this.valForm.cast(child.toValue());
            if (val != null) {
              map = map.updated(key, val);
            }
          }
        }
      }
      return map;
    }
    return null;
  }
}
