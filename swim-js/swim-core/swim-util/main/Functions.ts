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

/**
 * Utilities for comparing and hashing functions.
 * @public
 */
export const Functions = {
  /**
   * Returns the relative order of `x` with respect to `y`. Returns `-1` if
   * the hash code of function `x` is less than the hash code of function `y`;
   * returns `1` if the hash code of function `x` is greater than the hash code
   * of function `y`; and returns `0` if `x` and `y` are identical functions.
   * If either `x` or `y` is `null` or `undefined`, then functions order before
   * `null`, and `null` orders before `undefined`.
   */
  compare(x: Function | null | undefined, y: Function | null | undefined): number {
    if (typeof x === "function") {
      if (typeof y === "function") {
        const xh = Functions.hash(x);
        const yh = Functions.hash(y);
        return xh < yh ? -1 : xh > yh ? 1 : 0;
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
   * Returns a 32-bit hash value for a function.
   */
  hash: (function () {
    let codes: WeakMap<Function, number> | null = null;
    let nextCode = 2;
    return function hash(x: Function | null | undefined): number {
      if (typeof x === "function") {
        if (codes === null) {
          codes = new WeakMap<Function, number>();
        }
        let hashCode = codes.get(x);
        if (hashCode === void 0) {
          hashCode = ~~nextCode;
          codes.set(x, hashCode);
          nextCode += 1;
        }
        return hashCode;
      } else if (x === null) {
        return 1;
      } else if (x === void 0) {
        return 0;
      }
      throw new TypeError("" + x);
    };
  })(),
};
