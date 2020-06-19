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
  private readonly _defaultUnits: LengthUnits | undefined;
  private readonly _node: Node | null;
  private readonly _unit: Length | undefined;

  constructor(defaultUnits?: LengthUnits, node: Node | null = null, unit?: Length) {
    super();
    this._defaultUnits = defaultUnits;
    this._node = node;
    this._unit = unit;
  }

  unit(): Length | undefined;
  unit(unit: Length | undefined): Form<Length, AnyLength>;
  unit(unit?: Length | undefined): Length | undefined | Form<Length, AnyLength> {
    if (arguments.length === 0) {
      return this._unit !== void 0 ? this._unit : Length.zero(this._defaultUnits, this._node);
    } else {
      return new LengthForm(this._defaultUnits, this._node, unit);
    }
  }

  mold(length: AnyLength): Item {
    length = Length.fromAny(length, this._defaultUnits);
    return Text.from(length.toString());
  }

  cast(item: Item): Length | undefined {
    const value = item.toValue();
    let length: Length | undefined;
    try {
      length = Length.fromValue(value, this._node);
      if (length !== void 0) {
        const string = value.stringValue(void 0);
        if (string !== void 0) {
          length = Length.parse(string, this._defaultUnits, this._node);
        }
      }
    } catch (e) {
      // swallow
    }
    return length;
  }
}
Length.Form = LengthForm;
