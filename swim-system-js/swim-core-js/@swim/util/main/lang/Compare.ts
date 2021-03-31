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

/**
 * Type that implements a universal partial order.
 */
export interface Compare {
  /**
   * Returns the relative order of `this` with respect to `that`.  Returns `-1`
   * if `this` orders before `that`; returns `1` if `this` orders after `that`;
   * returns `0` if `this` and `that` are equivalent; and returns `NaN` if
   * `this` is not comparable to `that`.
   */
  compareTo(that: unknown): number;
}

export const Compare = function (x: unknown, y: unknown): number {
  if (x === void 0) {
    if (y === void 0) {
      return 0;
    } else {
      return 1;
    }
  } else if (x === null) {
    if (y === void 0) {
      return -1;
    } else if (y === null) {
      return 0;
    } else {
      return 1;
    }
  } else if (typeof (x as Compare).compareTo === "function") {
    if (y === void 0 || y === null) {
      return -1;
    } else {
      return (x as Compare).compareTo(y);
    }
  } else {
    return NaN;
  }
} as {
  /**
   * Returns the relative order of `x` with respect to `y`. Returns `-1` if `x`
   * orders before `y`; returns `1` if `x` orders after `y`; returns `0` if `x`
   * and `y` are equivalent; and returns `NaN` if `x` is not comparable to `y`.
   * Objects are [[Compare.compareTo compared to]] each other when both are
   * defined, otherwise defined objects order before `null`, and `null` orders
   * before `undefined`.
   */
  (x: unknown, y: unknown): number;

  /**
   * Returns `true` if `object` conforms to the [[Compare]] interface.
   */
  is(object: unknown): object is Compare;
};

Compare.is = function (object: unknown): object is Compare {
  return object !== void 0 && object !== null
      && typeof (object as Compare).compareTo === "function";
};
