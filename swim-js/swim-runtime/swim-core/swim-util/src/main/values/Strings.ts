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

import {Murmur3} from "../runtime/Murmur3";

/**
 * Utilities for comparing and hashing strings.
 * @public
 */
export const Strings = (function () {
  const Strings = {} as {
    /**
     * Returns the relative order of `x` with respect to `y`. Returns `-1` if
     * the string `x` lexicographically orders before the string `y`; returns `1`
     * if the string `x` lexicographically orders after the string `y`; and
     * returns `0` if `x` and `y` are equal strings. If either `x` or `y` is
     * `null` or `undefined`, then strings order before `null`, and `null` orders
     * before `undefined`.
     */
    compare(x: string | null | undefined, y: string | null | undefined): number;

    /**
     * Returns a hash code for a string.
     */
    hash(x: string | null | undefined): number;

    fromAny(value: string | number | boolean): string;
    fromAny(value: string | number | boolean | null | undefined): string | null | undefined;

    codePointAt(string: string, index: number): number | undefined;

    offsetByCodePoints(string: string, index: number, count: number): number;
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

  Strings.fromAny = function (value: string | number | boolean | null | undefined): string | null | undefined {
    if (value === void 0 || value === null) {
      return value;
    } else {
      return String(value);
    }
  } as typeof Strings.fromAny;

  Strings.codePointAt = function (string: string, index: number): number | undefined {
    const length = string.length;
    index = index ? Number(index) : 0; // Coerce to number.
    if (index !== index) { // Convert NaN to zero.
      index = 0;
    }
    if (index >= 0 && index < length) {
      const c1 = string.charCodeAt(index);
      if (c1 <= 0xd7ff || c1 >= 0xe000) { // U+0000..U+D7FF | U+E000..U+FFFF
        return c1;
      } else if (c1 <= 0xdbff && index + 1 < length) {
        const c2 = string.charCodeAt(index + 1);
        if (c2 >= 0xdc00 && c2 <= 0xdfff) { // U+10000..U+10FFFF
          return ((c1 & 0x03ff) << 10 + c2 & 0x03ff) + 0x10000;
        }
      }
    }
    return void 0;
  };

  Strings.offsetByCodePoints = function (string: string, index: number, count: number): number {
    if (count > 0) {
      const length = string.length;
      while (count > 0 && index < length) {
        const c1 = string.charCodeAt(index);
        if (c1 <= 0xd7ff || c1 >= 0xe000) { // U+0000..U+D7FF | U+E000..U+FFFF
          index += 1;
        } else if (c1 <= 0xdbff && index + 1 < length) {
          const c2 = string.charCodeAt(index + 1);
          if (c2 >= 0xdc00 && c2 <= 0xdfff) { // U+10000..U+10FFFF
            index += 2;
          } else {
            index += 1;
          }
        } else {
          index += 1;
        }
        count -= 1;
      }
    } else if (count < 0) {
      while (count < 0 && index > 0) {
        const c2 = string.charCodeAt(index - 1);
        if (c2 <= 0xd7ff || c2 >= 0xe000) { // U+0000..U+D7FF | U+E000..U+FFFF
          index -= 1;
        } else if (c2 >= 0xdc00 && c2 <= 0xdfff && index - 1 > 0) {
          const c1 = string.charCodeAt(index - 2);
          if (c1 >= 0xd800 && c1 <= 0xdfff) { // U+10000..U+10FFFF
            index -= 2;
          } else {
            index -= 1;
          }
        } else {
          index -= 1;
        }
        count -= 1;
      }
    }
    return index;
  };

  return Strings;
})();
