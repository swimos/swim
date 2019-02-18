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

import {AnyInterpolator, Interpolator} from "@swim/interpolate";
import {Scale} from "./Scale";
import {ContinuousScale} from "./ContinuousScale";

export class LinearScale<R extends RU, RU = R> extends ContinuousScale<number, R, number, RU> {
  readonly x0: number;
  readonly dx: number;
  readonly fx: Interpolator<R, RU>;

  constructor(x0: number, x1: number, fx: Interpolator<R, RU>) {
    super();
    this.x0 = x0;
    this.dx = x1 - this.x0;
    this.fx = fx;
  }

  norm(x: number): number {
    return this.dx ? (x - this.x0) / this.dx : this.dx;
  }

  scale(x: number): R {
    const u = this.norm(x);
    return this.fx.interpolate(u);
  }

  unscale(y: RU): number {
    const u = this.fx.deinterpolate(y);
    return this.x0 + this.dx * u;
  }

  clampScale(x: number): R {
    const u = Math.min(Math.max(0, this.norm(x)), 1);
    return this.fx.interpolate(u);
  }

  domain(): number[];
  domain(xs: ReadonlyArray<number>): LinearScale<R, RU>;
  domain(x0: number, x1?: number): LinearScale<R, RU>;
  domain(x0?: ReadonlyArray<number> | number, x1?: number): number[] | LinearScale<R, RU> {
    if (x0 === void 0) {
      return [this.x0, this.x0 + this.dx];
    } else {
      if (x1 === void 0) {
        x1 = (x0 as ReadonlyArray<number>)[1];
        x0 = (x0 as ReadonlyArray<number>)[0];
      }
      const dx = x1 - (x0 as number);
      if (x0 === this.x0 && dx === this.dx) {
        return this;
      } else {
        return new LinearScale(x0 as number, x1, this.fx);
      }
    }
  }

  range(): R[];
  range(ys: ReadonlyArray<RU>): LinearScale<R, RU>;
  range(y0: RU, y1?: RU): LinearScale<R, RU>;
  range(y0?: ReadonlyArray<RU> | RU, y1?: RU): R[] | LinearScale<R, RU> {
    if (y0 === void 0) {
      return this.fx.range();
    } else if (y1 === void 0) {
      y0 = y0 as ReadonlyArray<RU>;
      return new LinearScale(this.x0, this.x0 + this.dx, this.fx.range(y0));
    } else {
      y0 = y0 as R;
      return new LinearScale(this.x0, this.x0 + this.dx, this.fx.range(y0, y1));
    }
  }

  interpolator(): Interpolator<R, RU>;
  interpolator(fx: AnyInterpolator<R, RU>): LinearScale<R, RU>;
  interpolator(fx?: AnyInterpolator<R, RU>): Interpolator<R, RU> | LinearScale<R, RU> {
    if (fx === void 0) {
      return this.fx;
    } else {
      fx = Interpolator.fromAny(fx);
      return new LinearScale(this.x0, this.x0 + this.dx, fx);
    }
  }

  clampDomain(xMin?: number, xMax?: number, zMin?: number, zMax?: number, epsilon?: number): LinearScale<R, RU> {
    let x0 = this.x0;
    let x1 = this.x0 + this.dx;
    if (xMin !== void 0) {
      if (x0 < x1 && x0 < xMin) {
        x0 = xMin;
      } else if (x1 < x0 && x1 < xMin) {
        x1 = xMin;
      }
    }
    if (xMax !== void 0) {
      if (x0 < x1 && x1 > xMax) {
        x1 = xMax;
      } else if (x1 < x0 && x0 > xMax) {
        x1 = xMax;
      }
    }

    const y0 = +this.scale(x0);
    const y1 = +this.scale(x1);
    const dy = y1 - y0;
    const z = Math.abs(dy / (x1 - x0));
    if (zMin !== void 0 && z < 1/zMin) {
      const dx = dy * zMin;
      const xSum = x0 + x1;
      x0 = (xSum - dx) / 2;
      x1 = (xSum + dx) / 2;
    } else if (zMax !== void 0 && z > 1/zMax) {
      const dx = dy * zMax;
      const xSum = x0 + x1;
      x0 = (xSum - dx) / 2;
      x1 = (xSum + dx) / 2;
    }

    const dx = x1 - x0;
    if (epsilon === void 0) {
      epsilon = 1e-12;
    }
    if (Math.abs(x0 - this.x0) < epsilon && Math.abs(dx - this.dx) < epsilon) {
      return this;
    } else {
      return new LinearScale(x0, x1, this.fx);
    }
  }

  solveDomain(x1: number, y1: RU, x2?: number, y2?: RU, epsilon?: number): LinearScale<R, RU> {
    const range = this.fx.range();
    const y0 = +range[0];
    const y3 = +range[1];
    let m;
    if (x2 === void 0 || y2 === void 0 || x1 === x2 || y1 === y2) {
      m = (y3 - y0) / (this.dx || 1);
    } else {
      m = (+y2 - +y1) / (x2 - x1);
    }
    const b = +y1 - m * x1;
    const x0 = (y0 - b) / m;
    const x3 = (y3 - b) / m;

    const dx = x3 - x0;
    if (epsilon === void 0) {
      epsilon = 1e-12;
    }
    if (Math.abs(x0 - this.x0) < epsilon && Math.abs(dx - this.dx) < epsilon) {
      return this;
    } else {
      return new LinearScale(x0, x3, this.fx);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LinearScale) {
      return this.x0 === that.x0 && this.dx === that.dx && this.fx.equals(that.fx);
    }
    return false;
  }
}
Scale.Linear = LinearScale;
