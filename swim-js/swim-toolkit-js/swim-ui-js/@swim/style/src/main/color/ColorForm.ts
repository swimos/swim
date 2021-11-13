// Copyright 2015-2021 Swim Inc.
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

/** @internal */
export class ColorForm extends Form<Color, AnyColor> {
  constructor(unit: Color | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
    });
  }

  override readonly unit: Color | undefined;

  override withUnit(unit: Color | undefined): Form<Color, AnyColor> {
    if (unit !== this.unit) {
      return new ColorForm(unit);
    } else {
      return this;
    }
  }

  override mold(color: AnyColor): Item {
    color = Color.fromAny(color);
    return Text.from(color.toString());
  }

  override cast(item: Item): Color | undefined {
    const value = item.toValue();
    let color: Color | null = null;
    try {
      color = Color.fromValue(value);
      if (color === void 0) {
        const string = value.stringValue(void 0);
        if (string !== void 0) {
          color = Color.parse(string);
        }
      }
    } catch (e) {
      // swallow
    }
    return color !== null ? color : void 0;
  }
}
