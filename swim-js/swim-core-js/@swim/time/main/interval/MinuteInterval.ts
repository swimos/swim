// Copyright 2015-2019 SWIM.AI inc.
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
import {MILLIS_PER_MINUTE, UnitTimeInterval, TimeInterval} from "../TimeInterval";

/** @hidden */
export class MinuteInterval extends UnitTimeInterval {
  offset(d: AnyDateTime, k?: number): DateTime {
    d = DateTime.fromAny(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.time(d.time() + k * MILLIS_PER_MINUTE);
  }

  next(d: AnyDateTime, k?: number): DateTime {
    d = DateTime.fromAny(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.time(Math.floor((d.time() + k * MILLIS_PER_MINUTE) / MILLIS_PER_MINUTE) * MILLIS_PER_MINUTE);
  }

  floor(d: AnyDateTime): DateTime {
    d = DateTime.fromAny(d);
    return d.time(Math.floor(d.time() / MILLIS_PER_MINUTE) * MILLIS_PER_MINUTE);
  }

  ceil(d: AnyDateTime): DateTime {
    d = DateTime.fromAny(d);
    return d.time(Math.floor(((Math.floor((d.time() - 1) / MILLIS_PER_MINUTE) * MILLIS_PER_MINUTE) + MILLIS_PER_MINUTE) / MILLIS_PER_MINUTE) * MILLIS_PER_MINUTE);
  }

  every(k: number): TimeInterval {
    if (k === 1) {
      return this;
    } else if (isFinite(k) && k >= 1) {
      return new TimeInterval.Filter(this, MinuteInterval.modulo.bind(void 0, k));
    } else {
      throw new Error("" + k);
    }
  }

  private static modulo(k: number, d: DateTime): boolean {
    return d.minute() % k === 0;
  }
}
TimeInterval.Minute = MinuteInterval;
