// Copyright 2015-2023 Nstream, inc.
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
import type {ValueLike} from "../Value";
import {Value} from "../Value";
import {Form} from "./Form";

/** @internal */
export class ValueForm extends Form<Value, ValueLike> {
  constructor(unit?: Value) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly unit: Value | undefined;

  override withUnit(unit: Value | undefined): Form<Value> {
    if (unit === this.unit) {
      return this;
    }
    return new ValueForm(unit);
  }

  override mold(object: ValueLike, item?: Item): Item {
    object = Value.fromLike(object);
    if (item !== void 0) {
      object = item.concat(object);
    }
    return object;
  }

  override cast(item: Item, object?: Value): Value | undefined {
    return item.toValue();
  }
}
