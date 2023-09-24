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

import {TestException} from "./TestException";
import {Proof} from "./Proof";
import type {Exam} from "./Exam";
import type {TestMethod} from "./Test";
import type {TestOptions} from "./Test";
import type {Suite} from "./Suite";
import type {Report} from "./Report";

/** @internal */
export const TestRunnerCache: unique symbol = Symbol("TestRunnerCache");

/** @internal */
export interface TestRunnerContext<T = unknown> {
  /** @internal */
  [TestRunnerCache]: {[testName: string]: TestRunner<T> | undefined};
}

/**
 * A test method registration descriptor. A `TestRunner` associates
 * a [[TestMethod test method]] with [[TestOptions test options]].
 *
 * @internal
 */
export class TestRunner<T = unknown> {
  constructor(name: string, method: TestMethod<T>, options: TestOptions) {
    this.name = name;
    this.method = method;
    this.options = options;
  }

  /**
   * The name of this test–typically the name of the test method.
   */
  readonly name: string;

  /**
   * The method used to evaluate this test.
   */
  readonly method: TestMethod<T>;

  /**
   * The options that govern the evaluation of this test.
   */
  readonly options: TestOptions;

  /**
   * Evaluates the underlying test method, generating the given `report`.
   * Returns a `Promise` that completes with the `Exam` result, regardless
   * of the success or failure of the underlying test method.
   */
  run(report: Report, suite: Suite, context: T): Promise<Exam> {
    const exam = suite.createExam(report, this.name, this.options);
    this.willRunTest(report, suite, exam);
    let result: unknown;
    if (this.options.pending) {
      exam.pending();
    } else {
      try {
        result = this.method.call(context, exam);
      } catch (error) {
        result = error;
        if (!(error instanceof TestException)) {
          exam.prove(Proof.error(error));
        }
      }
    }
    if (result instanceof Promise) {
      return result.then(this.runTestSuccess.bind(this, report, suite, exam),
                         this.runTestFailure.bind(this, report, suite, exam));
    }
    this.didRunTest(report, suite, exam, result);
    return Promise.resolve(exam);
  }

  /**
   * Asynchronous completes the evaluation of a successful test.
   * @internal
   */
  runTestSuccess(report: Report, suite: Suite, exam: Exam, result: unknown): Exam {
    this.didRunTest(report, suite, exam, result);
    return exam;
  }

  /**
   * Asynchronous completes the evaluation of a failed test.
   * @internal
   */
  runTestFailure(report: Report, suite: Suite, exam: Exam, error: unknown): Exam {
    if (!(error instanceof TestException)) {
      exam.prove(Proof.error(error));
    }
    this.didRunTest(report, suite, exam, error);
    return exam;
  }

  /**
   * Lifecycle callback invoked before each evaluation of the test method.
   */
  willRunTest(report: Report, suite: Suite, exam: Exam): void {
    suite.willRunTest(report, exam);
    if (report.willRunTest !== void 0) {
      report.willRunTest(suite, exam);
    }
  }

  /**
   * Lifecycle callback invoked after the–possibly asynchronous–completion of
   * each evaluation of the test method. The `result` of a synchronous test
   * is the return value of the test method, if the test passed, or the
   * thrown exception, if the test failed. The `result` of an asynchronous
   * test is the fulfilled value, or the rejected reason, of the `Promise`
   * returned by the test method.
   */
  didRunTest(report: Report, suite: Suite, exam: Exam, result: unknown): void {
    if (report.didRunTest !== void 0) {
      report.didRunTest(suite, exam, result);
    }
    suite.didRunTest(report, exam, result);
  }

  /**
   * Curried [[Test]] method decorator with captured `options`.
   * @internal
   */
  static decorate<T>(options: TestOptions, target: TestMethod<T>,
                     context: ClassMethodDecoratorContext<T, TestMethod<T>>): void {
    if (typeof context.name === 'symbol') {
      throw new Error("unsupported symbol name for test");
    }
    const runner = new TestRunner<T>(context.name, target, options);

    context.addInitializer(function (this: T): void {
      const contextClass = (this as any).constructor as TestRunnerContext<T>;
      if (!Object.prototype.hasOwnProperty.call(contextClass, TestRunnerCache)) {
        Object.defineProperty(contextClass, TestRunnerCache, {
          value: Object.create(null),
          configurable: true,
        });
      }
      contextClass[TestRunnerCache][runner.name] = runner;
    });
  }
}
