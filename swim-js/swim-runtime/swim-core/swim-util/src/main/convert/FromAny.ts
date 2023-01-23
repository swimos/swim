// Copyright 2015-2023 Swim.inc
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

import {Strings} from "../values/Strings";
import {Numbers} from "../values/Numbers";
import {Booleans} from "../values/Booleans";
import {Identity} from "../values/Identity";

/** @public */
export interface FromAny<T, U = T> {
  fromAny(value: T | U): T;
}

/** @public */
export const FromAny = (function () {
  const FromAny = {} as {
    /**
     * Returns a `FromAny` instance for the given `type`. Returns `type` itself,
     * if `type` implements `FromAny`; returns a primitive converter, if `type`
     * is the `String`, `Number`, or `Boolean` constructor; otherwise returns
     * an identity converter.
     */
    fromAny(type: unknown): FromAny<unknown>;

    /** Converts `value` using the `FromAny` instance for the given `type`. */
    fromAny<T, U = T>(type: unknown, value: T | U): T;

    /**
     * Returns `true` if `object` conforms to the [[FromAny]] interface.
     */
    is<T, U = T>(object: unknown): object is FromAny<T, U>;
  };

  FromAny.fromAny = function <T, U>(type: unknown, value?: T | U): FromAny<unknown> | T {
    let converter: FromAny<unknown>;
    if (FromAny.is(type)) {
      converter = type;
    } else if (type === String) {
      converter = Strings;
    } else if (type === Number) {
      converter = Numbers;
    } else if (type === Boolean) {
      converter = Booleans;
    } else {
      converter = Identity;
    }
    if (arguments.length === 1) {
      return converter;
    } else {
      return converter.fromAny(value) as T;
    }
  };

  FromAny.is = function <T, U>(object: unknown): object is FromAny<T, U> {
    return object !== void 0 && object !== null
        && typeof (object as FromAny<T, U>).fromAny === "function";
  };

  return FromAny;
})();
