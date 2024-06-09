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

import type {Mutable} from "./types";
import {Domain} from "./Domain";
import type {Interpolate} from "./Interpolate";
import {Interpolator} from "./Interpolator";
import {LinearRange} from "./"; // forward import

/** @public */
export interface LinearDomain extends Domain<number>, Interpolate<LinearDomain> {
  /** @override */
  readonly 0: number;

  /** @override */
  readonly 1: number;

  readonly inverse: LinearRange;

  /** @override */
  contains(x: number): boolean;

  /** @override */
  union(that: Domain<number>): LinearDomain;

  /** @override */
  interpolateTo(that: LinearDomain): Interpolator<LinearDomain>;
  interpolateTo(that: unknown): Interpolator<LinearDomain> | null;

  /** @override */
  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

  /** @override */
  toString(): string;
}

/** @public */
export const LinearDomain = (function (_super: typeof Domain) {
  const LinearDomain = function (x0: number, x1: number): LinearDomain {
    const domain = function (x: number): number {
      const x0 = domain[0];
      const x1 = domain[1];
      const dx = x1 - x0;
      return dx !== 0 ? (x - x0) / dx : 0;
    } as LinearDomain;
    Object.setPrototypeOf(domain, LinearDomain.prototype);
    (domain as Mutable<typeof domain>)[0] = x0;
    (domain as Mutable<typeof domain>)[1] = x1;
    return domain;
  } as {
    (x0: number, x1: number): LinearDomain;

    /** @internal */
    prototype: LinearDomain;
  };

  LinearDomain.prototype = Object.create(_super.prototype);
  LinearDomain.prototype.constructor = LinearDomain;

  Object.defineProperty(LinearDomain.prototype, "inverse", {
    get(this: LinearDomain): LinearRange {
      return LinearRange(this[0], this[1]);
    },
    configurable: true,
  });

  LinearDomain.prototype.contains = function (x: number): boolean {
    return this[0] <= x && x <= this[1];
  };

  LinearDomain.prototype.union = function (that: Domain<number>): LinearDomain {
    return LinearDomain(Math.min(this[0], that[0]), Math.max(this[1], that[1]));
  };

  LinearDomain.prototype.interpolateTo = function (this: LinearDomain, that: unknown): Interpolator<LinearDomain> | null {
    if (that instanceof LinearDomain) {
      return LinearDomainInterpolator(this, that);
    }
    return null;
  } as typeof LinearDomain.prototype.interpolateTo;

  LinearDomain.prototype.canEqual = function (that: unknown): boolean {
    return that instanceof LinearDomain;
  };

  LinearDomain.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LinearDomain) {
      return that.canEqual(this) && this[0] === that[0] && this[1] === that[1];
    }
    return false;
  };

  LinearDomain.prototype.toString = function (): string {
    return "LinearDomain(" + this[0] + ", " + this[1] + ")";
  };

  return LinearDomain;
})(Domain);

/** @internal */
export const LinearDomainInterpolator = (function (_super: typeof Interpolator) {
  const LinearDomainInterpolator = function (x0: LinearDomain, x1: LinearDomain): Interpolator<LinearDomain> {
    const interpolator = function (u: number): LinearDomain {
      const x0 = interpolator[0];
      const x00 = x0[0];
      const x01 = x0[1];
      const x1 = interpolator[1];
      const x10 = x1[0];
      const x11 = x1[1];
      return LinearDomain(x00 + u * (x10 - x00), x01 + u * (x11 - x01));
    } as Interpolator<LinearDomain>;
    Object.setPrototypeOf(interpolator, LinearDomainInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = x0;
    (interpolator as Mutable<typeof interpolator>)[1] = x1;
    return interpolator;
  } as {
    (x0: LinearDomain, x1: LinearDomain): Interpolator<LinearDomain>;

    /** @internal */
    prototype: Interpolator<LinearDomain>;
  };

  LinearDomainInterpolator.prototype = Object.create(_super.prototype);
  LinearDomainInterpolator.prototype.constructor = LinearDomainInterpolator;

  return LinearDomainInterpolator;
})(Interpolator);
