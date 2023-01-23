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
import type {Equals} from "../compare/Equals";
import type {Equivalent} from "../compare/Equivalent";
import type {Domain} from "./Domain";
import type {Range} from "./Range";

/** @public */
export interface Mapping<X, Y> extends Equals, Equivalent {
  (x: X): Y;

  readonly domain: Domain<X>;

  readonly range: Range<Y>;

  /** @override */
  equivalentTo(that: unknown, epsilon?: number): boolean;

  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

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

  Mapping.prototype.equivalentTo = function <X, Y>(this: Mapping<X, Y>, that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Mapping) {
      return this.domain.equivalentTo(that.domain, epsilon)
          && this.range.equivalentTo(that.range, epsilon);
    }
    return false;
  };

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

  Mapping.prototype.toString = function <X, Y>(this: Mapping<X, Y>): string {
    return "Mapping(" + this.domain + ", " + this.range + ")";
  };

  return Mapping;
})(Function);
