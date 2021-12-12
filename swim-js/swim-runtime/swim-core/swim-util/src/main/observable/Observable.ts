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

import type {Class} from "../types/Class";
import type {Observer} from "./Observer";

/** @public */
export type ObserverType<O> =
  O extends {readonly observerType?: Class<infer T>} ? T : never;

/** @public */
export interface Observable {
  readonly observerType?: Class<Observer>;

  observe(observer: ObserverType<this>): void;

  unobserve(observer: ObserverType<this>): void;
}

/** @public */
export const Observable = (function () {
  const Observable = {} as {
    is(object: unknown): object is Observable;
  };

  Observable.is = function (object: unknown): object is Observable {
    if (typeof object === "object" && object !== null || typeof object === "function") {
      const observable = object as Observable;
      return "observe" in observable;
    }
    return false;
  };

  return Observable;
})();
