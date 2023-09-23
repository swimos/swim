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

import type {Uninitable} from "./types";
import {Equivalent} from "./Equivalent";

/**
 * Utilities for comparing and hashing numbers.
 * @public
 */
export const Numbers = {
  /**
   * Returns `true` if `x` and `y` are equal numbers, or if both are `NaN`;
   * otherwise returns `x === y` if either `x` or `y` is not defined.
   */
  equal(x: number | null | undefined, y: number | null | undefined): boolean {
    return x === y || typeof x === "number" && typeof y === "number" && isNaN(x) && isNaN(y);
  },

  /**
   * Returns `true` if `x` and `y` are both defined, and the difference between
   * the two is less than `epsilon`, or if both are `NaN`; otherwise returns
   * `x === y` if either `x` or `y` is not defined.
   */
  equivalent(x: number | null | undefined, y: number | null | undefined, epsilon?: number): boolean {
    return x === y || typeof x === "number" && typeof y === "number" && (isNaN(x) && isNaN(y) || Math.abs(y - x) < (epsilon !== void 0 ? epsilon : Equivalent.Epsilon));
  },

  /**
   * Returns the relative order of `x` with respect to `y`. Returns `-1` if
   * the number `x` less than the number `y`; returns `1` if the number `x` is
   * greater than the number `y`; and returns `0` if `x` and `y` are equal
   * numbers, or if both are `NaN`. If either `x` or `y` is `NaN`, `null`,
   * or `undefined`, then numbers order before `NaN`, `NaN` orders before
   * `null`, and `null` orders before `undefined`.
   */
  compare(x: number | null | undefined, y: number | null | undefined): number {
    if (typeof x === "number") {
      return typeof y === "number" ? (x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0) : -1;
    } else if (x === null) {
      return y === void 0 ? -1 : y === null ? 0 : 1;
    } else if (x === void 0) {
      return y === void 0 ? 0 : 1;
    }
    return NaN;
  },

  /**
   * Returns a 32-bit hash value for the number `x`, if defined; otherwise
   * returns `0` or `1` if `x` is `undefined` or `null`, respectively.
   */
  hash: (function () {
    let hashArrayBuffer: ArrayBuffer | null = null;
    let hashFloat64Array: Float64Array | null = null;
    let hashInt32Array: Int32Array | null = null;
    return function hash(x: number | null | undefined): number {
      if (typeof x === "number") {
        if (x === ~~x) {
          return ~~x;
        } else if (hashArrayBuffer === null) {
          hashArrayBuffer = new ArrayBuffer(8);
          hashFloat64Array = new Float64Array(hashArrayBuffer);
          hashInt32Array = new Int32Array(hashArrayBuffer);
        }
        hashFloat64Array![0] = x;
        return hashInt32Array![0]! ^ hashInt32Array![1]!;
      } else if (x === null) {
        return 1;
      } else if (x === void 0) {
        return 0;
      }
      throw new TypeError("" + x);
    };
  })(),

  fromLike<T extends number | string | boolean | null | undefined>(value: T): number | Uninitable<T> {
    if (value === void 0 || value === null) {
      return value as number | Uninitable<T>;
    }
    return Number(value);
  },
};
