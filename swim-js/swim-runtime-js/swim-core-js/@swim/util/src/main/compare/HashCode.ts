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
    } else {
      return x.hashCode();
    }
  } as {
    /**
     * Returns the [[HashCode.hashCode hash code]] of `x`, if `x` is an object;
     * otherwise returns `0` or `1` if `x` is `undefined` or `null`, respectively.
     */
    (x: HashCode | null | undefined): number;

    /**
     * Returns `true` if `object` conforms to the [[HashCode]] interface.
     */
    is(object: unknown): object is HashCode;
  };

  HashCode.is = function (object: unknown): object is HashCode {
    return object !== void 0 && object !== null
        && typeof (object as HashCode).hashCode === "function";
  };

  return HashCode;
})();
