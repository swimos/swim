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

import type {Mutable} from "../types/Mutable";
import {Mapping} from "./Mapping";
import type {Domain} from "./Domain";
import type {Range} from "./Range";

/** @public */
export interface Piecewise<X, Y> extends Mapping<X, Y> {
  readonly intervals: readonly Mapping<X, Y>[];

  interval(x: X): Mapping<X, Y>;

  /** @override */
  readonly domain: Domain<X>;

  /** @override */
  readonly range: Range<Y>;

  /** @override */
  equivalentTo(that: unknown, epsilon?: number): boolean;

  /** @override */
  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

  /** @override */
  toString(): string;
}

/** @public */
export const Piecewise = (function (_super: typeof Mapping) {
  const Piecewise = function <X, Y>(...intervals: readonly Mapping<X, Y>[]): Piecewise<X, Y> {
    const piecewise = function (x: X): Y {
      const interval = piecewise.interval(x);
      return interval(x);
    } as Piecewise<X, Y>;
    Object.setPrototypeOf(piecewise, Piecewise.prototype);
    const n = intervals.length;
    if (n === 0) {
      throw new Error("no piecewise intervals");
    }
    let interval = intervals[0]!;
    let domain = interval.domain;
    let range = interval.range;
    for (let i = 1; i < n; i += 1) {
      interval = intervals[i]!;
      domain = domain.union(interval.domain);
      range = range.union(interval.range);
    }
    (piecewise as Mutable<typeof piecewise>).intervals = intervals;
    (piecewise as Mutable<typeof piecewise>).domain = domain;
    (piecewise as Mutable<typeof piecewise>).range = range;
    return piecewise;
  } as {
    /** @internal */
    <X, Y>(...intervals: readonly Mapping<X, Y>[]): Piecewise<X, Y>;

    /** @internal */
    prototype: Piecewise<any, any>;
  };

  Piecewise.prototype = Object.create(_super.prototype);
  Piecewise.prototype.constructor = Piecewise;

  Piecewise.prototype.interval = function <X, Y>(this: Piecewise<X, Y>, x: X): Mapping<X, Y> {
    const intervals = this.intervals;
    let lo = 0;
    let hi = intervals.length - 1;
    let interval: Mapping<X, Y> | undefined;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      interval = intervals[mid]!;
      const domain = interval.domain;
      const u = domain(x);
      if (u < 0) {
        hi = mid - 1;
      } else if (u >= 1) {
        lo = mid + 1;
      } else {
        break;
      }
    }
    return interval!;
  };

  Piecewise.prototype.canEqual = function <X, Y>(this: Piecewise<X, Y>, that: unknown): boolean {
    return that instanceof Piecewise;
  };

  Piecewise.prototype.equals = function <X, Y>(this: Piecewise<X, Y>, that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Piecewise) {
      return this.domain.equals(that.domain) && this.range.equals(that.range);
    }
    return false;
  };

  Piecewise.prototype.toString = function <X, Y>(this: Piecewise<X, Y>): string {
    let s = "Piecewise(";
    const intervals = this.intervals;
    for (let i = 0, n = intervals.length; i < n; i += 1) {
      const interval = intervals[i]!;
      if (i !== 0) {
        s += ", ";
      }
      s += interval.toString();
    }
    s += ")";
    return s;
  };

  return Piecewise;
})(Mapping);
