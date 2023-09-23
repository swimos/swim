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

import {Equals} from "./Equals";
import {HashCode} from "./HashCode";
import {Equivalent} from "./Equivalent";
import {Compare} from "./Compare";
import {Numbers} from "./Numbers";
import {Strings} from "./Strings";
import {Functions} from "./Functions";
import {Arrays} from "./Arrays";
import {Objects} from "./Objects";

/**
 * Utilities for comparing and hashing structural values. A structural value
 * is typed by object structure, rather than by name.
 * @public
 */
export const Values = {
  /**
   * Returns `true` if `x` and `y` are structurally equal, otherwise returns `false`.
   */
  equal(x: unknown, y: unknown): boolean {
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
    } else if (Equals[Symbol.hasInstance](x)) {
      return x.equals(y);
    } else if (Array.isArray(x)) {
      if (Array.isArray(y)) {
        return Arrays.equal(x, y);
      }
    } else if (x !== null && typeof x === "object") {
      if (y !== null && typeof y === "object") {
        return Objects.equal(x, y);
      }
    }
    return false;
  },

  /**
   * Returns `true` if `x` and `y` are structurally equivalent, otherwise returns `false`.
   */
  equivalent(x: unknown, y: unknown, epsilon: number = Equivalent.Epsilon): boolean {
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
        return isNaN(x) && isNaN(y) || Math.abs(y - x) < epsilon;
      }
    } else if (Equivalent[Symbol.hasInstance](x)) {
      return x.equivalentTo(y, epsilon);
    } else if (Array.isArray(x)) {
      if (Array.isArray(y)) {
        return Arrays.equivalent(x, y, epsilon);
      }
    } else if (typeof x === "object" && x !== null) {
      if (typeof y === "object" && y !== null) {
        return Objects.equivalent(x, y, epsilon);
      }
    }
    return false;
  },

  /**
   * Returns `-1` if `x` orders before `y`; returns `1` if `x` orders after `y`;
   * returns `0` if `x` and `y` are equivalent; and returns `NaN` if `x` is not
   * comparable to `y`.
   */
  compare(x: unknown, y: unknown): number {
    if (x instanceof Date) {
      x = x.getTime();
    }
    if (y instanceof Date) {
      y = y.getTime();
    }

    if (x === void 0) {
      if (y === void 0) {
        return 0;
      }
      return 1;
    } else if (x === null) {
      if (y === void 0) {
        return -1;
      } else if (y === null) {
        return 0;
      }
      return 1;
    } else if (typeof x === "boolean") {
      if (y === void 0 || y === null) {
        return -1;
      } else if (typeof y === "boolean") {
        return x && !y ? -1 : !x && y ? 1 : 0;
      }
      return 1;
    } else if (typeof x === "number") {
      if (y === void 0 || y === null || typeof y === "boolean") {
        return -1;
      } else if (typeof y === "number") {
        return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
      }
      return 1;
    } else if (typeof x === "string") {
      if (y === void 0 || y === null || typeof y === "boolean" || typeof y === "number") {
        return -1;
      } else if (typeof y === "string") {
        return x < y ? -1 : x > y ? 1 : 0;
      }
      return 1;
    } else if (Compare[Symbol.hasInstance](x)) {
      return x.compareTo(y);
    } else if (typeof x === "function") {
      if (y === void 0 || y === null || typeof y === "boolean" || typeof y === "number" || typeof y === "string") {
        return -1;
      } else if (typeof y === "function") {
        return Functions.compare(x, y);
      }
      return 1;
    } else if (Array.isArray(x)) {
      if (y === void 0 || y === null || typeof y === "boolean" || typeof y === "number" || typeof y === "string" || typeof y === "function") {
        return -1;
      } else if (Array.isArray(y)) {
        return Arrays.compare(x, y);
      }
      return 1;
    } else if (typeof x === "object") {
      if (y === void 0 || y === null || typeof y === "boolean" || typeof y === "number" || typeof y === "string" || typeof y === "function" || Array.isArray(y)) {
        return -1;
      } else if (typeof y === "object") {
        return Objects.compare(x, y);
      }
      return 1;
    }
    return NaN;
  },

  /**
   * Returns a hash code for a structural value.
   */
  hash(x: unknown): number {
    if (x instanceof Date) {
      x = x.getTime();
    }

    if (x === void 0) {
      return 0;
    } else if (x === null) {
      return 1;
    } else if (x === false) {
      return 2;
    } else if (x === true) {
      return 3;
    } else if (typeof x === "number") {
      return Numbers.hash(x);
    } else if (typeof x === "string") {
      return Strings.hash(x);
    } else if (HashCode[Symbol.hasInstance](x)) {
      return x.hashCode();
    } else if (typeof x === "function") {
      return Functions.hash(x);
    } else if (Array.isArray(x)) {
      return Arrays.hash(x);
    } else if (typeof x === "object") {
      return Objects.hash(x);
    }
    throw new TypeError("" + x);
  },
};
