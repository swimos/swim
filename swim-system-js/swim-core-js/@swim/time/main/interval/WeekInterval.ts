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

import {AnyDateTime, DateTime} from "../DateTime";
import {TimeInterval} from "./TimeInterval";

/** @hidden */
export class WeekInterval extends TimeInterval {
  readonly day: number;

  constructor(day: number = 0) {
    super();
    this.day = day;
  }

  override offset(t: AnyDateTime, k?: number): DateTime {
    const d = DateTime.fromAny(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.withDay(d.day + 7 * k);
  }

  override next(t: AnyDateTime, k?: number): DateTime {
    let d = DateTime.fromAny(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d = d.withDay(d.day + 7 * k);
    d = d.withDay(d.day - (d.weekday + 7 - this.day) % 7);
    return d.withHour(0, 0, 0, 0);
  }

  override floor(t: AnyDateTime): DateTime {
    let d = DateTime.fromAny(t);
    d = d.withDay(d.day - (d.weekday + 7 - this.day) % 7);
    return d.withHour(0, 0, 0, 0);
  }

  override ceil(t: AnyDateTime): DateTime {
    let d = DateTime.fromAny(t);
    d = new DateTime(d.time - 1, d.zone);
    d = d.withDay(d.day - (d.weekday + 7 - this.day) % 7);
    d = d.withHour(0, 0, 0, 0);
    d = d.withDay(d.day + 7);
    return d.withHour(0, 0, 0, 0);
  }
}
