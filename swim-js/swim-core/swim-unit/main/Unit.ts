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

import {UnitRunner} from "./"; // forward import

/**
 * A unit test factory function that returns one or more unit tests to run.
 * Returns `undefined` if no unit tests should be run.
 *
 * ### Examples
 *
 * ```
 * class MySuite {
 *   @Unit
 *   myUnit(): MyUnit {
 *     return new MyUnit();
 *   }
 *
 *   @Unit
 *   myUnits(): MyUnit[] {
 *     return [new MyUnit({mode: "A"}), new MyUnit({mode: "B"})];
 *   }
 * }
 * ```
 *
 * @public
 */
export type UnitMethod<T = unknown> = (this: T) => Object[] | Object | undefined;

/**
 * [[UnitMethod Unit test factory]] registration options. `UnitOptions` can
 * be passed to the [[Unit]] decorator factory to modify the behavior
 * of registered units.
 *
 * @public
 */
export interface UnitOptions {
  /**
   * `true` if the unit test should not be executed.
   */
  pending?: boolean;
}

/**
 * Method decorator that registers [[UnitMethod unit test factory]] methods.
 *
 * ### Examples
 *
 * ```
 * class MySuite {
 *   @Unit
 *   myUnitA(): MyUnit {
 *     return new MyUnit({mode: "A"});
 *   }
 *   @Unit({pending: true})
 *   myUnitB(): MyUnit {
 *     return new MyUnit({mode: "B"});
 *   }
 * }
 *
 * class MyUnit {
 *   readonly config: {mode: string};
 *   constructor(config: {mode: string}) {
 *     super();
 *     this.config = config;
 *   }
 *   @Test
 *   myTest(exam: Exam): void {
 *     exam.ok(this.config.mode);
 *   }
 * }
 * ```
 *
 * @public
 */
export const Unit: {
  <T>(target: UnitMethod<T>, context: ClassMethodDecoratorContext<T, UnitMethod<T>>): void;
  (options: UnitOptions): <T>(target: UnitMethod<T>, context: ClassMethodDecoratorContext<T, UnitMethod<T>>) => void;
} = function <T>(target: UnitMethod<T> | UnitOptions,
                 context?: ClassMethodDecoratorContext<T, UnitMethod<T>>): any {
  if (arguments.length === 1) {
    return UnitRunner.decorate.bind(UnitRunner, target as UnitOptions);
  }
  UnitRunner.decorate({}, target as UnitMethod<T>, context!);
};
