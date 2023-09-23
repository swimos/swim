// Copyright 2015-2023 Nstream, inc.
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
import {Equivalent} from "@swim/util";
import {Mapping} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import {LinearRange} from "@swim/util";
import {ContinuousScale} from "@swim/util";
import type {DateTimeLike} from "./DateTime";
import {DateTime} from "./DateTime";
import {TimeDomain} from "./TimeDomain";

/** @public */
export interface TimeScale extends ContinuousScale<DateTime, number>, Interpolate<TimeScale> {
  /** @override */
  readonly domain: TimeDomain;

  /** @override */
  readonly range: LinearRange;

  /** @override */
  readonly inverse: Mapping<number, DateTime>;

  /** @override */
  withDomain(domain: TimeDomain): TimeScale;
  withDomain(x0: DateTimeLike, x1: DateTimeLike): TimeScale;

  /** @override */
  overRange(range: LinearRange): TimeScale;
  overRange(y0: number, y1: number): TimeScale;

  /** @override */
  clampDomain(xMin: DateTime | undefined, xMax: DateTime | undefined,
              zMin: number | undefined, zMax: number | undefined,
              epsilon?: number): TimeScale;

  /** @override */
  solveDomain(x1: DateTime, y1: number, x2?: DateTime, y2?: number,
              reflect?: boolean, epsilon?: number): TimeScale;

  /** @override */
  interpolateTo(that: TimeScale): Interpolator<TimeScale>;
  interpolateTo(that: unknown): Interpolator<TimeScale> | null;

  /** @override */
  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

  /** @override */
  toString(): string;
}

/** @public */
export const TimeScale = (function (_super: typeof ContinuousScale) {
  const TimeScale = function (domain: TimeDomain, range: LinearRange): TimeScale {
    const scale = function (x: DateTime): number {
      return scale.range(scale.domain(x));
    } as TimeScale;
    Object.setPrototypeOf(scale, TimeScale.prototype);
    (scale as Mutable<typeof scale>).domain = domain;
    (scale as Mutable<typeof scale>).range = range;
    return scale;
  } as {
    (domain: TimeDomain, range: LinearRange): TimeScale;

    /** @internal */
    prototype: TimeScale;
  };

  TimeScale.prototype = Object.create(_super.prototype);
  TimeScale.prototype.constructor = TimeScale;

  Object.defineProperty(TimeScale.prototype, "inverse", {
    get(this: TimeScale): Mapping<number, DateTime> {
      return Mapping(this.range.inverse, this.domain.inverse);
    },
    configurable: true,
  });

  TimeScale.prototype.withDomain = function (x0: TimeDomain | DateTimeLike, x1?: DateTimeLike): TimeScale {
    let domain: TimeDomain;
    if (arguments.length === 1) {
      domain = x0 as TimeDomain;
    } else {
      x0 = DateTime.fromLike(x0 as DateTimeLike);
      x1 = DateTime.fromLike(x1!);
      domain = TimeDomain(x0, x1);
    }
    return TimeScale(domain, this.range);
  };

  TimeScale.prototype.overRange = function (y0: LinearRange | number, y1?: number): TimeScale {
    let range: LinearRange;
    if (arguments.length === 1) {
      range = y0 as LinearRange;
    } else {
      range = LinearRange(y0 as number, y1!);
    }
    return TimeScale(this.domain, range);
  };

  TimeScale.prototype.clampDomain = function (xMin: DateTime | undefined, xMax: DateTime | undefined,
                                              zMin: number | undefined, zMax: number | undefined,
                                              epsilon?: number): TimeScale {
    if (epsilon === void 0) {
      epsilon = Equivalent.Epsilon;
    }
    const x0 = this.domain[0];
    const x1 = this.domain[1];
    let t0 = x0.time;
    let t1 = x1.time;
    const tMin = xMin !== void 0 ? xMin.time : void 0;
    const tMax = xMax !== void 0 ? xMax.time : void 0;
    if (tMin !== void 0 && tMax !== void 0 && Math.abs(t1 - t0) > tMax - tMin) {
      if (t0 < t1) {
        t0 = tMin;
        t1 = tMax;
      } else {
        t1 = tMin;
        t0 = tMax;
      }
    } else if (tMin !== void 0) {
      if (t0 < t1 && t0 < tMin) {
        t1 += tMin - t0;
        t0 = tMin;
      } else if (t1 < t0 && t1 < tMin) {
        t0 += tMin - t1;
        t1 = tMin;
      }
    }
    if (tMax !== void 0) {
      if (t0 < t1 && t1 > tMax) {
        t0 -= t1 - tMax;
        t1 = tMax;
      } else if (t1 < t0 && t0 > tMax) {
        t1 -= t0 - tMax;
        t0 = tMax;
      }
    }

    const y0 = this(x0);
    const y1 = this(x1);
    const dy = y0 < y1 ? y1 - y0 : y0 - y1;
    const z = Math.abs(dy / (t1 - t0));
    if (zMin !== void 0 && z < 1 / zMin) {
      const dz = dy * zMin;
      const tSum = t0 + t1;
      t0 = (tSum - dz) / 2;
      t1 = (tSum + dz) / 2;
    } else if (zMax !== void 0 && z > 1 / zMax) {
      const dz = dy * zMax;
      const tSum = t0 + t1;
      t0 = (tSum - dz) / 2;
      t1 = (tSum + dz) / 2;
    }

    if (Math.abs(t0 - x0.time) < epsilon && Math.abs(t1 - x1.time) < epsilon) {
      return this;
    }
    return TimeScale(TimeDomain(new DateTime(t0, x0.zone), new DateTime(t1, x1.zone)), this.range);
  };

  TimeScale.prototype.solveDomain = function (x1: DateTime, y1: number, x2?: DateTime, y2?: number,
                                              reflect?: boolean, epsilon?: number): TimeScale {
    if (epsilon === void 0) {
      epsilon = Equivalent.Epsilon;
    }
    const dt = this.domain[1].time - this.domain[0].time;
    const y0 = this.range[0];
    const y3 = this.range[1];
    const t1 = x1.time;
    const t2 = x2 !== void 0 ? x2.time : void 0;
    let m: number;
    if (t2 === void 0 || y2 === void 0 || Math.abs(t2 - t1) < epsilon || Math.abs(y2 - y1) < epsilon) {
      m = (y3 - y0) / (dt !== 0 ? dt : epsilon);
    } else {
      m = (y2 - y1) / (t2 - t1);
      if ((reflect === void 0 || !reflect) && (m < 0 !== (y3 - y0) / dt < 0)) {
        m = -m;
      }
    }
    const b = y1 - m * t1;
    const t0 = (y0 - b) / m;
    const t3 = (y3 - b) / m;

    if (Math.abs(t0 - this.domain[0].time) < epsilon && Math.abs(t3 - this.domain[1].time) < epsilon) {
      return this;
    }
    return TimeScale(TimeDomain(new DateTime(t0, this.domain[0].zone), new DateTime(t3, this.domain[1].zone)), this.range);
  };

  TimeScale.prototype.interpolateTo = function (this: TimeScale, that: unknown): Interpolator<TimeScale> | null {
    if (that instanceof TimeScale) {
      return TimeScaleInterpolator(this, that);
    }
    return null;
  } as typeof TimeScale.prototype.interpolateTo;

  TimeScale.prototype.canEqual = function (that: unknown): boolean {
    return that instanceof TimeScale;
  };

  TimeScale.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof TimeScale) {
      return this.domain.equals(that.domain) && this.range.equals(that.range);
    }
    return false;
  };

  TimeScale.prototype.toString = function (): string {
    return "TimeScale(" + this.domain + ", " + this.range + ")";
  };

  return TimeScale;
})(ContinuousScale);

/** @internal */
export const TimeScaleInterpolator = (function (_super: typeof Interpolator) {
  const TimeScaleInterpolator = function (s0: TimeScale, s1: TimeScale): Interpolator<TimeScale> {
    const interpolator = function (u: number): TimeScale {
      const s0 = interpolator[0];
      const s1 = interpolator[1];
      const x0 = s0.domain;
      const x00 = x0[0].time;
      const x01 = x0[1].time;
      const x1 = s1.domain;
      const x10 = x1[0].time;
      const x11 = x1[1].time;
      const domain = TimeDomain(new DateTime(x00 + u * (x10 - x00), u === 0 ? x0[0].zone : x1[0].zone),
                                new DateTime(x01 + u * (x11 - x01), u === 0 ? x0[1].zone : x1[1].zone));
      const y0 = s0.range;
      const y00 = y0[0];
      const y01 = y0[1];
      const y1 = s1.range;
      const y10 = y1[0];
      const y11 = y1[1];
      const range = LinearRange(y00 + u * (y10 - y00), y01 + u * (y11 - y01));
      return TimeScale(domain, range);
    } as Interpolator<TimeScale>;
    Object.setPrototypeOf(interpolator, TimeScaleInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = s0;
    (interpolator as Mutable<typeof interpolator>)[1] = s1;
    return interpolator;
  } as {
    (s0: TimeScale, s1: TimeScale): Interpolator<TimeScale>;

    /** @internal */
    prototype: Interpolator<TimeScale>;
  };

  TimeScaleInterpolator.prototype = Object.create(_super.prototype);
  TimeScaleInterpolator.prototype.constructor = TimeScaleInterpolator;

  return TimeScaleInterpolator;
})(Interpolator);
