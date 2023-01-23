// Copyright 2015-2023 Swim.inc
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

import {Mutable, Range, Interpolate, Interpolator} from "@swim/util";
import {DateTime} from "../DateTime";
import {TimeDomain} from "./"; // forward import
import {TimeRangeInterpolator} from "./"; // forward import

/** @public */
export interface TimeRange extends Range<DateTime>, Interpolate<TimeRange> {
  /** @override */
  readonly 0: DateTime;

  /** @override */
  readonly 1: DateTime;

  readonly inverse: TimeDomain;

  /** @override */
  union(that: Range<DateTime>): TimeRange;

  /** @override */
  interpolateTo(that: TimeRange): Interpolator<TimeRange>;
  interpolateTo(that: unknown): Interpolator<TimeRange> | null;

  /** @override */
  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

  /** @override */
  toString(): string;
}

/** @public */
export const TimeRange = (function (_super: typeof Range) {
  const TimeRange = function (y0: DateTime, y1: DateTime): TimeRange {
    const range = function (u: number): DateTime {
      const t0 = range[0].time;
      const t1 = range[1].time;
      return new DateTime(t0 + u * (t1 - t0), u === 0 ? range[0].zone : range[1].zone);
    } as TimeRange;
    Object.setPrototypeOf(range, TimeRange.prototype);
    (range as Mutable<typeof range>)[0] = y0;
    (range as Mutable<typeof range>)[1] = y1;
    return range;
  } as {
    (y0: DateTime, y1: DateTime): TimeRange;

    /** @internal */
    prototype: TimeRange;
  };

  TimeRange.prototype = Object.create(_super.prototype);
  TimeRange.prototype.constructor = TimeRange;

  Object.defineProperty(TimeRange.prototype, "inverse", {
    get(this: TimeRange): TimeDomain {
      return TimeDomain(this[0], this[1]);
    },
    configurable: true,
  });

  TimeRange.prototype.union = function (that: Range<DateTime>): TimeRange {
    const t00 = this[0];
    const t01 = this[1];
    const t10 = that[0];
    const t11 = that[1];
    let t0: DateTime;
    let t1: DateTime;
    if (t00.time <= t01.time && t10.time <= t11.time) {
      t0 = t00.time <= t10.time ? t00 : t10;
      t1 = t01.time >= t11.time ? t01 : t11;
    } else if (t00.time >= t01.time && t10.time >= t11.time) {
      t0 = t00.time >= t10.time ? t00 : t10;
      t1 = t01.time <= t11.time ? t01 : t11;
    } else if (t00.time <= t01.time && t10.time >= t11.time) {
      t0 = t00.time <= t11.time ? t00 : t11;
      t1 = t01.time >= t10.time ? t01 : t10;
    } else { // t00.time >= t01.time && t10.time <= t11.time
      t0 = t01.time <= t10.time ? t01 : t10;
      t1 = t00.time >= t11.time ? t00 : t11;
    }
    return TimeRange(t0, t1);
  };

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

  return TimeRange;
})(Range);
