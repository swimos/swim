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

/**
 * Utilities for comparing and hashing object identities.
 */
export const Identity = (function () {
  const Identity = {} as {
    /**
     * Returns the relative order of `x` with respect to `y`.  Returns `-1` if
     * the hash code of object `x` is less than the hash code of object `y`;
     * returns `1` if the hash code of object `x` is greater than the hash code
     * of object `y`; and returns `0` if `x` and `y` are identical objects.
     * If either `x` or `y` is `null` or `undefined`, then objects order before
     * `null`, and `null` orders before `undefined`.
     */
    compare(x: object | null | undefined, y: object | null | undefined): number;

    /**
     * Returns a unique 32-bit hash value for a particular object instance.
     */
    hash(x: object | null | undefined): number;
  };

  Identity.compare = function (x: object | null | undefined, y: object | null | undefined): number {
    if (typeof x === "object" && x !== null) {
      if (typeof y === "object" && y !== null) {
        const xh = Identity.hash(x);
        const yh = Identity.hash(y);
        return xh < yh ? -1 : xh > yh ? 1 : 0;
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

  let nextId = -1;
  Identity.hash = function (x: object | null | undefined): number {
    if (typeof x === "object" && x !== null) {
      let hashCode = (x as any)._hashCode as number | undefined;
      if (hashCode === void 0) {
        hashCode = ~~nextId;
        nextId -= 1;
        Object.defineProperty(x, "_hashCode", {
          value: hashCode,
          configurable: true,
        });
      }
      return hashCode;
    } else if (x === null) {
      return 1;
    } else if (x === void 0) {
      return 0;
    } else {
      throw new TypeError("" + x);
    }
  };

  return Identity;
})();
