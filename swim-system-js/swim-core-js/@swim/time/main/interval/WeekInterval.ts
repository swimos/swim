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
import {TimeInterval} from "../TimeInterval";

/** @hidden */
export class WeekInterval extends TimeInterval {
  readonly day: number;

  constructor(day: number = 0) {
    super();
    this.day = day;
  }

  offset(d: AnyDateTime, k?: number): DateTime {
    d = DateTime.fromAny(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.day(d.day() + 7 * k);
  }

  next(d: AnyDateTime, k?: number): DateTime {
    d = DateTime.fromAny(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d = d.day(d.day() + 7 * k);
    d = d.day(d.day() - (d.weekday() + 7 - this.day) % 7);
    return d.hour(0, 0, 0, 0);
  }

  floor(d: AnyDateTime): DateTime {
    d = DateTime.fromAny(d);
    d = d.day(d.day() - (d.weekday() + 7 - this.day) % 7);
    return d.hour(0, 0, 0, 0);
  }

  ceil(d: AnyDateTime): DateTime {
    d = DateTime.fromAny(d);
    d = d.time(d.time() - 1);
    d = d.day(d.day() - (d.weekday() + 7 - this.day) % 7);
    d = d.hour(0, 0, 0, 0);
    d = d.day(d.day() + 7);
    return d.hour(0, 0, 0, 0);
  }
}
TimeInterval.Week = WeekInterval;
