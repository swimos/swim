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
 * Type that implements a universal equality relation.
 * @public
 */
export interface Equals {
  /**
   * Returns `true` if `this` is equal to `that`, otherwise returns `false`.
   */
  equals(that: unknown): boolean;
}

/** @public */
export const Equals = (function () {
  const Equals = function (x: unknown, y: unknown): boolean {
    if (Equals[Symbol.hasInstance](x)) {
      return x.equals(y);
    }
    return x === y;
  } as {
    /**
     * Returns `true` if `x` conforms to [[Equals]] and is
     * [[Equals.equals equal]] to `y`, otherwise returns `x === y`.
     */
    (x: unknown, y: unknown): boolean;

    /**
     * Returns `true` if `instance` appears to conform to the [[Equals]] interface.
     */
    [Symbol.hasInstance](instance: unknown): instance is Equals;
  };

  Object.defineProperty(Equals, Symbol.hasInstance, {
    value: function (instance: unknown): instance is Equals {
      if (instance === null || (typeof instance !== "object" && typeof instance !== "function")) {
        return false;
      }
      return typeof (instance as Equals).equals === "function";
    },
    enumerable: true,
    configurable: true,
  });

  return Equals;
})();
