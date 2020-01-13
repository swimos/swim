// Copyright 2015-2020 SWIM.AI inc.
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

import {Comparable} from "./Comparable";
import {Equals} from "./Equals";
import {HashCode} from "./HashCode";
import {Murmur3} from "./Murmur3";

/**
 * Utilities for comparing, equating, and hashing structural values.
 * A structural value is typed by object structure, rather than by name.
 */
export class Objects {
  private constructor() {
  }

  /**
   * Returns the relative order of two structural values.  Returns `-1` if `x`
   * orders before `y`; returns `1` if `x` orders after `y`; returns `0` if `x`
   * and `y` are equivalent; and returns `NaN` if `x` is not comparable to `y`.
   */
  static compare(x: unknown, y: unknown): 0 | 1 | -1 {
    if (x instanceof Date) {
      x = x.getTime();
    }
    if (y instanceof Date) {
      y = y.getTime();
    }

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
    } else if (typeof x === "number") {
      if (y === void 0 || y === null) {
        return -1;
      } else if (typeof y === "number") {
        return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
      } else {
        return 1;
      }
    } else if (typeof x === "string") {
      if (y === void 0 || y === null || typeof y === "number") {
        return -1;
      } else if (typeof y === "string") {
        return x < y ? -1 : x > y ? 1 : 0;
      } else {
        return 1;
      }
    } else if (typeof x === "object" && typeof (x as any).compareTo === "function") {
      const order = (x as Comparable<any>).compareTo(y);
      return order < 0 ? -1 : order > 0 ? 1 : 0;
    } else if (Array.isArray(x)) {
      if (y === void 0 || y === null || typeof y === "number" || typeof y === "string") {
        return -1;
      } else if (Array.isArray(y)) {
        return Objects.compareArray(x, y);
      } else {
        return 1;
      }
    } else {
      if (y === void 0 || y === null || typeof y === "number" || typeof y === "string" || Array.isArray(y)) {
        return -1;
      } else {
        return Objects.compareObject(x as any, y as any);
      }
    }
  }

  /**
   * Returns the relative order of two arrays of structural values.  Returns
   * `-1` if `x` orders before `y`; returns `1` if `x` orders after `y`;
   * returns `0` if `x` and `y` are equivalent; and returns `NaN` if `x` is not
   * comparable to `y`.
   */
  static compareArray(x: ReadonlyArray<any>, y: ReadonlyArray<any>): 0 | 1 | -1 {
    const p = x.length as number;
    const q = y.length as number;
    let order = 0 as 0 | 1 | -1;
    for (let i = 0, n = Math.min(p, q); i < n && order === 0; i += 1) {
      order = Objects.compare(x[i], y[i]);
    }
    return order !== 0 ? order : p > q ? 1 : p < q ? -1 : 0;
  }

  /**
   * Returns the relative order of two structural objects.  Returns `-1` if `x`
   * orders before `y`; returns `1` if `x` orders after `y`; returns `0` if `x`
   * and `y` are equivalent; and returns `NaN` if `x` is not comparable to `y`.
   */
  static compareObject(x: Object, y: Object): 0 | 1 | -1 {
    const xKeys = Object.keys(x);
    const yKeys = Object.keys(y);
    const p = xKeys.length;
    const q = yKeys.length;
    const n = Math.min(p, q);
    let order = 0 as 0 | 1 | -1;
    for (let i = 0; i < n && order === 0; i += 1) {
      const xKey = xKeys[i];
      const yKey = yKeys[i];
      order = Objects.compare(xKey, yKey);
      if (order === 0) {
        order = Objects.compare((x as any)[xKey], (y as any)[yKey]);
      }
    }
    return order !== 0 ? order : p > q ? 1 : p < q ? -1 : 0;
  }

  /**
   * Compares two structural values for equality.  Returns `true` if `x` and
   * `y` are structurally equal, otherwise returns `false`.
   */
  static equal(x: unknown, y: unknown): boolean {
    if (x instanceof Date) {
      x = x.getTime();
    }
    if (y instanceof Date) {
      y = y.getTime();
    }

    if (x === y) {
      return true;
    } else if (typeof x === "number") {
      if (typeof y === "number") {
        return isNaN(x) && isNaN(y);
      }
    } else if (typeof x === "object" && x && typeof (x as any).equals === "function") {
      return (x as Equals).equals(y);
    } else if (Array.isArray(x)) {
      if (Array.isArray(y)) {
        return Objects.equalArray(x, y);
      }
    } else if (typeof x === "object" && x) {
      if (typeof y === "object" && y) {
        return Objects.equalObject(x, y);
      }
    }
    return false;
  }

  /**
   * Compares two arrays of structural values for equality.  Returns `true` if
   * `x` and `y` are structurally equal, otherwise returns `false`.
   */
  static equalArray(x: ReadonlyArray<any>, y: ReadonlyArray<any>): boolean {
    const n = x.length;
    if (n !== y.length) {
      return false;
    }
    for (let i = 0; i < n; i += 1) {
      if (!Objects.equal(x[i], y[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Compares two structural objects for equality.  Returns `true` if `x` and
   * `y` are structurally equal, otherwise returns `false`.
   */
  static equalObject(x: Object, y: Object): boolean {
    const xKeys = Object.keys(x);
    const yKeys = Object.keys(y);
    const n = xKeys.length;
    if (n !== yKeys.length) {
      return false;
    }
    for (let i = 0; i < n; i += 1) {
      const key = xKeys[i];
      if (key !== yKeys[i] || !Objects.equal((x as any)[key], (y as any)[key])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns a hash code for a structural value.
   */
  static hash(x: unknown): number {
    if (x === void 0 || x === null || typeof x === "boolean"
        || typeof x === "number" || typeof x === "string") {
      return Murmur3.hash(x as any);
    } else if (typeof x === "object" && typeof (x as any).hashCode === "function") {
      return (x as HashCode).hashCode();
    } else if (Array.isArray(x)) {
      return Objects.hashArray(x);
    } else if (typeof x === "object") {
      return Objects.hashObject(x as any);
    } else {
      throw new TypeError("" + x);
    }
  }

  /**
   * Returns a hash code for an array of structural values.
   */
  static hashArray(x: ReadonlyArray<any>): number {
    let h = 0;
    const n = x.length;
    for (let i = 0; i < n; i += 1) {
      h = Murmur3.mix(h, Objects.hash(x[i]));
    }
    return Murmur3.mash(h);
  }

  /**
   * Returns a hash code for a structural object.
   */
  static hashObject(x: Object): number {
    let h = 0;
    const keys = Object.keys(x);
    const n = keys.length;
    for (let i = 0; i < n; i += 1) {
      const key = keys[i];
      h = Murmur3.mix(Murmur3.mix(h, Murmur3.hash(key)), (x as any)[key]);
    }
    return Murmur3.mash(h);
  }
}
