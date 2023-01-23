// Copyright 2015-2023 Swim.inc
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

import type {Item} from "../Item";
import {Num} from "../Num";
import {Form} from "./Form";

/** @internal */
export class NumberForm extends Form<number> {
  constructor(unit?: number) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
    });
  }

  override readonly unit!: number | undefined;

  override withUnit(unit: number | undefined): Form<number> {
    if (unit !== this.unit) {
      return new NumberForm(unit);
    } else {
      return this;
    }
  }

  override mold(object: number, item?: Item): Item {
    if (item === void 0) {
      return Num.from(object);
    } else {
      return item.concat(Num.from(object));
    }
  }

  override cast(item: Item, object?: number): number | undefined {
    const value = item.target;
    try {
      return value.numberValue();
    } catch (error) {
      return void 0;
    }
  }
}
