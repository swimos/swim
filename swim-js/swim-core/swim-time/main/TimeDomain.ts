// Copyright 2015-2024 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import {Domain} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {DateTimeLike} from "./DateTime";
import {DateTime} from "./DateTime";
import {TimeRange} from "./"; // forward import

/** @public */
export interface TimeDomain extends Domain<DateTime>, Interpolate<TimeDomain> {
  /** @override */
  readonly 0: DateTime;

  /** @override */
  readonly 1: DateTime;

  readonly inverse: TimeRange;

  /** @override */
  contains(t: DateTimeLike): boolean;

  /** @override */
  union(that: Domain<DateTime>): TimeDomain;

  /** @override */
  interpolateTo(that: TimeDomain): Interpolator<TimeDomain>;
  interpolateTo(that: unknown): Interpolator<TimeDomain> | null;

  /** @override */
  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

  /** @override */
  toString(): string;
}

/** @public */
export const TimeDomain = (function (_super: typeof Domain) {
  const TimeDomain = function (x0: DateTime, x1: DateTime): TimeDomain {
    const domain = function (t: DateTime): number {
      const t0 = domain[0].time;
      const t1 = domain[1].time;
      const dt = t1 - t0;
      return dt !== 0 ? (t.time - t0) / dt : 0;
    } as TimeDomain;
    Object.setPrototypeOf(domain, TimeDomain.prototype);
    (domain as Mutable<typeof domain>)[0] = x0;
    (domain as Mutable<typeof domain>)[1] = x1;
    return domain;
  } as {
    (x0: DateTime, x1: DateTime): TimeDomain;

    /** @internal */
    prototype: TimeDomain;
  };

  TimeDomain.prototype = Object.create(_super.prototype);
  TimeDomain.prototype.constructor = TimeDomain;

  Object.defineProperty(TimeDomain.prototype, "inverse", {
    get(this: TimeDomain): TimeRange {
      return TimeRange(this[0], this[1]);
    },
    configurable: true,
  });

  TimeDomain.prototype.contains = function (t: DateTimeLike): boolean {
    t = DateTime.time(t);
    return this[0].time <= t && t <= this[1].time;
  };

  TimeDomain.prototype.union = function (that: Domain<DateTime>): TimeDomain {
    const t0Min = this[0];
    const t0Max = this[1];
    const t1Min = that[0];
    const t1Max = that[1];
    const tMin = t0Min.time <= t1Min.time ? t0Min : t1Min;
    const tMax = t0Max.time >= t1Max.time ? t0Max : t1Max;
    return TimeDomain(tMin, tMax);
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

  return TimeDomain;
})(Domain);

/** @internal */
export const TimeDomainInterpolator = (function (_super: typeof Interpolator) {
  const TimeDomainInterpolator = function (x0: TimeDomain, x1: TimeDomain): Interpolator<TimeDomain> {
    const interpolator = function (u: number): TimeDomain {
      const x0 = interpolator[0];
      const x00 = x0[0];
      const x01 = x0[1];
      const x1 = interpolator[1];
      const x10 = x1[0];
      const x11 = x1[1];
      return TimeDomain(new DateTime(x00.time + u * (x10.time - x00.time), u === 0 ? x00.zone : x10.zone),
                        new DateTime(x01.time + u * (x11.time - x01.time), u === 0 ? x01.zone : x11.zone));
    } as Interpolator<TimeDomain>;
    Object.setPrototypeOf(interpolator, TimeDomainInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = x0;
    (interpolator as Mutable<typeof interpolator>)[1] = x1;
    return interpolator;
  } as {
    (x0: TimeDomain, x1: TimeDomain): Interpolator<TimeDomain>;

    /** @internal */
    prototype: Interpolator<TimeDomain>;
  };

  TimeDomainInterpolator.prototype = Object.create(_super.prototype);
  TimeDomainInterpolator.prototype.constructor = TimeDomainInterpolator;

  return TimeDomainInterpolator;
})(Interpolator);
