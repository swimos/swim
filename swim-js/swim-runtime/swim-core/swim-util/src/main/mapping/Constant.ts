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
import {Values} from "../values/Values";
import {Range} from "../mapping/Range";

/** @public */
export interface Constant<Y> extends Range<Y> {
  readonly value: Y;

  /** @override */
  readonly 0: Y;

  /** @override */
  readonly 1: Y;

  /** @override */
  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

  /** @override */
  toString(): string;
}

/** @public */
export const Constant = (function (_super: typeof Range) {
  const Constant = function <Y>(value: Y): Constant<Y> {
    const range = function (u: number): Y {
      return range.value;
    } as Constant<Y>;
    Object.setPrototypeOf(range, Constant.prototype);
    (range as Mutable<typeof range>).value = value;
    return range;
  } as {
    <Y>(value: Y): Constant<Y>;

    /** @internal */
    prototype: Constant<any>;
  };

  Constant.prototype = Object.create(_super.prototype);
  Constant.prototype.constructor = Constant;

  Object.defineProperty(Constant.prototype, 0, {
    get<Y>(this: Constant<Y>): Y {
      return this.value;
    },
    configurable: true,
  });

  Object.defineProperty(Constant.prototype, 1, {
    get<Y>(this: Constant<Y>): Y {
      return this.value;
    },
    configurable: true,
  });

  Constant.prototype.canEqual = function (that: unknown): boolean {
    return that instanceof Constant;
  };

  Constant.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Constant) {
      return that.canEqual(this) && Values.equal(this.value, that.value);
    }
    return false;
  };

  Constant.prototype.toString = function (): string {
    return "Constant(" + this.value + ")";
  };

  return Constant;
})(Range);
