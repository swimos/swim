// Copyright 2015-2021 Swim inc.
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
  constructor(unit: Transform | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
    });
  }

  override readonly unit!: Transform | undefined;

  override withUnit(unit: Transform | undefined): Form<Transform, AnyTransform> {
    if (unit !== this.unit) {
      return new TransformForm(unit);
    } else {
      return this;
    }
  }

  override mold(transform: AnyTransform): Item {
    transform = Transform.fromAny(transform);
    return transform.toValue();
  }

  override cast(item: Item): Transform | undefined {
    const value = item.toValue();
    try {
      if (value instanceof Record) {
        const transform = Transform.fromValue(value);
        return transform !== null ? transform : void 0;
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
