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
import {Strings} from "./Strings";
import {Values} from "./Values";

/**
 * Utilities for comparing and hashing structural objects.
 * @public
 */
export const Objects = (function () {
  const Objects = {} as {
    /**
     * Returns `true` if `x` and `y` are structurally equal objects; otherwise
     * returns `x === y` if either `x` or `y` is not an object.
     */
    equal(x: object | null | undefined, y: object | null | undefined): boolean;

    /**
     * Returns `true` if `x` and `y` are structurally [[Equivalent.equivalentTo
     * equivalent]] objects; otherwise returns `x === y` if either `x` or `y` is
     * not an object.
     */
    equivalent(x: object | null | undefined, y: object | null | undefined, epsilon?: number): boolean;

    /**
     * Returns the relative order of `x` with respect to `y`. Returns `-1` if
     * the entries of object `x` order lexicographically before the entries of
     * object `y`; returns `1` if the entries of object `x` order
     * lexicographically after the entries of object `y`; and returns `0` if `x`
     * and `y` are equal objects. If either `x` or `y` is `null` or `undefined`,
     * then objects order before `null`, and `null` orders before `undefined`.
     */
    compare(x: object | null | undefined, y: object | null | undefined): number;

    /**
     * Returns a 32-bit hash value for the entries of object `x`, if defined;
     * otherwise returns `0` or `1` if `x` is `undefined` or `null`, respectively.
     */
    hash(x: object | null | undefined): number;
  };

  Objects.equal = function (x: object | null | undefined, y: object | null | undefined): boolean {
    if (x === y) {
      return true;
    } else if (typeof x === "object" && x !== null && typeof y === "object" && y !== null) {
      const xKeys = Object.keys(x);
      const yKeys = Object.keys(y);
      const n = xKeys.length;
      if (n !== yKeys.length) {
        return false;
      }
      for (let i = 0; i < n; i += 1) {
        const key = xKeys[i]!;
        if (key !== yKeys[i] || !Values.equal((x as any)[key], (y as any)[key])) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  Objects.equivalent = function (x: object | null | undefined, y: object | null | undefined, epsilon?: number): boolean {
    if (x === y) {
      return true;
    } else if (typeof x === "object" && x !== null && typeof y === "object" && y !== null) {
      const xKeys = Object.keys(x);
      const yKeys = Object.keys(y);
      const n = xKeys.length;
      if (n !== yKeys.length) {
        return false;
      }
      for (let i = 0; i < n; i += 1) {
        const key = xKeys[i]!;
        if (key !== yKeys[i] || !Values.equivalent((x as any)[key], (y as any)[key], epsilon)) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  Objects.compare = function (x: object | null | undefined, y: object | null | undefined): number {
    if (typeof x === "object" && x !== null) {
      if (typeof y === "object" && y !== null) {
        if (x !== y) {
          const xKeys = Object.keys(x);
          const yKeys = Object.keys(y);
          const p = xKeys.length;
          const q = yKeys.length;
          const n = Math.min(p, q);
          let order = 0;
          for (let i = 0; i < n && order === 0; i += 1) {
            const xKey = xKeys[i]!;
            const yKey = yKeys[i]!;
            order = Strings.compare(xKey, yKey);
            if (order === 0) {
              order = Values.compare((x as any)[xKey], (y as any)[yKey]);
            }
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

  Objects.hash = function (x: object | null | undefined): number {
    if (typeof x === "object" && x !== null) {
      let hashValue = 0;
      const keys = Object.keys(x);
      for (let i = 0, n = keys.length; i < n; i += 1) {
        const key = keys[i]!;
        hashValue = Murmur3.mix(Murmur3.mix(hashValue, Strings.hash(key)), Values.hash((x as any)[key]));
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

  return Objects;
})();
