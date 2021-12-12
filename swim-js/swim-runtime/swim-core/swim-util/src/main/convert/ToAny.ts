// Copyright 2015-2021 Swim.inc
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

/** @public */
export interface ToAny<T> {
  toAny(): T;
}

/** @public */
export const ToAny = (function () {
  const ToAny = {} as {
    /**
     * Returns `true` if `object` conforms to the [[ToAny]] interface.
     */
    is<T>(object: unknown): object is ToAny<T>;
  };

  ToAny.is = function <T>(object: unknown): object is ToAny<T> {
    return object !== void 0 && object !== null
        && typeof (object as ToAny<T>).toAny === "function";
  };

  return ToAny;
})();
