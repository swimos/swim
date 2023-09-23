// Copyright 2015-2023 Nstream, inc.
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

import {Murmur3} from "./Murmur3";
import {Lazy} from "./Lazy";
import {Values} from "./"; // forward import

/**
 * Utilities for immutably updating, comparing, and hashing arrays.
 * @public
 */
export const Arrays = {
  empty: Lazy(function <T>(): readonly T[] {
    return Object.freeze([]);
  }) as <T>() => readonly T[],

  /**
   * Returns a copy of an array with the given element inserted, if the element
   * is not already present in the array; otherwise returns the input array if
   * it already contains the specified element.
   */
  inserted<T>(newElement: T, oldArray: readonly T[] | null | undefined): readonly T[] {
    const n = oldArray !== void 0 && oldArray !== null ? oldArray.length : 0;
    const newArray = new Array<T>(n + 1);
    for (let i = 0; i < n; i += 1) {
      const element = oldArray![i]!;
      if (element === newElement) {
        return oldArray!;
      }
      newArray[i] = element;
    }
    newArray[n] = newElement;
    return newArray;
  },

  /**
   * Returns a copy of an array with the given element removed; returns the
   * input array if it does not contain the specified element.
   */
  removed<T>(oldElement: T, oldArray: readonly T[] | null | undefined): readonly T[] {
    const n = oldArray !== void 0 && oldArray !== null ? oldArray.length : 0;
    if (n === 0) {
      return oldArray !== void 0 && oldArray !== null ? oldArray : Arrays.empty();
    } else if (n === 1) {
      return oldArray![0]! !== oldElement ? oldArray! : Arrays.empty();
    }
    const newArray = new Array<T>(n - 1);
    let i = 0;
    while (i < n) {
      const element = oldArray![i]!;
      if (element === oldElement) {
        i += 1;
        while (i < n) {
          newArray[i - 1] = oldArray![i]!;
          i += 1;
        }
        return newArray;
      }
      newArray[i] = element;
      i += 1;
    }
    return oldArray!;
  },

  /**
   * Returns `true` if `x` and `y` are structurally equal arrays; otherwise
   * returns `x === y` if either `x` or `y` is not an array.
   */
  equal(x: ArrayLike<unknown> | null | undefined, y: ArrayLike<unknown> | null | undefined): boolean {
    if (x === y) {
      return true;
    } else if (x !== null && typeof x === "object" && y !== null && typeof y === "object") {
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
  },

  /**
   * Returns `true` if `x` and `y` are structurally [[Equivalent.equivalentTo
   * equivalent]] arrays; otherwise returns `x === y` if either `x` or `y` is
   * not an array.
   */
  equivalent(x: ArrayLike<unknown> | null | undefined, y: ArrayLike<unknown> | null | undefined, epsilon?: number): boolean {
    if (x === y) {
      return true;
    } else if (x !== null && typeof x === "object" && y !== null && typeof y === "object") {
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
  },

  /**
   * Returns the relative order of `x` with respect to `y`. Returns `-1` if
   * the elements of array `x` order lexicographically before the elements of
   * array `y`; returns `1` if the elements of array `x` order lexicographically
   * after the elements of array `y`; and returns `0` if `x` and `y` are equal
   * arrays. If either `x` or `y` is `null` or `undefined`, then arrays order
   * before `null`, and `null` orders before `undefined`.
   */
  compare(x: ArrayLike<unknown> | null | undefined, y: ArrayLike<unknown> | null | undefined): number {
    if (x !== null && typeof x === "object") {
      if (y !== null && typeof y === "object") {
        if (x === y) {
          return 0;
        }
        const p = x.length;
        const q = y.length;
        let order = 0;
        for (let i = 0, n = Math.min(p, q); i < n && order === 0; i += 1) {
          order = Values.compare(x[i], y[i]);
        }
        return order !== 0 ? order : p > q ? 1 : p < q ? -1 : 0;
      }
      return -1;
    } else if (x === null) {
      return y === void 0 ? -1 : y === null ? 0 : 1;
    } else if (x === void 0) {
      return y === void 0 ? 0 : 1;
    }
    return NaN;
  },

  /**
   * Returns a 32-bit hash value for the elements of array `x`, if defined;
   * otherwise returns `0` or `1` if `x` is `undefined` or `null`, respectively.
   */
  hash(x: ArrayLike<unknown> | null | undefined): number {
    if (typeof x === "object" && x !== null) {
      let code = 0;
      for (let i = 0; i < x.length; i += 1) {
        code = Murmur3.mix(code, Values.hash(x[i]));
      }
      return Murmur3.mash(code);
    } else if (x === null) {
      return 1;
    } else if (x === void 0) {
      return 0;
    }
    throw new TypeError("" + x);
  },
};
