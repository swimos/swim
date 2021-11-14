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

import type {Class} from "../types/Class";
import type {Consumer} from "./Consumer";

/** @public */
export type ConsumerType<O> =
  O extends {readonly consumerType?: Class<infer T>} ? T : never;

/** @public */
export interface Consumable {
  readonly consumerType?: Class<Consumer>;

  consume(consumer: ConsumerType<this>): void;

  unconsume(consumer: ConsumerType<this>): void;
}

/** @public */
export const Consumable = (function () {
  const Consumable = {} as {
    is(object: unknown): object is Consumable;
  };

  Consumable.is = function (object: unknown): object is Consumable {
    if (typeof object === "object" && object !== null || typeof object === "function") {
      const consumable = object as Consumable;
      return "consume" in consumable;
    }
    return false;
  };

  return Consumable;
})();
