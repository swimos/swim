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

import {TestException} from "./TestException";
import type {TestFunc, TestOptions} from "./Test";
import {SpecClass, Spec} from "./Spec";
import {Proof} from "./Proof";
import type {Report} from "./Report";
import {Exam} from "./Exam";

/**
 * Test function registration descriptor.  A `SpecTest` associates a [[TestFunc
 * test function]] with [[TestOptions test options]].  The [[run]] method
 * manages the–possibly asynchronous–evaluation of the test function in the
 * context of a particular `Spec` instance.
 */
export class SpecTest {
  constructor(name: string, func: TestFunc, options: TestOptions) {
    Object.defineProperty(this, "name", {
      value: name,
      enumerable: true,
    });
    Object.defineProperty(this, "func", {
      value: func,
      enumerable: true,
    });
    Object.defineProperty(this, "options", {
      value: options,
      enumerable: true,
    });
  }

  /**
   * The name of this test–typically the name of the underlying test function.
   */
  declare readonly name: string;

  /**
   * The function used to evaluate this test.
   */
  declare readonly func: TestFunc;

  /**
   * The options that govern the evaluation of this test.
   */
  declare readonly options: TestOptions;

  /**
   * Lifecycle callback invoked before each evaluation of the test function.
   */
  willRunTest(report: Report, spec: Spec, exam: Exam): void {
    if (typeof spec.willRunTest === "function") {
      spec.willRunTest(report, exam);
    }
    report.willRunTest(spec, exam);
  }

  /**
   * Lifecycle callback invoked after the–possibly asynchronous–completion of
   * each evaluation of the test function.  The `result` of a synchronous test
   * is the return value of the test function, if the test passed, or the
   * thrown exception, if the test failed.  The `result` of an asynchronous
   * test is the fulfilled value, or the rejected reason, of the `Promise`
   * returned by the test function.
   */
  didRunTest(report: Report, spec: Spec, exam: Exam, result: unknown): void {
    report.didRunTest(spec, exam, result);
    if (typeof spec.didRunTest === "function") {
      spec.didRunTest(report, exam, result);
    }
  }

  /**
   * Evaluates the underlying test function as a method on the given
   * `spec`, generating the given `report`.  Returns a `Promise` that
   * completes with the `Exam` result, regardless of the success or failure
   * of the underlying test function.
   */
  run(report: Report, spec: Spec): Promise<Exam> {
    let exam;
    if (typeof spec.createExam === "function") {
      exam = spec.createExam(report, this.name, this.options);
    } else {
      exam = new Exam(report, spec, this.name, this.options);
    }
    try {
      this.willRunTest(report, spec, exam);
      let result;
      if (this.options.pending) {
        exam.pending();
      } else {
        result = this.func.call(spec, exam);
      }
      if (result instanceof Promise) {
        return result.then(this.runTestSuccess.bind(this, report, spec, exam),
                           this.runTestFailure.bind(this, report, spec, exam));
      } else {
        this.didRunTest(report, spec, exam, result);
        return Promise.resolve(exam);
      }
    } catch (error) {
      if (!(error instanceof TestException)) {
        exam.proove(Proof.error(error));
      }
      this.didRunTest(report, spec, exam, error);
      return Promise.resolve(exam);
    }
  }

  /**
   * Asynchronous completes the evaluation of a successful test.
   * @hidden
   */
  runTestSuccess(report: Report, spec: Spec, exam: Exam, result: unknown): Exam {
    this.didRunTest(report, spec, exam, result);
    return exam;
  }

  /**
   * Asynchronous completes the evaluation of a failed test.
   * @hidden
   */
  runTestFailure(report: Report, spec: Spec, exam: Exam, error: unknown): Exam {
    if (!(error instanceof TestException)) {
      exam.proove(Proof.error(error));
    }
    this.didRunTest(report, spec, exam, error);
    return exam;
  }

  /**
   * Curried [[Test]] method decorator, with captured `options`.
   * @hidden
   */
  static decorate(options: TestOptions, target: SpecClass, propertyKey: string | symbol,
                  descriptor: PropertyDescriptor): void {
    Spec.init(target);
    const test = new SpecTest(propertyKey.toString(), descriptor.value, options);
    target.tests!.push(test);
  }
}
