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
import {AnyValue, Value} from "../Value";
import {Form} from "../Form";

/** @hidden */
export class ValueForm extends Form<Value, AnyValue> {
  /** @hidden */
  readonly _unit: Value | undefined;

  constructor(unit?: Value) {
    super();
    this._unit = unit ? unit.commit() : unit;
  }

  unit(): Value | undefined;
  unit(unit: Value | undefined): Form<Value, AnyValue>;
  unit(unit?: Value | undefined): Value | undefined | Form<Value, AnyValue> {
    if (arguments.length === 0) {
      return this._unit;
    } else {
      return new ValueForm(unit);
    }
  }

  mold(object: AnyValue, item?: Item): Item {
    object = Value.fromAny(object);
    if (item !== void 0) {
      object = item.concat(object);
    }
    return object;
  }

  cast(item: Item, object?: Value): Value | undefined {
    return item.toValue();
  }
}
Form.ValueForm = ValueForm;
