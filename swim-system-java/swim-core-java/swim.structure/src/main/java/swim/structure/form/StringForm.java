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
import swim.structure.Text;
import swim.structure.Value;

/**
 * Transformation between a structurally typed {@link Item} and a {@link
 * String}.
 */
public final class StringForm extends Form<String> {
  final String unit;

  public StringForm(String unit) {
    this.unit = unit;
  }

  @Override
  public String unit() {
    return this.unit;
  }

  @Override
  public Form<String> unit(String unit) {
    return new StringForm(unit);
  }

  @Override
  public Class<String> type() {
    return String.class;
  }

  @Override
  public Item mold(String value) {
    if (value != null) {
      return Text.from(value);
    } else {
      return Item.extant();
    }
  }

  @Override
  public String cast(Item item) {
    final Value value = item.target();
    try {
      return value.stringValue(null);
    } catch (UnsupportedOperationException e) {
      return null;
    }
  }
}
