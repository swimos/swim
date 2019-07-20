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

package swim.concurrent;

import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;

/**
 * Marker interface for a {@link Schedule} definition.
 */
public interface ScheduleDef {
  @Kind
  static Form<ScheduleDef> form() {
    return new ScheduleForm(ClockDef.standard());
  }
}

final class ScheduleForm extends Form<ScheduleDef> {
  final ScheduleDef unit;

  ScheduleForm(ScheduleDef unit) {
    this.unit = unit;
  }

  @Override
  public ScheduleDef unit() {
    return this.unit;
  }

  @Override
  public Form<ScheduleDef> unit(ScheduleDef unit) {
    return new ScheduleForm(unit);
  }

  @Override
  public Class<ScheduleDef> type() {
    return ScheduleDef.class;
  }

  @Override
  public Item mold(ScheduleDef scheduleDef) {
    if (scheduleDef instanceof ClockDef) {
      return ClockDef.clockForm().mold((ClockDef) scheduleDef);
    } else {
      return Item.extant();
    }
  }

  @Override
  public ScheduleDef cast(Item item) {
    final ClockDef clockDef = ClockDef.clockForm().cast(item);
    if (clockDef != null) {
      return clockDef;
    }
    return null;
  }
}
