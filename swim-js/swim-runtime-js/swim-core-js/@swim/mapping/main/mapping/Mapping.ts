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

import type {Equals, Equivalent, Mutable} from "@swim/util";
import type {Domain} from "./Domain";
import type {Range} from "./Range";
 
export interface Mapping<X, Y> extends Equals, Equivalent {
  (x: X): Y;

  readonly domain: Domain<X>;

  readonly range: Range<Y>;

  equivalentTo(that: unknown, epsilon?: number): boolean;

  canEqual(that: unknown): boolean;

  equals(that: unknown): boolean;

  toString(): string;
}

export const Mapping = function <X, Y>(domain: Domain<X>, range: Range<Y>): Mapping<X, Y> {
  const mapping = function (x: X): Y {
    return mapping.range(mapping.domain(x));
  } as Mapping<X, Y>;
  Object.setPrototypeOf(mapping, Mapping.prototype);
  (mapping as Mutable<typeof mapping>).domain = domain;
  (mapping as Mutable<typeof mapping>).range = range;
  return mapping;
} as {
  <X, Y>(domain: Domain<X>, range: Range<Y>): Mapping<X, Y>;

  /** @hidden */
  prototype: Mapping<any, any>;
};

Mapping.prototype = Object.create(Object.prototype);

Mapping.prototype.equivalentTo = function (that: unknown, epsilon?: number): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof Mapping) {
    return this.domain.equivalentTo(that.domain, epsilon)
        && this.range.equivalentTo(that.range, epsilon);
  }
  return false;
};

Mapping.prototype.canEqual = function (that: unknown): boolean {
  return that instanceof Mapping;
};

Mapping.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof Mapping) {
    return that.canEqual(this)
        && this.domain.equals(that.domain)
        && this.range.equals(that.range);
  }
  return false;
};

Mapping.prototype.toString = function (): string {
  return "Mapping(" + this.domain + ", " + this.range + ")";
};
