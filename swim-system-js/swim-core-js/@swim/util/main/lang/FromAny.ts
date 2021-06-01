// Copyright 2015-2021 Swim inc.
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

export interface FromAny<T, U = never> {
  fromAny(value: T | U): T;
}

export const FromAny = {} as {
  /**
   * Returns `true` if `object` conforms to the [[FromAny]] interface.
   */
  is<T, U = never>(object: unknown): object is FromAny<T, U>;
};

FromAny.is = function <T, U = never>(object: unknown): object is FromAny<T, U> {
  return object !== void 0 && object !== null
      && typeof (object as FromAny<T, U>).fromAny === "function";
};
