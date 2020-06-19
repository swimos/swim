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

import {SpecClass, Spec} from "./Spec";
import {SpecUnit} from "./SpecUnit";

/**
 * Unit test factory function that returns a child [[Spec]], or a list of child
 * specs to run.  Returns `undefined` if no child specs should be run.
 *
 * ### Examples
 *
 * ```
 * class MySpec extends Spec {
 *   @Unit
 *   myUnit(): Spec {
 *     return new MyUnit();
 *   }
 *
 *   @Unit
 *   myUnits(): Spec[] {
 *     return [new MyUnit({mode: "A"}), new MyUnit({mode: "B"})];
 *   }
 * }
 * ```
 */
export type UnitFunc = () => Spec[] | Spec | undefined;

/**
 * [[UnitFunc Unit test factory function]] registration options.  `UnitOptions`
 * are passed to the [[Unit]] method decorator factory to modify the
 * registration of unit test factory functions with the enclosing [[Spec]].
 */
export interface UnitOptions {
  /**
   * `true` if the unit test should not be executed.
   */
  pending?: boolean;
}

/**
 * Returns a method decorator that registers [[UnitFunc unit test factory
 * functions]] with the enclosing [[Spec]], using the given `options`.
 *
 * ### Examples
 *
 * ```
 * class MySpec extends Spec {
 *   @Unit
 *   myUnitA(): Spec {
 *     return new MyUnit({mode: "A"});
 *   }
 *   @Unit
 *   myUnitB(): Spec {
 *     return new MyUnit({mode: "B"});
 *   }
 * }
 *
 * class MyUnit extends Spec {
 *   readonly options: {[key: string]: unknown};
 *   constructor(options: {[key: string]: unknown}) {
 *     super();
 *     this.options = options;
 *   }
 *   @Test
 *   myTest(exam: Exam): void {
 *     exam.ok(this.options.mode);
 *   }
 * }
 * ```
 */
export function Unit(options: UnitOptions): MethodDecorator;

/**
 * Method decorator that registers a [[UnitFunc unit test factory function]]
 * with the enclosing [[Spec]].
 *
 * ### Examples
 *
 * ```
 * class MySpec extends Spec {
 *   @Unit
 *   myUnit(): Spec {
 *     return new MyUnit();
 *   }
 * }
 *
 * class MyUnit extends Spec {
 *   @Test
 *   myTest(exam: Exam): void {
 *     exam.assert(true);
 *   }
 * }
 * ```
 */
export function Unit(target: unknown, name: string, descriptor: PropertyDescriptor): void;

/**
 * Class decorator that initializes a `Spec` subclass.
 */
export function Unit(constructor: Function): void;

export function Unit(target: unknown, name?: string,
                     descriptor?: PropertyDescriptor): MethodDecorator | void {
  if (arguments.length === 1) {
    if (typeof target === "function") {
      const specClass = target.prototype as SpecClass;
      Spec.init(specClass);
    } else {
      return SpecUnit.decorate.bind(void 0, target as UnitOptions);
    }
  } else {
    SpecUnit.decorate({}, target as SpecClass, name!, descriptor!);
  }
}
