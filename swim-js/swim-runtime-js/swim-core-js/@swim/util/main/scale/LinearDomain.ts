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

import type {Mutable} from "../lang/Mutable";
import {Domain} from "../mapping/Domain";
import type {Interpolate} from "../interpolate/Interpolate";
import type {Interpolator} from "../interpolate/Interpolator";
import {LinearDomainInterpolator} from "../"; // forward import
import {LinearRange} from "../"; // forward import

export interface LinearDomain extends Domain<number>, Interpolate<LinearDomain> {
  readonly 0: number;

  readonly 1: number;

  readonly inverse: LinearRange;

  contains(x: number): boolean;

  interpolateTo(that: LinearDomain): Interpolator<LinearDomain>;
  interpolateTo(that: unknown): Interpolator<LinearDomain> | null;

  canEqual(that: unknown): boolean;

  equals(that: unknown): boolean;

  toString(): string;
}

export const LinearDomain = function (x0: number, x1: number): LinearDomain {
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

  /** @hidden */
  prototype: LinearDomain;
};

LinearDomain.prototype = Object.create(Domain.prototype);

Object.defineProperty(LinearDomain.prototype, "inverse", {
  get(this: LinearDomain): LinearRange {
    return LinearRange(this[0], this[1]);
  },
  enumerable: true,
  configurable: true,
});

LinearDomain.prototype.contains = function (x: number): boolean {
  return this[0] <= x && x <= this[1];
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
