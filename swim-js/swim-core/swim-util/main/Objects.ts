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
import {Strings} from "./Strings";
import {Values} from "./"; // forward import

/**
 * Utilities for comparing and hashing structural objects.
 * @public
 */
export const Objects = {
  /**
   * Returns `true` if the given object has no own properties.
   */
  isEmpty(x: object | null | undefined): boolean {
    if (x !== null && typeof x === "object") {
      for (const k in x) {
        if (Object.prototype.hasOwnProperty.call(x, k)) {
          return false;
        }
      }
    }
    return true;
  },

  /**
   * Returns `true` if `object` has any of the specified `keys`,
   * as determined by `key in object`. Returns `false` if `object`
   * is `undefined` or `null`, or if `typeof object` is neither
   * `"object"` nor `"function"`, or if none of the specified `keys`
   * are present in `object`.
   */
  hasAnyKey<O>(object: unknown, ...keys: (keyof O)[]): object is O {
    if (object === null || (typeof object !== "object" && typeof object !== "function")) {
      return false;
    }
    for (let i = 0; i < keys.length; i += 1) {
      if (keys[i]! in object) {
        return true;
      }
    }
    return false;
  },

  /**
   * Returns `true` if `object` has all of the specified `keys`,
   * as determined by `key in object`. Returns `false` if `object`
   * is `undefined` or `null`, or if `typeof object` is neither
   * `"object"` nor `"function"`, or if at least one of specified `keys`
   * are not present in `object`.
   */
  hasAllKeys<O>(object: unknown, ...keys: (keyof O)[]): object is O {
    if (object === null || (typeof object !== "object" && typeof object !== "function")) {
      return false;
    }
    for (let i = 0; i < keys.length; i += 1) {
      if (!(keys[i]! in object)) {
        return false;
      }
    }
    return true;
  },

  /**
   * Returns a shallow copy of `object` with the given `key`-`value` pair
   * inserted before the `target` entry value, in traversal order.
   */
  inserted<O, K extends keyof O>(object: O, key: K, value: O[K], target: unknown): O {
    let inserted = false;
    const newObject = {} as O;
    for (const oldKey in object) {
      if (Object.prototype.hasOwnProperty.call(object, oldKey)) {
        const oldValue = object[oldKey]!;
        if (!inserted && oldValue === target) {
          newObject[key as keyof O] = value as O[keyof O];
          inserted = true;
        }
        newObject[oldKey] = oldValue;
      }
    }
    if (!inserted) {
      newObject[key as keyof O] = value as O[keyof O];
    }
    return newObject;
  },

  getFirstKey<O>(object: O): keyof O | undefined {
    for (const k in object) {
      if (Object.prototype.hasOwnProperty.call(object, k)) {
        return k;
      }
    }
    return void 0;
  },

  getFirstValue<O>(object: O): O[keyof O] | undefined {
    for (const k in object) {
      if (Object.prototype.hasOwnProperty.call(object, k)) {
        return object[k]!;
      }
    }
    return void 0;
  },

  getNextKey<O>(object: O, key: keyof O): keyof O | undefined {
    let mark = false;
    for (const k in object) {
      if (Object.prototype.hasOwnProperty.call(object, k)) {
        if (mark) {
          return k;
        } else if (k === key) {
          mark = true;
        }
      }
    }
    return void 0;
  },

  getNextValue<O>(object: O, key: keyof O): O[keyof O] | undefined {
    let mark = false;
    for (const k in object) {
      if (Object.prototype.hasOwnProperty.call(object, k)) {
        if (mark) {
          return object[k]!;
        } else if (k === key) {
          mark = true;
        }
      }
    }
    return void 0;
  },

  /**
   * Returns `true` if `x` and `y` are structurally equal objects; otherwise
   * returns `x === y` if either `x` or `y` is not an object.
   */
  equal(x: object | null | undefined, y: object | null | undefined): boolean {
    if (x === y) {
      return true;
    } else if (x !== null && typeof x === "object" && y !== null && typeof y === "object") {
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
  },

  /**
   * Returns `true` if `x` and `y` are structurally [[Equivalent.equivalentTo
   * equivalent]] objects; otherwise returns `x === y` if either `x` or `y` is
   * not an object.
   */
  equivalent(x: object | null | undefined, y: object | null | undefined, epsilon?: number): boolean {
    if (x === y) {
      return true;
    } else if (x !== null && typeof x === "object" && y !== null && typeof y === "object") {
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
  },

  /**
   * Returns the relative order of `x` with respect to `y`. Returns `-1` if
   * the entries of object `x` order lexicographically before the entries of
   * object `y`; returns `1` if the entries of object `x` order
   * lexicographically after the entries of object `y`; and returns `0` if `x`
   * and `y` are equal objects. If either `x` or `y` is `null` or `undefined`,
   * then objects order before `null`, and `null` orders before `undefined`.
   */
  compare(x: object | null | undefined, y: object | null | undefined): number {
    if (x !== null && typeof x === "object") {
      if (y !== null && typeof y === "object") {
        if (x === y) {
          return 0;
        }
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
   * Returns a 32-bit hash value for the entries of object `x`, if defined;
   * otherwise returns `0` or `1` if `x` is `undefined` or `null`, respectively.
   */
  hash(x: object | null | undefined): number {
    if (typeof x === "object" && x !== null) {
      let code = 0;
      const keys = Object.keys(x);
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i]!;
        code = Murmur3.mix(Murmur3.mix(code, Strings.hash(key)), Values.hash((x as any)[key]));
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
