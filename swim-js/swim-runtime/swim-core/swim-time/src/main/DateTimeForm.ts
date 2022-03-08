// Copyright 2015-2022 Swim.inc
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

import {AnyDateTime, DateTime} from "./DateTime";
import {Item, Value, Text, Form} from "@swim/structure";

/** @internal */
export class DateTimeForm extends Form<DateTime, AnyDateTime> {
  constructor(unit: DateTime | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
    });
  }

  override readonly unit!: DateTime | undefined;

  override withUnit(unit: DateTime | undefined): Form<DateTime, AnyDateTime> {
    if (unit !== this.unit) {
      return new DateTimeForm(unit);
    } else {
      return this;
    }
  }

  override mold(date: AnyDateTime): Item {
    date = DateTime.fromAny(date);
    return Text.from(date.toString());
  }

  override cast(value: Value): DateTime | undefined {
    let date: DateTime | null = null;
    try {
      date = DateTime.fromValue(value);
      if (date === void 0) {
        const millis = value.numberValue(void 0);
        if (millis !== void 0) {
          date = new DateTime(millis);
        } else {
          const string = value.stringValue(void 0);
          if (string !== void 0) {
            date = DateTime.parse(string);
          }
        }
      }
    } catch (e) {
      // swallow
    }
    return date !== null ? date : void 0;
  }
}
