// Copyright 2015-2020 Swim inc.
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

import {Values} from "@swim/util";
import {Mapping} from "./Mapping";
import {Domain} from "../"; // forward import
import type {LinearDomain} from "../scale/LinearDomain";
import {LinearRange} from "../"; // forward import

export type AnyRange<Y> = Range<Y> | readonly [Y, Y];

export interface Range<Y> extends Mapping<number, Y> {
  readonly 0: Y;

  readonly 1: Y;

  readonly domain: LinearDomain;

  readonly range: this;

  equivalentTo(that: unknown, epsilon?: number): boolean;

  canEqual(that: unknown): boolean;

  equals(that: unknown): boolean;

  toString(): string;
}

export const Range = function <Y>(y0: Y, y1: Y): Range<Y> {
  const range = function (u: number): Y {
    return u < 1 ? range[0] : range[1];
  } as Range<Y>;
  Object.setPrototypeOf(range, Range.prototype);
  Object.defineProperty(range, 0, {
    value: y0,
    enumerable: true,
  });
  Object.defineProperty(range, 1, {
    value: y1,
    enumerable: true,
  });
  return range;
} as {
  <Y>(y0: Y, y1: Y): Range<Y>;

  /** @hidden */
  prototype: Range<any>;

  readonly unit: LinearRange;
};

Range.prototype = Object.create(Mapping.prototype);

Object.defineProperty(Range.prototype, "domain", {
  get(): LinearDomain {
    return Domain.unit;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(Range.prototype, "range", {
  get<Y>(this: Range<Y>): Range<Y> {
    return this;
  },
  enumerable: true,
  configurable: true,
});

Range.prototype.equivalentTo = function (that: unknown, epsilon?: number): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof Range) {
    return Values.equivalent(this[0], that[0], epsilon)
        && Values.equivalent(this[1], that[1], epsilon);
  }
  return false;
};

Range.prototype.canEqual = function (that: unknown): boolean {
  return that instanceof Range;
};

Range.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof Range) {
    return that.canEqual(this)
        && Values.equal(this[0], that[0])
        && Values.equal(this[1], that[1]);
  }
  return false;
};

Range.prototype.toString = function (): string {
  return "Range(" + this[0] + ", " + this[1] + ")";
};

Object.defineProperty(Range, "unit", {
  get(): LinearRange {
    const value = LinearRange(0, 1);
    Object.defineProperty(Range, "unit", {
      value: value,
      enumerable: true,
      configurable: true,
    });
    return value;
  },
  enumerable: true,
  configurable: true,
});
