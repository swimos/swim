// Copyright 2015-2022 Swim.inc
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

import type {Mapping} from "../mapping/Mapping";
import type {Domain} from "../mapping/Domain";
import type {Range} from "../mapping/Range";
import {Scale} from "./Scale";

/** @public */
export interface ContinuousScale<X, Y> extends Scale<X, Y> {
  /** @override */
  readonly inverse: Mapping<Y, X>;

  /** @override */
  withDomain(domain: Domain<X>): ContinuousScale<X, Y>;
  withDomain(x0: X, x1: X): ContinuousScale<X, Y>;

  /** @override */
  overRange(range: Range<Y>): ContinuousScale<X, Y>;
  overRange(y0: Y, y1: Y): ContinuousScale<X, Y>;

  clampDomain(xMin: X | undefined, xMax: X | undefined,
              zMin: number | undefined, zMax: number | undefined,
              epsilon?: number): ContinuousScale<X, Y>;

  solveDomain(x1: X, y1: Y, x2?: X, y2?: Y,
              reflect?: boolean, epsilon?: number): ContinuousScale<X, Y>;

  /** @override */
  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

  /** @override */
  toString(): string;
}

/** @public */
export const ContinuousScale = (function (_super: typeof Scale) {
  const ContinuousScale = function (): never {
    throw new Error();
  } as {
    /** @internal */
    (): never;

    /** @internal */
    prototype: ContinuousScale<any, any>;
  };

  ContinuousScale.prototype = Object.create(_super.prototype);
  ContinuousScale.prototype.constructor = ContinuousScale;

  ContinuousScale.prototype.canEqual = function (that: unknown): boolean {
    return that instanceof ContinuousScale;
  };

  ContinuousScale.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ContinuousScale) {
      return this.domain.equals(that.domain) && this.range.equals(that.range);
    }
    return false;
  };

  ContinuousScale.prototype.toString = function (): string {
    return "ContinuousScale(" + this.domain + ", " + this.range + ")";
  };

  return ContinuousScale;
})(Scale);
