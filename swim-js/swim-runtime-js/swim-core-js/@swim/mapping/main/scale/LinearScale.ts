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

import {Equivalent, Mutable} from "@swim/util";
import type {Interpolate} from "../interpolate/Interpolate";
import type {Interpolator} from "../interpolate/Interpolator";
import {LinearDomain} from "./LinearDomain";
import {LinearRange} from "./LinearRange";
import {ContinuousScale} from "./ContinuousScale";
import {LinearScaleInterpolator} from "./"; // forward import

export interface LinearScale extends ContinuousScale<number, number>, Interpolate<LinearScale> {
  readonly domain: LinearDomain;

  readonly range: LinearRange;

  readonly inverse: LinearScale;

  withDomain(domain: LinearDomain): LinearScale;
  withDomain(x0: number, x1: number): LinearScale;

  overRange(range: LinearRange): LinearScale;
  overRange(y0: number, y1: number): LinearScale;

  clampDomain(xMin: number | undefined, xMax: number | undefined,
              zMin: number | undefined, zMax: number | undefined,
              epsilon?: number): LinearScale;

  solveDomain(x1: number, y1: number, x2?: number, y2?: number,
              reflect?: boolean, epsilon?: number): LinearScale;

  interpolateTo(that: LinearScale): Interpolator<LinearScale>;
  interpolateTo(that: unknown): Interpolator<LinearScale> | null;

  canEqual(that: unknown): boolean;

  equals(that: unknown): boolean;

  toString(): string;
}

export const LinearScale = function (domain: LinearDomain, range: LinearRange): LinearScale {
  const scale = function (x: number): number {
    return scale.range(scale.domain(x));
  } as LinearScale;
  Object.setPrototypeOf(scale, LinearScale.prototype);
  (scale as Mutable<typeof scale>).domain = domain;
  (scale as Mutable<typeof scale>).range = range;
  return scale;
} as {
  (domain: LinearDomain, range: LinearRange): LinearScale;

  /** @hidden */
  prototype: LinearScale;
};

LinearScale.prototype = Object.create(ContinuousScale.prototype);

Object.defineProperty(LinearScale.prototype, "inverse", {
  get(this: LinearScale): LinearScale {
    return LinearScale(this.range.inverse, this.domain.inverse);
  },
  enumerable: true,
  configurable: true,
});

LinearScale.prototype.withDomain = function (x0: LinearDomain | number, x1?: number): LinearScale {
  let domain: LinearDomain;
  if (arguments.length === 1) {
    domain = x0 as LinearDomain;
  } else {
    domain = LinearDomain(x0 as number, x1!);
  }
  return LinearScale(domain, this.range);
};

LinearScale.prototype.overRange = function (y0: LinearRange | number, y1?: number): LinearScale {
  let range: LinearRange;
  if (arguments.length === 1) {
    range = y0 as LinearRange;
  } else {
    range = LinearRange(y0 as number, y1!);
  }
  return LinearScale(this.domain, range);
};

LinearScale.prototype.clampDomain = function (xMin: number | undefined, xMax: number | undefined,
                                              zMin: number | undefined, zMax: number | undefined,
                                              epsilon?: number): LinearScale {
  if (epsilon === void 0) {
    epsilon = Equivalent.Epsilon;
  }
  let x0 = this.domain[0];
  let x1 = this.domain[1];
  if (xMin !== void 0 && xMax !== void 0 && Math.abs(x1 - x0) > xMax - xMin) {
    if (x0 < x1) {
      x0 = xMin;
      x1 = xMax;
    } else {
      x1 = xMin;
      x0 = xMax;
    }
  } else {
    if (xMin !== void 0) {
      if (x0 < x1 && x0 < xMin) {
        x1 += xMin - x0;
        x0 = xMin;
      } else if (x1 < x0 && x1 < xMin) {
        x0 += xMin - x1;
        x1 = xMin;
      }
    }
    if (xMax !== void 0) {
      if (x0 < x1 && x1 > xMax) {
        x0 -= x1 - xMax;
        x1 = xMax;
      } else if (x1 < x0 && x0 > xMax) {
        x1 -= x0 - xMax;
        x0 = xMax;
      }
    }
  }

  const y0 = this(x0);
  const y1 = this(x1);
  const dy = y0 < y1 ? y1 - y0 : y0 - y1;
  const z = Math.abs(dy / (x1 - x0));
  if (zMin !== void 0 && z < 1 / zMin) {
    const dz = dy * zMin;
    const xSum = x0 + x1;
    x0 = (xSum - dz) / 2;
    x1 = (xSum + dz) / 2;
  } else if (zMax !== void 0 && z > 1 / zMax) {
    const dz = dy * zMax;
    const xSum = x0 + x1;
    x0 = (xSum - dz) / 2;
    x1 = (xSum + dz) / 2;
  }

  if (Math.abs(x0 - this.domain[0]) < epsilon && Math.abs(x1 - this.domain[1]) < epsilon) {
    return this;
  } else {
    return LinearScale(LinearDomain(x0, x1), this.range);
  }
};

LinearScale.prototype.solveDomain = function (x1: number, y1: number, x2?: number, y2?: number,
                                              reflect?: boolean, epsilon?: number): LinearScale {
  if (epsilon === void 0) {
    epsilon = Equivalent.Epsilon;
  }
  const dx = this.domain[1] - this.domain[0];
  const y0 = this.range[0];
  const y3 = this.range[1];
  let m: number;
  if (x2 === void 0 || y2 === void 0 || Math.abs(x2 - x1) < epsilon || Math.abs(y2 - y1) < epsilon) {
    m = (y3 - y0) / (dx !== 0 ? dx : epsilon);
  } else {
    m = (y2 - y1) / (x2 - x1);
    if ((reflect === void 0 || !reflect) && (m < 0 !== (y3 - y0) / dx < 0)) {
      m = -m;
    }
  }
  const b = y1 - m * x1;
  const x0 = (y0 - b) / m;
  const x3 = (y3 - b) / m;

  if (Math.abs(x0 - this.domain[0]) < epsilon && Math.abs(x3 - this.domain[1]) < epsilon) {
    return this;
  } else {
    return LinearScale(LinearDomain(x0, x3), this.range);
  }
};

LinearScale.prototype.interpolateTo = function (this: LinearScale, that: unknown): Interpolator<LinearScale> | null {
  if (that instanceof LinearScale) {
    return LinearScaleInterpolator(this, that);
  }
  return null;
} as typeof LinearScale.prototype.interpolateTo;

LinearScale.prototype.canEqual = function (that: unknown): boolean {
  return that instanceof LinearScale;
};

LinearScale.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof LinearScale) {
    return this.domain.equals(that.domain) && this.range.equals(that.range);
  }
  return false;
};

LinearScale.prototype.toString = function (): string {
  return "LinearScale(" + this.domain + ", " + this.range + ")";
};
