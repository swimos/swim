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
 * Utilities for comparing and hashing booleans.
 */
export const Booleans = {} as {
  /**
   * Returns the relative order of `x` with respect to `y`.  Returns `-1` if
   * `x` is `true` and `y` is `false`; returns `1` if `x` is `false` and `y`
   * is `true`; and returns `0` if `x` and `y` are equal booleans.  If either
   * `x` or `y` is `null` or `undefined`, then booleans order before `null`,
   * and `null` orders before `undefined`.
   */
  compare(x: boolean | null | undefined, y: boolean | null | undefined): number;

  /**
   * Returns a hash code for a number.
   */
  hash(x: boolean | null | undefined): number;
};

Booleans.compare = function (x: boolean | null | undefined, y: boolean | null | undefined): number {
  if (typeof x === "boolean") {
    return typeof y === "boolean" ? (x && !y ? -1 : !x && y ? 1 : 0) : -1;
  } else if (x === null) {
    return y === void 0 ? -1 : y === null ? 0 : 1;
  } else if (x === void 0) {
    return y === void 0 ? 0 : 1;
  } else {
    return NaN;
  }
};

Booleans.hash = function (x: boolean | null | undefined): number {
  if (x === true) {
    return 3;
  } else if (x === false) {
    return 2;
  } else if (x === null) {
    return 1;
  } else if (x === void 0) {
    return 0;
  } else {
    throw new TypeError("" + x);
  }
};
