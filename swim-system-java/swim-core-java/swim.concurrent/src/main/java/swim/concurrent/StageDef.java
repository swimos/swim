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
 * Marker interface for a {@link Stage} definition.
 */
public interface StageDef {
  @Kind
  static Form<StageDef> form() {
    return new StageForm(TheaterDef.standard());
  }
}

final class StageForm extends Form<StageDef> {
  final StageDef unit;

  StageForm(StageDef unit) {
    this.unit = unit;
  }

  @Override
  public StageDef unit() {
    return this.unit;
  }

  @Override
  public Form<StageDef> unit(StageDef unit) {
    return new StageForm(unit);
  }

  @Override
  public Class<StageDef> type() {
    return StageDef.class;
  }

  @Override
  public Item mold(StageDef stageDef) {
    if (stageDef instanceof TheaterDef) {
      return TheaterDef.theaterForm().mold((TheaterDef) stageDef);
    } else {
      return Item.extant();
    }
  }

  @Override
  public StageDef cast(Item item) {
    final TheaterDef theaterDef = TheaterDef.theaterForm().cast(item);
    if (theaterDef != null) {
      return theaterDef;
    }
    return null;
  }
}
