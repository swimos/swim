// Copyright 2015-2020 Swim inc.
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

import {Item, Text, Form} from "@swim/structure";
import {AngleUnits, AnyAngle, Angle} from "./Angle";

/** @hidden */
export class AngleForm extends Form<Angle, AnyAngle> {
  private readonly _defaultUnits: AngleUnits | undefined;
  private readonly _unit: Angle | undefined;

  constructor(defaultUnits?: AngleUnits, unit?: Angle) {
    super();
    this._defaultUnits = defaultUnits;
    this._unit = unit;
  }

  unit(): Angle | undefined;
  unit(unit: Angle | undefined): Form<Angle, AnyAngle>;
  unit(unit?: Angle | undefined): Angle | undefined | Form<Angle, AnyAngle> {
    if (arguments.length === 0) {
      return this._unit !== void 0 ? this._unit : Angle.zero(this._defaultUnits);
    } else {
      return new AngleForm(this._defaultUnits, unit);
    }
  }

  mold(angle: AnyAngle): Item {
    angle = Angle.fromAny(angle, this._defaultUnits);
    return Text.from(angle.toString());
  }

  cast(item: Item): Angle | undefined {
    const value = item.toValue();
    let angle: Angle | undefined;
    try {
      angle = Angle.fromValue(value);
      if (angle === void 0) {
        const string = value.stringValue(void 0);
        if (string !== void 0) {
          angle = Angle.parse(string, this._defaultUnits);
        }
      }
    } catch (e) {
      // swallow
    }
    return angle;
  }
}
Angle.Form = AngleForm;
