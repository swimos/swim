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
export class MillisecondInterval extends UnitTimeInterval {
  offset(d: AnyDateTime, k?: number): DateTime {
    d = DateTime.fromAny(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.time(d.time() + k);
  }

  next(d: AnyDateTime, k?: number): DateTime {
    d = DateTime.fromAny(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.time(d.time() + k);
  }

  floor(d: AnyDateTime): DateTime {
    return DateTime.fromAny(d);
  }

  ceil(d: AnyDateTime): DateTime {
    return DateTime.fromAny(d);
  }

  every(k: number): TimeInterval {
    if (k === 1) {
      return this;
    } else if (isFinite(k) && k >= 1) {
      return new TimeInterval.Milliseconds(k);
    } else {
      throw new Error("" + k);
    }
  }
}
TimeInterval.Millisecond = MillisecondInterval;
