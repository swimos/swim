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

import type {Mutable} from "../types/Mutable";
import {Range} from "../mapping/Range";
import type {Interpolate} from "../interpolate/Interpolate";
import type {Interpolator} from "../interpolate/Interpolator";
import {LinearDomain} from "../"; // forward import
import {LinearRangeInterpolator} from "../"; // forward import

/** @public */
export interface LinearRange extends Range<number>, Interpolate<LinearRange> {
  /** @override */
  readonly 0: number;

  /** @override */
  readonly 1: number;

  readonly inverse: LinearDomain;

  /** @override */
  union(that: Range<number>): LinearRange;

  /** @override */
  interpolateTo(that: LinearRange): Interpolator<LinearRange>;
  interpolateTo(that: unknown): Interpolator<LinearRange> | null;

  /** @override */
  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

  /** @override */
  toString(): string;
}

/** @public */
export const LinearRange = (function (_super: typeof Range) {
  const LinearRange = function (y0: number, y1: number): LinearRange {
    const range = function (u: number): number {
      const y0 = range[0];
      const y1 = range[1];
      return y0 + u * (y1 - y0);
    } as LinearRange;
    Object.setPrototypeOf(range, LinearRange.prototype);
    (range as Mutable<typeof range>)[0] = y0;
    (range as Mutable<typeof range>)[1] = y1;
    return range;
  } as {
    (y0: number, y1: number): LinearRange;

    /** @internal */
    prototype: LinearRange;
  };

  LinearRange.prototype = Object.create(_super.prototype);
  LinearRange.prototype.constructor = LinearRange;

  Object.defineProperty(LinearRange.prototype, "inverse", {
    get(this: LinearRange): LinearDomain {
      return LinearDomain(this[0], this[1]);
    },
    configurable: true,
  });

  LinearRange.prototype.union = function (that: Range<number>): LinearRange {
    const y00 = this[0];
    const y01 = this[1];
    const y10 = that[0];
    const y11 = that[1];
    let y0: number;
    let y1: number;
    if (y00 <= y01 && y10 <= y11) {
      y0 = Math.min(y00, y10);
      y1 = Math.max(y01, y11);
    } else if (y00 >= y01 && y10 >= y11) {
      y0 = Math.max(y00, y10);
      y1 = Math.min(y01, y11);
    } else if (y00 <= y01 && y10 >= y11) {
      y0 = Math.min(y00, y11);
      y1 = Math.max(y01, y10);
    } else { // y00 >= y01 && y10 <= y11
      y0 = Math.min(y01, y10);
      y1 = Math.max(y00, y11);
    }
    return LinearRange(y0, y1);
  };

  LinearRange.prototype.interpolateTo = function (this: LinearRange, that: unknown): Interpolator<LinearRange> | null {
    if (that instanceof LinearRange) {
      return LinearRangeInterpolator(this, that);
    }
    return null;
  } as typeof LinearRange.prototype.interpolateTo;

  LinearRange.prototype.canEqual = function (that: unknown): boolean {
    return that instanceof LinearRange;
  };

  LinearRange.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LinearRange) {
      return that.canEqual(this) && this[0] === that[0] && this[1] === that[1];
    }
    return false;
  };

  LinearRange.prototype.toString = function (): string {
    return "LinearRange(" + this[0] + ", " + this[1] + ")";
  };

  return LinearRange;
})(Range);
