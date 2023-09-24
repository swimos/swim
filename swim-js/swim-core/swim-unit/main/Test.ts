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

import type {Exam} from "./Exam";
import {TestRunner} from "./"; // forward import

/**
 * A test evaluation function that tries to prove a unit test case.
 * Test functions verify test conditions using the provided [[Exam]] object.
 * Synchronous tests return `void`, and asynchronous tests return a `Promise`.
 *
 * ### Examples
 *
 * ```
 * class MySuite {
 *   @Test
 *   myTest(exam: Exam): void {
 *     exam.ok(true);
 *   }
 *
 *   @Test
 *   myAsyncTest(exam: Exam): Promise<unknown> {
 *     return new Promise((resolve, reject) => {
 *       setTimeout(() => {
 *         exam.ok(true);
 *         resolve();
 *       }, 250);
 *     })
 *   }
 * }
 * ```
 *
 * @throws [TestException] if a test assertion fails.
 * @public
 */
export type TestMethod<T = unknown, E extends Exam = Exam> =
  (this: T, exam: E) => Promise<unknown> | unknown | void;

/**
 * [[TestMethod test function]] options. `TestOptions` can be passed to the
 * [[Test]] decorator factory to modify the behavior of registered tests.
 *
 * @public
 */
export interface TestOptions {
  /**
   * `true` if the test function should not be evaluated.
   */
  pending?: boolean;
}

/**
 * Method decorator that registers [[TestMethod test functions]].
 *
 * ### Examples
 *
 * ```
 * class MySuite {
 *   @Test
 *   myTest(exam: Exam): void {
 *     exam.ok(true);
 *   }
 * }
 *
 * class MySuite {
 *   @Test({pending: true})
 *   myTest(exam: Exam): void {
 *     throw new Error("unreachable");
 *   }
 * }
 * ```
 *
 * @public
 */
export const Test: {
  <T, E extends Exam = Exam>(target: TestMethod<T, E>, context: ClassMethodDecoratorContext<T, TestMethod<T, E>>): void;
  (options: TestOptions): <T, E extends Exam = Exam>(target: TestMethod<T, E>, context: ClassMethodDecoratorContext<T, TestMethod<T, E>>) => void;
} = function <T>(target: TestMethod<T> | TestOptions,
                 context?: ClassMethodDecoratorContext<T, TestMethod<T>>): any {
  if (arguments.length === 1) {
    return TestRunner.decorate.bind(Test, target as TestOptions);
  }
  TestRunner.decorate({}, target as TestMethod<T>, context!);
};
