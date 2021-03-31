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
import {LengthUnits, AnyLength, Length} from "./Length";

/** @hidden */
export class LengthForm extends Form<Length, AnyLength> {
  constructor(defaultUnits: LengthUnits | undefined, unit: Length | undefined) {
    super();
    Object.defineProperty(this, "defaultUnits", {
      value: defaultUnits,
      enumerable: true,
    });
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
    });
  }

  declare readonly defaultUnits: LengthUnits | undefined;

  // @ts-ignore
  declare readonly unit: Length | undefined;

  withUnit(unit: Length | undefined): Form<Length, AnyLength> {
    if (unit !== this.unit) {
      return new LengthForm(this.defaultUnits, unit);
    } else {
      return this;
    }
  }

  mold(length: AnyLength): Item {
    length = Length.fromAny(length, this.defaultUnits);
    return Text.from(length.toString());
  }

  cast(item: Item): Length | undefined {
    const value = item.toValue();
    let length: Length | null = null;
    try {
      length = Length.fromValue(value);
      if (length !== void 0) {
        const string = value.stringValue(void 0);
        if (string !== void 0) {
          length = Length.parse(string, this.defaultUnits);
        }
      }
    } catch (e) {
      // swallow
    }
    return length !== null ? length : void 0;
  }
}
