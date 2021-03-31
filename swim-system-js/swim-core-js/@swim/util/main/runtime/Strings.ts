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

import {Murmur3} from "./Murmur3";

/**
 * Utilities for comparing and hashing strings.
 */
export const Strings = {} as {
  /**
   * Returns the relative order of `x` with respect to `y`.  Returns `-1` if
   * the string `x` lexicographically orders before the string `y`; returns `1`
   * if the string `x` lexicographically orders after the string `y`; and
   * returns `0` if `x` and `y` are equal strings.  If either `x` or `y` is
   * `null` or `undefined`, then strings order before `null`, and `null` orders
   * before `undefined`.
   */
  compare(x: string | null | undefined, y: string | null | undefined): number;

  /**
   * Returns a hash code for a string.
   */
  hash(x: string | null | undefined): number;
};

Strings.compare = function (x: string | null | undefined, y: string | null | undefined): number {
  if (typeof x === "string") {
    return typeof y === "string" ? (x < y ? -1 : x > y ? 1 : 0) : -1;
  } else if (x === null) {
    return y === void 0 ? -1 : y === null ? 0 : 1;
  } else if (x === void 0) {
    return y === void 0 ? 0 : 1;
  } else {
    return NaN;
  }
};

Strings.hash = function (x: string | null | undefined): number {
  if (typeof x === "string") {
    return Murmur3.mash(Murmur3.mixString(0, x));
  } else if (x === null) {
    return 1;
  } else if (x === void 0) {
    return 0;
  } else {
    throw new TypeError("" + x);
  }
};
