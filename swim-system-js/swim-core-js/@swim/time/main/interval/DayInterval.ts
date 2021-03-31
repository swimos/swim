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

import {AnyDateTime, DateTime} from "../DateTime";
import {UnitTimeInterval, TimeInterval} from "./TimeInterval";
import {FilterTimeInterval} from "./FilterTimeInterval";

/** @hidden */
export class DayInterval extends UnitTimeInterval {
  offset(t: AnyDateTime, k?: number): DateTime {
    const d = DateTime.fromAny(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.withDay(d.day + k);
  }

  next(t: AnyDateTime, k?: number): DateTime {
    let d = DateTime.fromAny(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d = d.withDay(d.day + k);
    return d.withHour(0, 0, 0, 0);
  }

  floor(t: AnyDateTime): DateTime {
    const d = DateTime.fromAny(t);
    return d.withHour(0, 0, 0, 0);
  }

  ceil(t: AnyDateTime): DateTime {
    let d = DateTime.fromAny(t);
    d = new DateTime(d.time - 1, d.zone);
    d = d.withHour(0, 0, 0, 0);
    d = d.withDay(d.day + 1);
    return d.withHour(0, 0, 0, 0);
  }

  every(k: number): TimeInterval {
    if (k === 1) {
      return this;
    } else if (isFinite(k) && k >= 1) {
      return new FilterTimeInterval(this, DayInterval.modulo.bind(void 0, k));
    } else {
      throw new Error("" + k);
    }
  }

  private static modulo(k: number, d: DateTime): boolean {
    const day = d.day;
    return isFinite(day) && day % k === 0;
  }
}
