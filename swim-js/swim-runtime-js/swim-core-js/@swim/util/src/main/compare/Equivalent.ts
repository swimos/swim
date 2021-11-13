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

import type {Mutable} from "../types/Mutable";

/**
 * Type that implements a universal equivalence relation.
 */
export interface Equivalent {
  /**
   * Returns `true` if `this` is equivalent to `that` within some optionally
   * specified error tolerance `epsilon`, otherwise returns `false`.
   */
  equivalentTo(that: unknown, epsilon?: number): boolean;
}

export const Equivalent = (function () {
  const Equivalent = function (x:unknown, y: unknown, epsilon?: number): boolean {
    if (x === y) {
      return true;
    } else if (x !== void 0 && x !== null && typeof (x as Equivalent).equivalentTo === "function") {
      return (x as Equivalent).equivalentTo(y, epsilon);
    }
    return false;
  } as {
    /**
     * Returns `true` if `x` conforms to [[Equivalent]] and is
     * [[Equivalent.equivalentTo equivalent to]] `y`, otherwise returns `x === y`.
     */
    (x: unknown, y: unknown, epsilon?: number): boolean;

    /**
     * Returns `true` if `object` conforms to the [[Equivalent]] interface.
     */
    is(object: unknown): object is Equivalent;

    /**
     * Default equivalence tolerance.
     */
    readonly Epsilon: number;
  };

  Equivalent.is = function (object: unknown): object is Equivalent {
    return object !== void 0 && object !== null
        && typeof (object as Equivalent).equivalentTo === "function";
  };

  (Equivalent as Mutable<typeof Equivalent>).Epsilon = 1.0e-8;

  return Equivalent;
})();
