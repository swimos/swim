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
 * Transformation between a structurally typed {@link Item} and a {@link
 * Character}.
 */
public final class CharacterForm extends Form<Character> {
  final Character unit;

  public CharacterForm(Character unit) {
    this.unit = unit;
  }

  @Override
  public Character unit() {
    return this.unit;
  }

  @Override
  public Form<Character> unit(Character unit) {
    return new CharacterForm(unit);
  }

  @Override
  public Class<Character> type() {
    return Character.class;
  }

  @Override
  public Item mold(Character value) {
    if (value != null) {
      return Num.from(value.charValue());
    } else {
      return Item.extant();
    }
  }

  @Override
  public Character cast(Item item) {
    final Value value = item.target();
    try {
      return value.charValue();
    } catch (UnsupportedOperationException e) {
      return null;
    }
  }
}
