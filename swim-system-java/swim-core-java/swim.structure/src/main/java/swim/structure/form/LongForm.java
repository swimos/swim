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
 * Transformation between a structurally typed {@link Item} and a {@link Long}.
 */
public final class LongForm extends Form<Long> {
  final Long unit;

  public LongForm(Long unit) {
    this.unit = unit;
  }

  @Override
  public Long unit() {
    return this.unit;
  }

  @Override
  public Form<Long> unit(Long unit) {
    return new LongForm(unit);
  }

  @Override
  public Class<Long> type() {
    return Long.class;
  }

  @Override
  public Item mold(Long value) {
    if (value != null) {
      return Num.from(value.longValue());
    } else {
      return Item.extant();
    }
  }

  @Override
  public Long cast(Item item) {
    final Value value = item.target();
    try {
      return value.longValue();
    } catch (UnsupportedOperationException e) {
      return null;
    }
  }
}
