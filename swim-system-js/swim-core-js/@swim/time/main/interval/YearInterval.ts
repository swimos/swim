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
import {UnitTimeInterval, TimeInterval} from "../TimeInterval";

/** @hidden */
export class YearInterval extends UnitTimeInterval {
  offset(d: AnyDateTime, k?: number): DateTime {
    d = DateTime.fromAny(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d = d.year(d.year() + k);
    return d;
  }

  next(d: AnyDateTime, k?: number): DateTime {
    d = DateTime.fromAny(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.year(d.year() + k).month(0, 1).hour(0, 0, 0, 0);
  }

  floor(d: AnyDateTime): DateTime {
    d = DateTime.fromAny(d);
    return d.month(0, 1).hour(0, 0, 0, 0);
  }

  ceil(d: AnyDateTime): DateTime {
    d = DateTime.fromAny(d);
    d = d.time(d.time() - 1);
    d = d.month(0, 1).hour(0, 0, 0, 0);
    d = d.year(d.year() + 1);
    return d.month(0, 1).hour(0, 0, 0, 0);
  }

  every(k: number): TimeInterval {
    if (k === 1) {
      return this;
    } else if (isFinite(k) && k >= 1) {
      return new TimeInterval.Years(k);
    } else {
      throw new Error("" + k);
    }
  }
}
TimeInterval.Year = YearInterval;
