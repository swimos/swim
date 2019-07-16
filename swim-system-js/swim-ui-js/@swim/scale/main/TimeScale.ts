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

import {TimeZone, AnyDateTime, DateTime} from "@swim/time";
import {AnyInterpolator, Interpolator} from "@swim/interpolate";
import {Scale} from "./Scale";
import {ContinuousScale} from "./ContinuousScale";

export class TimeScale<R extends RU, RU = R> extends ContinuousScale<DateTime, R, AnyDateTime, RU> {
  readonly t0: number;
  readonly dt: number;
  readonly zone: TimeZone;
  readonly ft: Interpolator<R, RU>;

  constructor(d0: AnyDateTime, d1: AnyDateTime, ft: Interpolator<R, RU>, zone?: TimeZone) {
    super();
    d0 = DateTime.fromAny(d0);
    d1 = DateTime.fromAny(d1);
    this.t0 = d0.time();
    this.dt = d1.time() - this.t0;
    this.zone = zone || d0.zone();
    this.ft = ft;
  }

  norm(d: AnyDateTime): number {
    d = DateTime.time(d);
    return this.dt ? (d - this.t0) / this.dt : this.dt;
  }

  scale(d: AnyDateTime): R {
    const u = this.norm(d);
    return this.ft.interpolate(u);
  }

  unscale(y: RU): DateTime {
    const u = this.ft.deinterpolate(y);
    return new DateTime(this.t0 + this.dt * u);
  }

  clampScale(d: AnyDateTime): R {
    const u = Math.min(Math.max(0, this.norm(d)), 1);
    return this.ft.interpolate(u);
  }

  domain(): DateTime[];
  domain(ts: ReadonlyArray<AnyDateTime>): TimeScale<R, RU>;
  domain(t0: AnyDateTime, t1?: AnyDateTime): TimeScale<R, RU>;
  domain(t0?: ReadonlyArray<AnyDateTime> | AnyDateTime, t1?: AnyDateTime): DateTime[] | TimeScale<R, RU> {
    if (t0 === void 0) {
      return [new DateTime(this.t0, this.zone), new DateTime(this.t0 + this.dt, this.zone)];
    } else {
      if (t1 === void 0) {
        t1 = (t0 as ReadonlyArray<AnyDateTime>)[1];
        t0 = (t0 as ReadonlyArray<AnyDateTime>)[0];
      }
      t0 = DateTime.time(t0 as AnyDateTime);
      t1 = DateTime.time(t1);
      const dt = t1 - t0;
      if (t0 === this.t0 && dt === this.dt) {
        return this;
      } else {
        return new TimeScale(t0, t1, this.ft, this.zone);
      }
    }
  }

  range(): R[];
  range(ys: ReadonlyArray<RU>): TimeScale<R, RU>;
  range(y0: RU, y1?: RU): TimeScale<R, RU>;
  range(y0?: ReadonlyArray<RU> | RU, y1?: RU): R[] | TimeScale<R, RU> {
    if (y0 === void 0) {
      return this.ft.range();
    } else if (y1 === void 0) {
      y0 = y0 as ReadonlyArray<RU>;
      return new TimeScale(this.t0, this.t0 + this.dt, this.ft.range(y0), this.zone);
    } else {
      y0 = y0 as RU;
      return new TimeScale(this.t0, this.t0 + this.dt, this.ft.range(y0, y1), this.zone);
    }
  }

  interpolator(): Interpolator<R, RU>;
  interpolator(ft: AnyInterpolator<R, RU>): TimeScale<R, RU>;
  interpolator(ft?: AnyInterpolator<R, RU>): Interpolator<R, RU> | TimeScale<R, RU> {
    if (ft === void 0) {
      return this.ft;
    } else {
      ft = Interpolator.fromAny(ft);
      return new TimeScale(this.t0, this.t0 + this.dt, ft, this.zone);
    }
  }

  clampDomain(tMin?: AnyDateTime, tMax?: AnyDateTime, zMin?: number, zMax?: number, epsilon?: number): TimeScale<R, RU> {
    let t0 = this.t0;
    let t1 = this.t0 + this.dt;
    if (tMin !== void 0) {
      tMin = DateTime.time(tMin);
      if (t0 < t1 && t0 < tMin) {
        t0 = tMin;
      } else if (t1 < t0 && t1 < tMin) {
        t1 = tMin;
      }
    }
    if (tMax !== void 0) {
      tMax = DateTime.time(tMax);
      if (t0 < t1 && t1 > tMax) {
        t1 = tMax;
      } else if (t1 < t0 && t0 > tMax) {
        t1 = tMax;
      }
    }

    const y0 = +this.scale(t0);
    const y1 = +this.scale(t1);
    const dy = y1 - y0;
    const z = Math.abs(dy / (t1 - t0));
    if (zMin !== void 0 && z < 1/zMin) {
      const dt = dy * zMin;
      const tSum = t0 + t1;
      t0 = (tSum - dt) / 2;
      t1 = (tSum + dt) / 2;
    } else if (zMax !== void 0 && z > 1/zMax) {
      const dt = dy * zMax;
      const tSum = t0 + t1;
      t0 = (tSum - dt) / 2;
      t1 = (tSum + dt) / 2;
    }

    const dt = t1 - t0;
    if (epsilon === void 0) {
      epsilon = 1e-12;
    }
    if (Math.abs(t0 - this.t0) < epsilon && Math.abs(dt - this.dt) < epsilon) {
      return this;
    } else {
      return new TimeScale(t0, t1, this.ft, this.zone);
    }
  }

  solveDomain(t1: AnyDateTime, y1: RU, t2?: AnyDateTime, y2?: RU, epsilon?: number): TimeScale<R, RU> {
    t1 = DateTime.time(t1);
    t2 = t2 !== void 0 ? DateTime.time(t2) : t2;
    const range = this.ft.range();
    const y0 = +range[0];
    const y3 = +range[1];
    let m;
    if (t2 === void 0 || y2 === void 0 || t1 === t2 || y1 === y2) {
      m = (y3 - y0) / (this.dt || 1);
    } else {
      m = (+y2 - +y1) / (t2 - t1);
    }
    const b = +y1 - m * t1;
    const t0 = (y0 - b) / m;
    const t3 = (y3 - b) / m;

    const dt = t3 - t0;
    if (epsilon === void 0) {
      epsilon = 1e-12;
    }
    if (Math.abs(t0 - this.t0) < epsilon && Math.abs(dt - this.dt) < epsilon) {
      return this;
    } else {
      return new TimeScale(t0, t3, this.ft, this.zone);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof TimeScale) {
      return this.t0 === that.t0 && this.dt === that.dt && this.ft.equals(that.ft);
    }
    return false;
  }
}
Scale.Time = TimeScale;
