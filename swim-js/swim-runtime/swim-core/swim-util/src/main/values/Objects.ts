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
import {Strings} from "./Strings";
import {Values} from "./Values";

/**
 * Utilities for comparing and hashing structural objects.
 * @public
 */
export const Objects = (function () {
  const Objects = {} as {
    /**
     * Returns `true` if the given object has no own properties.
     */
    isEmpty(x: object | null | undefined): boolean;

    /**
     * Returns a shallow copy of `object` with the given `key`-`value` pair
     * inserted before the `target` entry value, in traversal order.
     */
    inserted<O, K extends keyof O>(object: O, key: K, value: O[K], target: unknown): O;

    getFirstKey<O>(object: O): keyof O | undefined;

    getFirstValue<O>(object: O): O[keyof O] | undefined;

    getNextKey<O>(object: O, key: keyof O): keyof O | undefined;

    getNextValue<O>(object: O, key: keyof O): O[keyof O] | undefined;

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

  Objects.isEmpty = function (x: object | null | undefined) {
    if (typeof x === "object" && x !== null) {
      for (const k in x) {
        if (Object.prototype.hasOwnProperty.call(x, k)) {
          return false;
        }
      }
    }
    return true;
  };

  Objects.inserted = function <O, K extends keyof O>(oldObject: O, newKey: K, newValue: O[K], targetValue: unknown): O {
    let inserted = false;
    const newObject = {} as O;
    for (const oldKey in oldObject) {
      if (Object.prototype.hasOwnProperty.call(oldObject, oldKey)) {
        const oldValue = oldObject[oldKey]!;
        if (!inserted && oldValue === targetValue) {
          newObject[newKey as keyof O] = newValue as O[keyof O];
          inserted = true;
        }
        newObject[oldKey] = oldValue;
      }
    }
    if (!inserted) {
      newObject[newKey as keyof O] = newValue as O[keyof O];
    }
    return newObject;
  };

  Objects.getFirstKey = function <O>(object: O): keyof O | undefined {
    for (const k in object) {
      if (Object.prototype.hasOwnProperty.call(object, k)) {
        return k;
      }
    }
    return void 0;
  };

  Objects.getFirstValue = function <O>(object: O): O[keyof O] | undefined {
    for (const k in object) {
      if (Object.prototype.hasOwnProperty.call(object, k)) {
        return object[k]!;
      }
    }
    return void 0;
  };

  Objects.getNextKey = function <O>(object: O, key: keyof O): keyof O | undefined {
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
  };

  Objects.getNextValue = function <O>(object: O, key: keyof O): O[keyof O] | undefined {
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
