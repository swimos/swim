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
import {Values} from "../values/Values";
import {Mapping} from "./Mapping";
import {Range} from "../"; // forward import
import {LinearDomain} from "../"; // forward import
import type {LinearRange} from "../scale/LinearRange";

/** @public */
export type AnyDomain<X> = Domain<X> | readonly [X, X];

/** @public */
export interface Domain<X> extends Mapping<X, number> {
  readonly 0: X;

  readonly 1: X;

  /** @override */
  readonly domain: this;

  /** @override */
  readonly range: LinearRange;

  contains(x: X): boolean;

  union(that: Domain<X>): Domain<X>;

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
export const Domain = (function (_super: typeof Mapping) {
  const Domain = function <X>(x0: X, x1: X): Domain<X> {
    const domain = function (x: X): number {
      return Values.equal(x, domain[1]) ? 1 : 0;
    } as Domain<X>;
    Object.setPrototypeOf(domain, Domain.prototype);
    (domain as Mutable<typeof domain>)[0] = x0;
    (domain as Mutable<typeof domain>)[1] = x1;
    return domain;
  } as {
    <X>(x0: X, x1: X): Domain<X>;

    /** @internal */
    prototype: Domain<any>;

    readonly unit: LinearDomain;
  };

  Domain.prototype = Object.create(_super.prototype);
  Domain.prototype.constructor = Domain;

  Object.defineProperty(Domain.prototype, "domain", {
    get<X>(this: Domain<X>): Domain<X> {
      return this;
    },
    configurable: true,
  });

  Object.defineProperty(Domain.prototype, "range", {
    get<X>(this: Domain<X>): LinearRange {
      return Range.unit;
    },
    configurable: true,
  });

  Domain.prototype.contains = function <X>(this: Domain<X>, x: X): boolean {
    return Values.compare(this[0], x) <= 0 && Values.compare(x, this[1]) <= 0;
  };

  Domain.prototype.union = function <X>(this: Domain<X>, that: Domain<X>): Domain<X> {
    const x00 = this[0];
    const x01 = this[1];
    const x10 = that[0];
    const x11 = that[1];
    const x0 = Values.compare(x00, x10) <= 0 ? x00 : x10;
    const x1 = Values.compare(x01, x11) >= 0 ? x01 : x11;
    return Domain(x0, x1);
  };

  Domain.prototype.equivalentTo = function <X>(this: Domain<X>, that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Domain) {
      return Values.equivalent(this[0], that[0], epsilon)
          && Values.equivalent(this[1], that[1], epsilon);
    }
    return false;
  };

  Domain.prototype.canEqual = function <X>(this: Domain<X>, that: unknown): boolean {
    return that instanceof Domain;
  };

  Domain.prototype.equals = function <X>(this: Domain<X>, that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Domain) {
      return that.canEqual(this)
          && Values.equal(this[0], that[0])
          && Values.equal(this[1], that[1]);
    }
    return false;
  };

  Domain.prototype.toString = function <X>(this: Domain<X>): string {
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

  return Domain;
})(Mapping);
