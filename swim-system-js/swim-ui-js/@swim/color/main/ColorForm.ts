// Copyright 2015-2020 SWIM.AI inc.
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
import {AnyColor, Color} from "./Color";

/** @hidden */
export class ColorForm extends Form<Color, AnyColor> {
  private readonly _unit: Color | undefined;

  constructor(unit?: Color) {
    super();
    this._unit = unit;
  }

  unit(): Color | undefined;
  unit(unit: Color | undefined): Form<Color, AnyColor>;
  unit(unit?: Color | undefined): Color | undefined | Form<Color, AnyColor> {
    if (arguments.length === 0) {
      return this._unit;
    } else {
      return new ColorForm(unit);
    }
  }

  mold(color: AnyColor): Item {
    color = Color.fromAny(color);
    return Text.from(color.toString());
  }

  cast(item: Item): Color | undefined {
    const value = item.toValue();
    let color: Color | undefined;
    try {
      color = Color.fromValue(value);
      if (!color) {
        const string = value.stringValue(void 0);
        if (string !== void 0) {
          color = Color.parse(string);
        }
      }
    } catch (e) {
      // swallow
    }
    return color;
  }
}
Color.Form = ColorForm;
