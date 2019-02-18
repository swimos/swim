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
import swim.structure.Value;

/**
 * Fall-through transformation between a structurally typed {@link Item} and a
 * structurally typed {@link Value}.  {@link #mold} simply returns the
 * {@code Value} argument itself, and {@link #cast} simply invokes {@link
 * Item#toValue()} against the {@code Item} argument.
 */
public final class ValueForm extends Form<Value> {
  final Value unit;

  public ValueForm(Value unit) {
    this.unit = unit != null ? unit.commit() : unit;
  }

  @Override
  public Value unit() {
    return this.unit;
  }

  @Override
  public Form<Value> unit(Value unit) {
    return new ValueForm(unit);
  }

  @Override
  public Class<Value> type() {
    return Value.class;
  }

  @Override
  public Item mold(Value value) {
    if (value != null) {
      return value;
    } else {
      return Item.extant();
    }
  }

  @Override
  public Value cast(Item item) {
    return item.toValue();
  }
}
