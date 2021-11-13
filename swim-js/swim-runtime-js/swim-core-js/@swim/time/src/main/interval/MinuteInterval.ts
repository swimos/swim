// Copyright 2015-2021 Swim Inc.
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

/** @internal */
export class MinuteInterval extends UnitTimeInterval {
  override offset(d: AnyDateTime, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d += k * TimeInterval.MillisPerMinute;
    return new DateTime(d, z);
  }

  override next(d: AnyDateTime, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d = Math.floor((d + k * TimeInterval.MillisPerMinute) / TimeInterval.MillisPerMinute) * TimeInterval.MillisPerMinute;
    return new DateTime(d, z);
  }

  override floor(d: AnyDateTime): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    d = Math.floor(d / TimeInterval.MillisPerMinute) * TimeInterval.MillisPerMinute;
    return new DateTime(d, z);
  }

  override ceil(d: AnyDateTime): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    d = Math.floor(((Math.floor((d - 1) / TimeInterval.MillisPerMinute) * TimeInterval.MillisPerMinute) + TimeInterval.MillisPerMinute) / TimeInterval.MillisPerMinute) * TimeInterval.MillisPerMinute;
    return new DateTime(d, z);
  }

  override every(k: number): TimeInterval {
    if (k === 1) {
      return this;
    } else if (isFinite(k) && k >= 1) {
      return new FilterTimeInterval(this, MinuteInterval.modulo.bind(void 0, k));
    } else {
      throw new Error("" + k);
    }
  }

  /** @internal */
  static modulo(k: number, d: DateTime): boolean {
    const minute = d.minute;
    return isFinite(minute) && minute % k === 0;
  }
}
