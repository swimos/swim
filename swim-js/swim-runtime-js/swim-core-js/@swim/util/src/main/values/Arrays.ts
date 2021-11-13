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

import {Murmur3} from "../runtime/Murmur3";
import {Values} from "./Values";

/**
 * Utilities for immutably updating, comparing, and hashing arrays.
 */
export const Arrays = (function () {
  const Arrays = {} as {
    readonly empty: ReadonlyArray<never>;

    /**
     * Returns a copy of an array with the given element inserted, if the element
     * is not already present in the arrary; otherwise returns the input array if
     * it already containts the specified element.
     */
    inserted<T>(newElement: T, oldArray: ReadonlyArray<T> | null | undefined): ReadonlyArray<T>;

    /**
     * Returns a copy of an array with the given element removed; returns the
     * input array if it does not contain the specified element.
     */
    removed<T>(oldElement: T, oldArray: ReadonlyArray<T> | null | undefined): ReadonlyArray<T>;

    /**
     * Returns `true` if `x` and `y` are structurally equal arrays; otherwise
     * returns `x === y` if either `x` or `y` is not an array.
     */
    equal(x: ArrayLike<unknown> | null | undefined, y: ArrayLike<unknown> | null | undefined): boolean;

    /**
     * Returns `true` if `x` and `y` are structurally [[Equivalent.equivalentTo
     * equivalent]] arrays; otherwise returns `x === y` if either `x` or `y` is
     * not an array.
     */
    equivalent(x: ArrayLike<unknown> | null | undefined, y: ArrayLike<unknown> | null | undefined, epsilon?: number): boolean;

    /**
     * Returns the relative order of `x` with respect to `y`.  Returns `-1` if
     * the elements of array `x` order lexicographically before the elements of
     * array `y`; returns `1` if the elements of array `x` order lexicographically
     * after the elements of array `y`; and returns `0` if `x` and `y` are equal
     * arrays.  If either `x` or `y` is `null` or `undefined`, then arrays order
     * before `null`, and `null` orders before `undefined`.
     */
    compare(x: ArrayLike<unknown> | null | undefined, y: ArrayLike<unknown> | null | undefined): number;

    /**
     * Returns a 32-bit hash value for the elements of array `x`, if defined;
     * otherwise returns `0` or `1` if `x` is `undefined` or `null`, respectively.
     */
    hash(x: ArrayLike<unknown> | null | undefined): number;
  };

  Object.defineProperty(Arrays, "empty", {
    value: Object.freeze([]),
    enumerable: true,
    configurable: true,
  });

  Arrays.inserted = function <T>(newElement: T, oldArray: ReadonlyArray<T> | null | undefined): ReadonlyArray<T> {
    const n = oldArray !== void 0 && oldArray !== null ? oldArray.length : 0;
    const newArray = new Array<T>(n + 1);
    for (let i = 0; i < n; i += 1) {
      const element = oldArray![i]!;
      if (element !== newElement) {
        newArray[i] = element;
      } else {
        return oldArray!;
      }
    }
    newArray[n] = newElement;
    return newArray
  };

  Arrays.removed = function <T>(oldElement: T, oldArray: ReadonlyArray<T> | null | undefined): ReadonlyArray<T> {
    const n = oldArray !== void 0 && oldArray !== null ? oldArray.length : 0;
    if (n === 0) {
      return oldArray !== void 0 && oldArray !== null ? oldArray : Arrays.empty;
    } else if (n === 1) {
      return oldArray![0]! !== oldElement ? oldArray! : Arrays.empty;
    } else {
      const newArray = new Array<T>(n - 1);
      let i = 0;
      while (i < n) {
        const element = oldArray![i]!;
        if (element !== oldElement) {
          newArray[i] = element;
          i += 1;
        } else {
          i += 1;
          while (i < n) {
            newArray[i - 1] = oldArray![i]!;
            i += 1
          }
          return newArray;
        }
      }
      return oldArray!;
    }
  };

  Arrays.equal = function (x: ArrayLike<unknown> | null | undefined, y: ArrayLike<unknown> | null | undefined): boolean {
    if (x === y) {
      return true;
    } else if (typeof x === "object" && x !== null && typeof y === "object" && y !== null) {
      const n = x.length;
      if (n !== y.length) {
        return false;
      }
      for (let i = 0; i < n; i += 1) {
        if (!Values.equal(x[i], y[i])) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  Arrays.equivalent = function (x: ArrayLike<unknown> | null | undefined, y: ArrayLike<unknown> | null | undefined, epsilon?: number): boolean {
    if (x === y) {
      return true;
    } else if (typeof x === "object" && x !== null && typeof y === "object" && y !== null) {
      const n = x.length;
      if (n !== y.length) {
        return false;
      }
      for (let i = 0; i < n; i += 1) {
        if (!Values.equivalent(x[i], y[i], epsilon)) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  Arrays.compare = function (x: ArrayLike<unknown> | null | undefined, y: ArrayLike<unknown> | null | undefined): number {
    if (typeof x === "object" && x !== null) {
      if (typeof y === "object" && y !== null) {
        if (x !== y) {
          const p = x.length as number;
          const q = y.length as number;
          let order = 0;
          for (let i = 0, n = Math.min(p, q); i < n && order === 0; i += 1) {
            order = Values.compare(x[i], y[i]);
          }
          return order !== 0 ? order : p > q ? 1 : p < q ? -1 : 0;
        } else {
          return 0;
        }
      } else {
        return -1;
      }
    } else if (x === null) {
      return y === void 0 ? -1 : y === null ? 0 : 1;
    } else if (x === void 0) {
      return y === void 0 ? 0 : 1;
    } else {
      return NaN;
    }
  };

  Arrays.hash = function (x: ArrayLike<unknown> | null | undefined): number {
    if (typeof x === "object" && x !== null) {
      let hashValue = 0;
      for (let i = 0, n = x.length; i < n; i += 1) {
        hashValue = Murmur3.mix(hashValue, Values.hash(x[i]));
      }
      return Murmur3.mash(hashValue);
    } else if (x === null) {
      return 1;
    } else if (x === void 0) {
      return 0;
    } else {
      throw new TypeError("" + x);
    }
  };

  return Arrays;
})();
