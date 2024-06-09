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
import type {Equals} from "./Equals";
import type {Equivalent} from "./Equivalent";
import type {Domain} from "./Domain";
import type {Range} from "./Range";

/** @public */
export interface Mapping<X, Y> extends Equals, Equivalent {
  (x: X): Y;

  readonly domain: Domain<X>;

  readonly range: Range<Y>;

  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

  /** @override */
  equivalentTo(that: unknown, epsilon?: number): boolean;

  /** @override */
  toString(): string;
}

/** @public */
export const Mapping = (function (_super: typeof Function) {
  const Mapping = function <X, Y>(domain: Domain<X>, range: Range<Y>): Mapping<X, Y> {
    const mapping = function (x: X): Y {
      return mapping.range(mapping.domain(x));
    } as Mapping<X, Y>;
    Object.setPrototypeOf(mapping, Mapping.prototype);
    (mapping as Mutable<typeof mapping>).domain = domain;
    (mapping as Mutable<typeof mapping>).range = range;
    return mapping;
  } as {
    <X, Y>(domain: Domain<X>, range: Range<Y>): Mapping<X, Y>;

    /** @internal */
    prototype: Mapping<any, any>;
  };

  Mapping.prototype = Object.create(_super.prototype);
  Mapping.prototype.constructor = Mapping;

  Mapping.prototype.canEqual = function <X, Y>(this: Mapping<X, Y>, that: unknown): boolean {
    return that instanceof Mapping;
  };

  Mapping.prototype.equals = function <X, Y>(this: Mapping<X, Y>, that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Mapping) {
      return that.canEqual(this)
          && this.domain.equals(that.domain)
          && this.range.equals(that.range);
    }
    return false;
  };

  Mapping.prototype.equivalentTo = function <X, Y>(this: Mapping<X, Y>, that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Mapping) {
      return this.domain.equivalentTo(that.domain, epsilon)
          && this.range.equivalentTo(that.range, epsilon);
    }
    return false;
  };

  Mapping.prototype.toString = function <X, Y>(this: Mapping<X, Y>): string {
    return "Mapping(" + this.domain + ", " + this.range + ")";
  };

  return Mapping;
})(Function);

/** @public */
export interface Piecewise<X, Y> extends Mapping<X, Y> {
  readonly intervals: readonly Mapping<X, Y>[];

  interval(x: X): Mapping<X, Y>;

  /** @override */
  readonly domain: Domain<X>;

  /** @override */
  readonly range: Range<Y>;

  /** @override */
  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

  /** @override */
  equivalentTo(that: unknown, epsilon?: number): boolean;

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
      return that.canEqual(this)
          && this.domain.equals(that.domain)
          && this.range.equals(that.range);
    }
    return false;
  };

  Piecewise.prototype.toString = function <X, Y>(this: Piecewise<X, Y>): string {
    let s = "Piecewise(";
    const intervals = this.intervals;
    for (let i = 0; i < intervals.length; i += 1) {
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
