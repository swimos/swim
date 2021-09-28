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

import type {Interpolator} from "./Interpolator";

/**
 * Type that can be [[Interpolator interpolated]] to values of type `T`.
 */
export interface Interpolate<T = unknown> {
  /**
   * Returns an [[Interpolator]] function that blends between `this` value and
   * `that` value, if possible; otherwise returns `null` if `this` is unable to
   * construct an interpolator to `that`.
   */
  interpolateTo(that: unknown): Interpolator<T> | null;
}

export const Interpolate = function (x: unknown, y: unknown): Interpolator | null {
  if (x !== void 0 && x !== null && typeof (x as Interpolate).interpolateTo === "function") {
    return (x as Interpolate).interpolateTo(y);
  } else {
    return null;
  }
} as {
  /**
   * Returns `x.interpolateTo(y)`, if `x` conforms to the [[Interpolate]]
   * interface; otherwise returns `null`.
   */
  <T>(x: Interpolate<T> | null | undefined, y: unknown): Interpolator<T> | null;
  (x: unknown, y: unknown): Interpolator | null;

  /**
   * Returns `true` if `object` conforms to the [[Interpolate]] interface.
   */
  is(object: unknown): object is Interpolate;
};

Interpolate.is = function (object: unknown): object is Interpolate {
  return object !== void 0 && object !== null
      && typeof (object as Interpolate).interpolateTo === "function";
};
