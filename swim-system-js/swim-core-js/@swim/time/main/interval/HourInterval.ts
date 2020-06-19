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
import {MILLIS_PER_MINUTE, MILLIS_PER_HOUR, UnitTimeInterval, TimeInterval} from "../TimeInterval";

/** @hidden */
export class HourInterval extends UnitTimeInterval {
  offset(d: AnyDateTime, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d += k * MILLIS_PER_HOUR;
    return new DateTime(d, z);
  }

  next(d: AnyDateTime, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d += k * MILLIS_PER_HOUR;
    let dtz = z.offset() * MILLIS_PER_MINUTE % MILLIS_PER_HOUR;
    if (dtz < 0) {
      dtz += MILLIS_PER_HOUR;
    }
    d = Math.floor((d - dtz) / MILLIS_PER_HOUR) * MILLIS_PER_HOUR + dtz;
    return new DateTime(d, z);
  }

  floor(d: AnyDateTime): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    let dtz = z.offset() * MILLIS_PER_MINUTE % MILLIS_PER_HOUR;
    if (dtz < 0) {
      dtz += MILLIS_PER_HOUR;
    }
    d = Math.floor((d - dtz) / MILLIS_PER_HOUR) * MILLIS_PER_HOUR + dtz;
    return new DateTime(d, z);
  }

  ceil(d: AnyDateTime): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    d -= 1;
    let dtz = z.offset() * MILLIS_PER_MINUTE % MILLIS_PER_HOUR;
    if (dtz < 0) {
      dtz += MILLIS_PER_HOUR;
    }
    d = (Math.floor((d - dtz) / MILLIS_PER_HOUR) * MILLIS_PER_HOUR + dtz) + MILLIS_PER_HOUR;
    d = Math.floor((d - dtz) / MILLIS_PER_HOUR) * MILLIS_PER_HOUR + dtz;
    return new DateTime(d, z);
  }

  every(k: number): TimeInterval {
    if (k === 1) {
      return this;
    } else if (isFinite(k) && k >= 1) {
      return new TimeInterval.Filter(this, HourInterval.modulo.bind(void 0, k));
    } else {
      throw new Error("" + k);
    }
  }

  private static modulo(k: number, d: DateTime): boolean {
    const hour = d.hour();
    return isFinite(hour) && hour % k === 0;
  }
}
TimeInterval.Hour = HourInterval;
