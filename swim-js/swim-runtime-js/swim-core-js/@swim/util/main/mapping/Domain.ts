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
import {Values} from "../runtime/Values";
import {Mapping} from "./Mapping";
import {Range} from "../"; // forward import
import {LinearDomain} from "../"; // forward import
import type {LinearRange} from "../scale/LinearRange";

export type AnyDomain<X> = Domain<X> | readonly [X, X];

export interface Domain<X> extends Mapping<X, number> {
  readonly 0: X;

  readonly 1: X;

  readonly domain: this;

  readonly range: LinearRange;

  contains(x: X): boolean;

  equivalentTo(that: unknown, epsilon?: number): boolean;

  canEqual(that: unknown): boolean;

  equals(that: unknown): boolean;

  toString(): string;
}

export const Domain = function <X>(x0: X, x1: X): Domain<X> {
  const domain = function (x: X): number {
    return Values.equal(x, domain[1]) ? 1 : 0;
  } as Domain<X>;
  Object.setPrototypeOf(domain, Domain.prototype);
  (domain as Mutable<typeof domain>)[0] = x0;
  (domain as Mutable<typeof domain>)[1] = x1;
  return domain;
} as {
  <X>(x0: X, x1: X): Domain<X>;

  /** @hidden */
  prototype: Domain<any>;

  readonly unit: LinearDomain;
};

Domain.prototype = Object.create(Mapping.prototype);

Object.defineProperty(Domain.prototype, "domain", {
  get<X>(this: Domain<X>): Domain<X> {
    return this;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(Domain.prototype, "range", {
  get(): LinearRange {
    return Range.unit;
  },
  enumerable: true,
  configurable: true,
});

Domain.prototype.contains = function (x: unknown): boolean {
  return Values.compare(this[0], x) <= 0 && Values.compare(x, this[1]) <= 0;
};

Domain.prototype.equivalentTo = function (that: unknown, epsilon?: number): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof Domain) {
    return Values.equivalent(this[0], that[0], epsilon)
        && Values.equivalent(this[1], that[1], epsilon);
  }
  return false;
};

Domain.prototype.canEqual = function (that: unknown): boolean {
  return that instanceof Domain;
};

Domain.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof Domain) {
    return that.canEqual(this)
        && Values.equal(this[0], that[0])
        && Values.equal(this[1], that[1]);
  }
  return false;
};

Domain.prototype.toString = function (): string {
  return "Domain(" + this[0] + ", " + this[1] + ")";
};

Object.defineProperty(Domain, "unit", {
  get(): Domain<number> {
    const value = LinearDomain(0, 1);
    Object.defineProperty(Domain, "unit", {
      value: value,
      enumerable: true,
      configurable: true,
    });
    return value;
  },
  enumerable: true,
  configurable: true,
});
