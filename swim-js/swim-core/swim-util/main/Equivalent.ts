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

/**
 * Type that implements a universal equivalence relation.
 * @public
 */
export interface Equivalent {
  /**
   * Returns `true` if `this` is equivalent to `that` within some optionally
   * specified error tolerance `epsilon`, otherwise returns `false`.
   */
  equivalentTo(that: unknown, epsilon?: number): boolean;
}

/** @public */
export const Equivalent = (function () {
  const Equivalent = function (x:unknown, y: unknown, epsilon?: number): boolean {
    if (Equivalent[Symbol.hasInstance](x)) {
      return x.equivalentTo(y, epsilon);
    }
    return x === y;
  } as {
    /**
     * Returns `true` if `x` conforms to [[Equivalent]] and is
     * [[Equivalent.equivalentTo equivalent to]] `y`, otherwise returns `x === y`.
     */
    (x: unknown, y: unknown, epsilon?: number): boolean;

    /**
     * Returns `true` if `instance` appears to conform to the [[Equivalent]] interface.
     */
    [Symbol.hasInstance](instance: unknown): instance is Equivalent;

    /**
     * Default equivalence tolerance.
     */
    readonly Epsilon: number;
  };

  Object.defineProperty(Equivalent, Symbol.hasInstance, {
    value: function (instance: unknown): instance is Equivalent {
      if (instance === null || (typeof instance !== "object" && typeof instance !== "function")) {
        return false;
      }
      return typeof (instance as Equivalent).equivalentTo === "function";
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(Equivalent, "Epsilon", {
    value: 1.0e-8,
    enumerable: true,
    configurable: true,
  });

  return Equivalent;
})();
