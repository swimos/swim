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

import type {Item} from "../Item";
import {Bool} from "../Bool";
import {Form} from "./Form";

/** @hidden */
export class BooleanForm extends Form<boolean> {
  constructor(unit?: boolean) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
    });
  }

  override readonly unit!: boolean | undefined;

  override withUnit(unit: boolean | undefined): Form<boolean> {
    if (unit !== this.unit) {
      return new BooleanForm(unit);
    } else {
      return this;
    }
  }

  override mold(object: boolean, item?: Item): Item {
    if (item === void 0) {
      return Bool.from(object);
    } else {
      return item.concat(Bool.from(object));
    }
  }

  override cast(item: Item, object?: boolean): boolean | undefined {
    const value = item.target;
    try {
      return value.booleanValue();
    } catch (error) {
      return void 0;
    }
  }
}
