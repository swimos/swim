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

import type {Mutable} from "./types";
import {Equivalent} from "./Equivalent";
import type {Interpolate} from "./Interpolate";
import {Interpolator} from "./Interpolator";
import {ContinuousScale} from "./Scale";
import {LinearDomain} from "./LinearDomain";
import {LinearRange} from "./LinearRange";

/** @public */
export interface LinearScale extends ContinuousScale<number, number>, Interpolate<LinearScale> {
  /** @override */
  readonly domain: LinearDomain;

  /** @override */
  readonly range: LinearRange;

  /** @override */
  readonly inverse: LinearScale;

  /** @override */
  withDomain(domain: LinearDomain): LinearScale;
  withDomain(x0: number, x1: number): LinearScale;

  /** @override */
  overRange(range: LinearRange): LinearScale;
  overRange(y0: number, y1: number): LinearScale;

  /** @override */
  clampDomain(xMin: number | undefined, xMax: number | undefined,
              zMin: number | undefined, zMax: number | undefined,
              epsilon?: number): LinearScale;

  /** @override */
  solveDomain(x1: number, y1: number, x2?: number, y2?: number,
              reflect?: boolean, epsilon?: number): LinearScale;

  /** @override */
  interpolateTo(that: LinearScale): Interpolator<LinearScale>;
  interpolateTo(that: unknown): Interpolator<LinearScale> | null;

  /** @override */
  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

  /** @override */
  toString(): string;
}

/** @public */
export const LinearScale = (function (_super: typeof ContinuousScale) {
  const LinearScale = function (domain: LinearDomain, range: LinearRange): LinearScale {
    const scale = function (x: number): number {
      return scale.range(scale.domain(x));
    } as LinearScale;
    Object.setPrototypeOf(scale, LinearScale.prototype);
    (scale as Mutable<typeof scale>).domain = domain;
    (scale as Mutable<typeof scale>).range = range;
    return scale;
  } as {
    (domain: LinearDomain, range: LinearRange): LinearScale;

    /** @internal */
    prototype: LinearScale;
  };

  LinearScale.prototype = Object.create(_super.prototype);
  LinearScale.prototype.constructor = LinearScale;

  Object.defineProperty(LinearScale.prototype, "inverse", {
    get(this: LinearScale): LinearScale {
      return LinearScale(this.range.inverse, this.domain.inverse);
    },
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
    }
    return LinearScale(LinearDomain(x0, x1), this.range);
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
    }
    return LinearScale(LinearDomain(x0, x3), this.range);
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

  return LinearScale;
})(ContinuousScale);

/** @internal */
export const LinearScaleInterpolator = (function (_super: typeof Interpolator) {
  const LinearScaleInterpolator = function (s0: LinearScale, s1: LinearScale): Interpolator<LinearScale> {
    const interpolator = function (u: number): LinearScale {
      const s0 = interpolator[0];
      const s1 = interpolator[1];
      const x0 = s0.domain;
      const x00 = x0[0];
      const x01 = x0[1];
      const x1 = s1.domain;
      const x10 = x1[0];
      const x11 = x1[1];
      const domain = LinearDomain(x00 + u * (x10 - x00), x01 + u * (x11 - x01));
      const y0 = s0.range;
      const y00 = y0[0];
      const y01 = y0[1];
      const y1 = s1.range;
      const y10 = y1[0];
      const y11 = y1[1];
      const range = LinearRange(y00 + u * (y10 - y00), y01 + u * (y11 - y01));
      return LinearScale(domain, range);
    } as Interpolator<LinearScale>;
    Object.setPrototypeOf(interpolator, LinearScaleInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = s0;
    (interpolator as Mutable<typeof interpolator>)[1] = s1;
    return interpolator;
  } as {
    (s0: LinearScale, s1: LinearScale): Interpolator<LinearScale>;

    /** @internal */
    prototype: Interpolator<LinearScale>;
  };

  LinearScaleInterpolator.prototype = Object.create(_super.prototype);
  LinearScaleInterpolator.prototype.constructor = LinearScaleInterpolator;

  return LinearScaleInterpolator;
})(Interpolator);
