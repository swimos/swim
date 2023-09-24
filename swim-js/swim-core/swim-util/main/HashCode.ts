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

import type {Equals} from "./Equals";

/**
 * Type that is convertible to a hash value consistent with its universal
 * equality relation.
 * @public
 */
export interface HashCode extends Equals {
  /**
   * Returns a 32-bit hash value for this object.
   */
  hashCode(): number;
}

/** @public */
export const HashCode = (function () {
  const HashCode = function (x: HashCode | null | undefined): number {
    if (x === void 0) {
      return 0;
    } else if (x === null) {
      return 1;
    }
    return x.hashCode();
  } as {
    /**
     * Returns the [[HashCode.hashCode hash code]] of `x`, if `x` is an object;
     * otherwise returns `0` or `1` if `x` is `undefined` or `null`, respectively.
     */
    (x: HashCode | null | undefined): number;

    /**
     * Returns `true` if `instance` appears to conform to the [[HashCode]] interface.
     */
    [Symbol.hasInstance](instance: unknown): instance is HashCode;
  };

  Object.defineProperty(HashCode, Symbol.hasInstance, {
    value: function (instance: unknown): instance is HashCode {
      if (instance === null || (typeof instance !== "object" && typeof instance !== "function")) {
        return false;
      }
      return typeof (instance as HashCode).hashCode === "function";
    },
    enumerable: true,
    configurable: true,
  });

  return HashCode;
})();
