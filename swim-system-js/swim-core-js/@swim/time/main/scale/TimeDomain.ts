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

import {Domain, Interpolate, Interpolator} from "@swim/mapping";
import {AnyDateTime, DateTime} from "../DateTime";
import {TimeDomainInterpolator} from "./"; // forward import
import {TimeRange} from "./"; // forward import

export interface TimeDomain extends Domain<DateTime>, Interpolate<TimeDomain> {
  readonly 0: DateTime;

  readonly 1: DateTime;

  readonly inverse: TimeRange;

  contains(t: AnyDateTime): boolean;

  interpolateTo(that: TimeDomain): Interpolator<TimeDomain>;
  interpolateTo(that: unknown): Interpolator<TimeDomain> | null;

  canEqual(that: unknown): boolean;

  equals(that: unknown): boolean;

  toString(): string;
}

export const TimeDomain = function (x0: DateTime, x1: DateTime): TimeDomain {
  const domain = function (t: DateTime): number {
    const t0 = domain[0].time;
    const t1 = domain[1].time;
    const dt = t1 - t0;
    return dt !== 0 ? (t.time - t0) / dt : 0;
  } as TimeDomain;
  Object.setPrototypeOf(domain, TimeDomain.prototype);
  Object.defineProperty(domain, 0, {
    value: x0,
    enumerable: true,
  });
  Object.defineProperty(domain, 1, {
    value: x1,
    enumerable: true,
  });
  return domain;
} as {
  (x0: DateTime, x1: DateTime): TimeDomain;

  /** @hidden */
  prototype: TimeDomain;
}

TimeDomain.prototype = Object.create(Domain.prototype);

Object.defineProperty(TimeDomain.prototype, "inverse", {
  get(this: TimeDomain): TimeRange {
    return TimeRange(this[0], this[1]);
  },
  enumerable: true,
  configurable: true,
});

TimeDomain.prototype.contains = function (t: AnyDateTime): boolean {
  t = DateTime.time(t);
  return this[0].time <= t && t <= this[1].time;
};

TimeDomain.prototype.interpolateTo = function (this: TimeDomain, that: unknown): Interpolator<TimeDomain> | null {
  if (that instanceof TimeDomain) {
    return TimeDomainInterpolator(this, that);
  }
  return null;
} as typeof TimeDomain.prototype.interpolateTo;

TimeDomain.prototype.canEqual = function (that: unknown): boolean {
  return that instanceof TimeDomain;
};

TimeDomain.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof TimeDomain) {
    return that.canEqual(this) && this[0].equals(that[0]) && this[1].equals(that[1]);
  }
  return false;
};

TimeDomain.prototype.toString = function (): string {
  return "TimeDomain(" + this[0] + ", " + this[1] + ")";
};
