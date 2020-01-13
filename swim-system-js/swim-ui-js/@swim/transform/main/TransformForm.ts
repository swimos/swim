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

import {Item, Record, Form} from "@swim/structure";
import {AnyTransform, Transform} from "./Transform";

/** @hidden */
export class TransformForm extends Form<Transform, AnyTransform> {
  private readonly _unit: Transform | undefined;

  constructor(unit?: Transform) {
    super();
    this._unit = unit;
  }

  unit(): Transform | undefined;
  unit(unit: Transform | undefined): Form<Transform, AnyTransform>;
  unit(unit?: Transform | undefined): Transform | undefined | Form<Transform, AnyTransform> {
    if (arguments.length === 0) {
      return this._unit;
    } else {
      return new TransformForm(unit);
    }
  }

  mold(transform: AnyTransform): Item {
    transform = Transform.fromAny(transform);
    return transform.toValue();
  }

  cast(item: Item): Transform | undefined {
    const value = item.toValue();
    try {
      if (value instanceof Record) {
        return Transform.fromValue(value);
      } else {
        const string = value.stringValue(void 0);
        if (string !== void 0) {
          return Transform.parse(string);
        }
      }
    } catch (e) {
      // swallow
    }
    return void 0;
  }
}
Transform.Form = TransformForm;
