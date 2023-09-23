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

/** @public */
export type Consumer = unknown;

/** @public */
export interface Consumable {
  consume(consumer: Consumer): void;

  unconsume(consumer: Consumer): void;
}

/** @public */
export const Consumable = {
  [Symbol.hasInstance](instance: unknown): instance is Consumable {
    if (instance === null || (typeof instance !== "object" && typeof instance !== "function")) {
      return false;
    }
    return typeof (instance as Consumable).consume === "function"
        && typeof (instance as Consumable).unconsume === "function";
  },
};
