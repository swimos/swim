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
import swim.structure.Num;
import swim.structure.Value;

/**
 * Transformation between a structurally typed {@link Item} and an {@link
 * Integer}.
 */
public final class IntegerForm extends Form<Integer> {
  final Integer unit;

  public IntegerForm(Integer unit) {
    this.unit = unit;
  }

  @Override
  public Integer unit() {
    return this.unit;
  }

  @Override
  public Form<Integer> unit(Integer unit) {
    return new IntegerForm(unit);
  }

  @Override
  public Class<Integer> type() {
    return Integer.class;
  }

  @Override
  public Item mold(Integer value) {
    if (value != null) {
      return Num.from(value.intValue());
    } else {
      return Item.extant();
    }
  }

  @Override
  public Integer cast(Item item) {
    final Value value = item.target();
    try {
      return value.intValue();
    } catch (UnsupportedOperationException e) {
      return null;
    }
  }
}
