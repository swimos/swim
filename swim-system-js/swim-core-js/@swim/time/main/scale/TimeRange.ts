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

import {Range, Interpolate, Interpolator} from "@swim/mapping";
import {DateTime} from "../DateTime";
import {TimeDomain} from "./"; // forward import
import {TimeRangeInterpolator} from "./"; // forward import

export interface TimeRange extends Range<DateTime>, Interpolate<TimeRange> {
  readonly 0: DateTime;

  readonly 1: DateTime;

  readonly inverse: TimeDomain;

  interpolateTo(that: TimeRange): Interpolator<TimeRange>;
  interpolateTo(that: unknown): Interpolator<TimeRange> | null;

  canEqual(that: unknown): boolean;

  equals(that: unknown): boolean;

  toString(): string;
}

export const TimeRange = function (y0: DateTime, y1: DateTime): TimeRange {
  const range = function (u: number): DateTime {
    const t0 = range[0].time;
    const t1 = range[1].time;
    return new DateTime(t0 + u * (t1 - t0), u === 0 ? range[0].zone : range[1].zone);
  } as TimeRange;
  Object.setPrototypeOf(range, TimeRange.prototype);
  Object.defineProperty(range, 0, {
    value: y0,
    enumerable: true,
  });
  Object.defineProperty(range, 1, {
    value: y1,
    enumerable: true,
  });
  return range;
} as {
  (y0: DateTime, y1: DateTime): TimeRange;

  /** @hidden */
  prototype: TimeRange;
};

TimeRange.prototype = Object.create(Range.prototype);

Object.defineProperty(TimeRange.prototype, "inverse", {
  get(this: TimeRange): TimeDomain {
    return TimeDomain(this[0], this[1]);
  },
  enumerable: true,
  configurable: true,
});

TimeRange.prototype.interpolateTo = function (this: TimeRange, that: unknown): Interpolator<TimeRange> | null {
  if (that instanceof TimeRange) {
    return TimeRangeInterpolator(this, that);
  }
  return null;
} as typeof TimeRange.prototype.interpolateTo;

TimeRange.prototype.canEqual = function (that: unknown): boolean {
  return that instanceof TimeRange;
};

TimeRange.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof TimeRange) {
    return that.canEqual(this) && this[0].equals(that[0]) && this[1].equals(that[1]);
  }
  return false;
};

TimeRange.prototype.toString = function (): string {
  return "TimeRange(" + this[0] + ", " + this[1] + ")";
};
