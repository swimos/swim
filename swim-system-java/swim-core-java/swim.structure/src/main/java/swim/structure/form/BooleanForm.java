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

import swim.structure.Bool;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Value;

/**
 * Transformation between a structurally typed {@link Item} and a {@link
 * Double}.
 */
public final class BooleanForm extends Form<Boolean> {
  final Boolean unit;

  public BooleanForm(Boolean unit) {
    this.unit = unit;
  }

  @Override
  public Boolean unit() {
    return this.unit;
  }

  @Override
  public Form<Boolean> unit(Boolean unit) {
    return new BooleanForm(unit);
  }

  @Override
  public Class<Boolean> type() {
    return Boolean.class;
  }

  @Override
  public Item mold(Boolean value) {
    if (value != null) {
      return Bool.from(value.booleanValue());
    } else {
      return Item.extant();
    }
  }

  @Override
  public Boolean cast(Item item) {
    final Value value = item.target();
    try {
      return value.booleanValue();
    } catch (UnsupportedOperationException e) {
      return null;
    }
  }
}
