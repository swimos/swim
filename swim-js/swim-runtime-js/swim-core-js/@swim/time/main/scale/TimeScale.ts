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

import {Equivalent} from "@swim/util";
import {Mapping, Interpolate, Interpolator, LinearRange, ContinuousScale} from "@swim/mapping";
import {AnyDateTime, DateTime} from "../DateTime";
import {TimeDomain} from "./TimeDomain";
import {TimeScaleInterpolator} from "./"; // forward import

export interface TimeScale extends ContinuousScale<DateTime, number>, Interpolate<TimeScale> {
  readonly domain: TimeDomain;

  readonly range: LinearRange;

  readonly inverse: Mapping<number, DateTime>;

  withDomain(domain: TimeDomain): TimeScale;
  withDomain(x0: AnyDateTime, x1: AnyDateTime): TimeScale;

  overRange(range: LinearRange): TimeScale;
  overRange(y0: number, y1: number): TimeScale;

  clampDomain(xMin: DateTime | undefined, xMax: DateTime | undefined,
              zMin: number | undefined, zMax: number | undefined,
              epsilon?: number): TimeScale;

  solveDomain(x1: DateTime, y1: number, x2?: DateTime, y2?: number,
              reflect?: boolean, epsilon?: number): TimeScale;

  interpolateTo(that: TimeScale): Interpolator<TimeScale>;
  interpolateTo(that: unknown): Interpolator<TimeScale> | null;

  canEqual(that: unknown): boolean;

  equals(that: unknown): boolean;

  toString(): string;
}

export const TimeScale = function (domain: TimeDomain, range: LinearRange): TimeScale {
  const scale = function (x: DateTime): number {
    return scale.range(scale.domain(x));
  } as TimeScale;
  Object.setPrototypeOf(scale, TimeScale.prototype);
  Object.defineProperty(scale, "domain", {
    value: domain,
    enumerable: true,
  });
  Object.defineProperty(scale, "range", {
    value: range,
    enumerable: true,
  });
  return scale;
} as {
  (domain: TimeDomain, range: LinearRange): TimeScale;

  /** @hidden */
  prototype: TimeScale;
};

TimeScale.prototype = Object.create(ContinuousScale.prototype);

Object.defineProperty(TimeScale.prototype, "inverse", {
  get(this: TimeScale): Mapping<number, DateTime> {
    return Mapping(this.range.inverse, this.domain.inverse);
  },
  enumerable: true,
  configurable: true,
});

TimeScale.prototype.withDomain = function (x0: TimeDomain | AnyDateTime, x1?: AnyDateTime): TimeScale {
  let domain: TimeDomain;
  if (arguments.length === 1) {
    domain = x0 as TimeDomain;
  } else {
    x0 = DateTime.fromAny(x0 as AnyDateTime);
    x1 = DateTime.fromAny(x1!);
    domain = TimeDomain(x0 as DateTime, x1 as DateTime);
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
  } else {
    if (tMin !== void 0) {
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
  } else {
    return TimeScale(TimeDomain(new DateTime(t0, x0.zone), new DateTime(t1, x1.zone)), this.range);
  }
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
  } else {
    return TimeScale(TimeDomain(new DateTime(t0, this.domain[0].zone), new DateTime(t3, this.domain[1].zone)), this.range);
  }
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
