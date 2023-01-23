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

import {Item, Text, Num, Form} from "@swim/structure";
import {AnyTimeZone, TimeZone} from "./TimeZone";

/** @internal */
export class TimeZoneForm extends Form<TimeZone, AnyTimeZone> {
  constructor(unit: TimeZone | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
    });
  }

  override readonly unit!: TimeZone | undefined;

  override withUnit(unit: TimeZone | undefined): Form<TimeZone, AnyTimeZone> {
    if (unit !== this.unit) {
      return new TimeZoneForm(unit);
    } else {
      return this;
    }
  }

  override mold(zone: AnyTimeZone): Item {
    zone = TimeZone.fromAny(zone);
    const name = zone.name;
    if (name !== void 0) {
      return Text.from(name);
    } else {
      return Num.from(zone.offset);
    }
  }

  override cast(item: Item): TimeZone | undefined {
    const value = item.toValue();
    const zone = TimeZone.fromValue(value);
    return zone !== null ? zone : void 0;
  }
}
