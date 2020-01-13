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

import {Item, Text, Num, Form} from "@swim/structure";
import {AnyTimeZone, TimeZone} from "./TimeZone";

/** @hidden */
export class TimeZoneForm extends Form<TimeZone, AnyTimeZone> {
  private readonly _unit: TimeZone | undefined;

  constructor(unit?: TimeZone) {
    super();
    this._unit = unit;
  }

  unit(): TimeZone | undefined;
  unit(unit: TimeZone | undefined): Form<TimeZone, AnyTimeZone>;
  unit(unit?: TimeZone | undefined): TimeZone | undefined | Form<TimeZone, AnyTimeZone> {
    if (arguments.length === 0) {
      return this._unit;
    } else {
      return new TimeZoneForm(unit);
    }
  }

  mold(zone: AnyTimeZone): Item {
    zone = TimeZone.fromAny(zone);
    const name = zone.name();
    if (name !== void 0) {
      return Text.from(name);
    } else {
      return Num.from(zone._offset);
    }
  }

  cast(item: Item): TimeZone | undefined {
    const value = item.toValue();
    return TimeZone.fromValue(value);
  }
}
TimeZone.Form = TimeZoneForm;
