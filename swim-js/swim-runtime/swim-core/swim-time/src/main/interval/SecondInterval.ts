// Copyright 2015-2022 Swim.inc
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
export class SecondInterval extends UnitTimeInterval {
  override offset(d: AnyDateTime, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d += k * TimeInterval.MillisPerSecond;
    return new DateTime(d, z);
  }

  override next(d: AnyDateTime, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d += k * TimeInterval.MillisPerSecond;
    d = Math.floor(d / TimeInterval.MillisPerSecond) * TimeInterval.MillisPerSecond;
    return new DateTime(d, z);
  }

  override floor(d: AnyDateTime): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    d = Math.floor(d / TimeInterval.MillisPerSecond) * TimeInterval.MillisPerSecond;
    return new DateTime(d, z);
  }

  override ceil(d: AnyDateTime): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    d = Math.floor(((Math.floor((d - 1) / TimeInterval.MillisPerSecond) * TimeInterval.MillisPerSecond) + TimeInterval.MillisPerSecond) / TimeInterval.MillisPerSecond) * TimeInterval.MillisPerSecond;
    return new DateTime(d, z);
  }

  override every(k: number): TimeInterval {
    if (k === 1) {
      return this;
    } else if (isFinite(k) && k >= 1) {
      return new FilterTimeInterval(this, SecondInterval.modulo.bind(void 0, k));
    } else {
      throw new Error('' + k);
    }
  }

  /** @internal */
  static modulo(k: number, d: DateTime): boolean {
    const second = d.second;
    return isFinite(second) && second % k === 0;
  }
}
