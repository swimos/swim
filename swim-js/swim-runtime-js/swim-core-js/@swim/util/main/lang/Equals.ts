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

/**
 * Type that implements a universal equality relation.
 */
export interface Equals {
  /**
   * Returns `true` if `this` is equal to `that`, otherwise returns `false`.
   */
  equals(that: unknown): boolean;
}

export const Equals = function (x: unknown, y: unknown): boolean {
  if (x === y) {
    return true;
  } else if (x !== void 0 && x !== null && typeof (x as Equals).equals === "function") {
    return (x as Equals).equals(y);
  }
  return false;
} as {
  /**
   * Returns `true` if `x` conforms to [[Equals]] and is [[Equals.equals
   * equal]] to `y`, otherwise returns `x === y`.
   */
  (x: unknown, y: unknown): boolean;

  /**
   * Returns `true` if `object` conforms to the [[Equals]] interface.
   */
  is(object: unknown): object is Equals;
};

Equals.is = function (object: unknown): object is Equals {
  return object !== void 0 && object !== null
      && typeof (object as Equals).equals === "function";
};
