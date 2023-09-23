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

import type {Interpolator} from "./Interpolator";

/**
 * Type that can be [[Interpolator interpolated]] to values of type `T`.
 * @public
 */
export interface Interpolate<T = unknown> {
  /**
   * Returns an [[Interpolator]] function that blends between `this` value and
   * `that` value, if possible; otherwise returns `null` if `this` is unable to
   * construct an interpolator to `that`.
   */
  interpolateTo(that: unknown): Interpolator<T> | null;
}

/** @public */
export const Interpolate = (function () {
  const Interpolate = function (x: unknown, y: unknown): Interpolator | null {
    if (Interpolate[Symbol.hasInstance](x)) {
      return x.interpolateTo(y);
    }
    return null;
  } as {
    /**
     * Returns `x.interpolateTo(y)`, if `x` conforms to the
     * [[Interpolate]] interface; otherwise returns `null`.
     */
    <T>(x: Interpolate<T> | null | undefined, y: unknown): Interpolator<T> | null;
    (x: unknown, y: unknown): Interpolator | null;

    /**
     * Returns `true` if `instance` appears to conform to the [[Interpolate]] interface.
     */
    [Symbol.hasInstance](instance: unknown): instance is Interpolate;
  };

  Object.defineProperty(Interpolate, Symbol.hasInstance, {
    value: function (instance: unknown): instance is Interpolate {
      if (instance === null || (typeof instance !== "object" && typeof instance !== "function")) {
        return false;
      }
      return typeof (instance as Interpolate).interpolateTo === "function";
    },
    enumerable: true,
    configurable: true,
  });

  return Interpolate;
})();
