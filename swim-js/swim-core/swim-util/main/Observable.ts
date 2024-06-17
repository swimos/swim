// Copyright 2015-2024 Nstream, inc.
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

import type {Class} from "./types";
import type {Observer} from "./Observer";

/** @public */
export type Observes<O> =
  O extends {readonly observerType?: Class<infer T>} ? T : {};

/** @public */
export interface Observable {
  readonly observerType?: Class<Observer>;

  observe(observer: Observes<this>): void;

  unobserve(observer: Observes<this>): void;
}

/** @public */
export const Observable = {
  [Symbol.hasInstance](instance: unknown): instance is Observable {
    if (instance === null || (typeof instance !== "object" && typeof instance !== "function")) {
      return false;
    }
    return typeof (instance as Observable).observe === "function"
        && typeof (instance as Observable).unobserve === "function";
  },
};
