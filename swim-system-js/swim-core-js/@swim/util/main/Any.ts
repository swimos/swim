// Copyright 2015-2020 Swim inc.
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

export interface FromAny<T, U = T> {
  fromAny(value: T | U): T;
}

/** @hidden */
export const FromAny = {
  is<T, U = T>(object: unknown): object is FromAny<T, U> {
    if (typeof object === "object" && object !== null || typeof object === "function") {
      return typeof (object as FromAny<T, U>).fromAny === "function";
    }
    return false;
  },
};

export interface ToAny<T> {
  toAny(): T;
}

/** @hidden */
export const ToAny = {
  is<T>(object: unknown): object is ToAny<T> {
    if (typeof object === "object" && object !== null) {
      return typeof (object as ToAny<T>).toAny === "function";
    }
    return false;
  },
};
