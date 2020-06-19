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

import {Item} from "../Item";
import {Num} from "../Num";
import {Form} from "../Form";

/** @hidden */
export class NumberForm extends Form<number> {
  /** @hidden */
  readonly _unit: number | undefined;

  constructor(unit?: number) {
    super();
    this._unit = unit;
  }

  unit(): number | undefined;
  unit(unit: number | undefined): Form<number>;
  unit(unit?: number | undefined): number | undefined | Form<number> {
    if (arguments.length === 0) {
      return this._unit;
    } else {
      return new NumberForm(unit);
    }
  }

  mold(object: number, item?: Item): Item {
    if (item === void 0) {
      return Num.from(object);
    } else {
      return item.concat(Num.from(object));
    }
  }

  cast(item: Item, object?: number): number | undefined {
    const value = item.target();
    try {
      return value.numberValue();
    } catch (error) {
      return void 0;
    }
  }
}
Form.NumberForm = NumberForm;
