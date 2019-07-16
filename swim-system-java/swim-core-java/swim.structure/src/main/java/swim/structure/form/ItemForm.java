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

import swim.structure.Form;
import swim.structure.Item;

/**
 * Fall-through "transformation" between a structural {@link Item} and a nominal
 * {@code Item}.  Both {@link #mold} and {@link #cast} simply return the {@code
 * Item} argument itself.
 */
public final class ItemForm extends Form<Item> {
  final Item unit;

  public ItemForm(Item unit) {
    this.unit = unit != null ? unit.commit() : unit;
  }

  @Override
  public Item unit() {
    return this.unit;
  }

  @Override
  public Form<Item> unit(Item unit) {
    return new ItemForm(unit);
  }

  @Override
  public Class<Item> type() {
    return Item.class;
  }

  @Override
  public Item mold(Item item) {
    if (item != null) {
      return item;
    } else {
      return Item.extant();
    }
  }

  @Override
  public Item cast(Item item) {
    return item;
  }
}
