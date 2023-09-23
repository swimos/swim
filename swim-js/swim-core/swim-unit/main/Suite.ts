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

import type {Mutable} from "@swim/util";
import type {Proof} from "./Proof";
import {Exam} from "./Exam";
import type {TestOptions} from "./Test";
import {TestRunnerCache} from "./TestRunner";
import type {TestRunnerContext} from "./TestRunner";
import type {TestRunner} from "./TestRunner";
import {UnitRunnerCache} from "./UnitRunner";
import type {UnitRunnerContext} from "./UnitRunner";
import type {UnitRunner} from "./UnitRunner";
import type {Report} from "./Report";
import {ConsoleReport} from "./"; // forward import

/**
 * Specification for testing a unit of code functionality. A `Suite` evaluates
 * [[TestMethod test methods]], registered with [[Test `@Test`]] method
 * decorators. A `Suite` also executes child units, instantiated by [[UnitSpec
 * unit factory functions]] that are registered with [[Unit `@Unit`]] method
 * decorators.
 * @public
 */
export class Suite {
  constructor(name?: string) {
    if (name === void 0) {
      name = this.constructor.name;
    }
    this.name = name;
    this.parent = null;
  }

  /**
   * The name of this test suite. Defaults to the name of suite's
   * constructor function.
   */
  readonly name: string;

  /**
   * The `Suite` that instantiated this suite via one of the parent's
   * [[UnitMethod unit factory]] methods, or `null` if this is a root suite.
   */
  readonly parent: Suite | null;

  /** @internal */
  setParent(parent: Suite | null): void {
    (this as Mutable<this>).parent = parent;
  }

  /**
   * Evaluates all [[TestMethod test methods]] associated with this suite,
   * then executes any child units returned by [[UnitMethod unit test factory]]
   * methods associated with this suite. Returns a `Promise` that completes
   * with the test report.
   */
  run(report?: Report, context?: Object): Promise<Report> {
    if (report === void 0) {
      report = new ConsoleReport();
    }
    if (context === void 0) {
      context = this;
    }

    const contextClass = context.constructor as unknown as TestRunnerContext & UnitRunnerContext;
    const tests = TestRunnerCache in contextClass
                ? Object.values(contextClass[TestRunnerCache]) as TestRunner[]
                : [];
    const units = UnitRunnerCache in contextClass
                ? Object.values(contextClass[UnitRunnerCache]) as UnitRunner[]
                : [];

    this.willRunSuite(report);
    if (report.willRunSuite !== void 0) {
      report.willRunSuite(this);
    }
    return Suite.runTests(report, this, context, tests)
        .then(Suite.runUnits.bind(void 0, report, this, context, units))
        .then(Suite.runSuccess.bind(void 0, report, this),
              Suite.runFailure.bind(void 0, report, this));
  }

  /**
   * Asynchronously evaluates a list of `tests`.
   * @internal
   */
  static runTests(report: Report, suite: Suite, context: Object,
                  tests: TestRunner[]): Promise<Suite> {
    suite.willRunTests(report);
    if (report.willRunTests !== void 0) {
      report.willRunTests(suite);
    }
    return Suite.runTest(report, suite, context, tests, 0)
        .then(Suite.runTestSuccess.bind(void 0, report, suite),
              Suite.runTestFailure.bind(void 0, report, suite));
  }

  /**
   * Asynchronously executes the next test in a list `tests`.
   * @internal
   */
  static runTest(report: Report, suite: Suite, context: Object,
                 tests: TestRunner[], index: number): Promise<TestRunner[]> {
    if (index >= tests.length) {
      return Promise.resolve(tests);
    }
    const testCase = tests[index]!;
    return testCase.run(report, suite, context)
        .then(Suite.runTest.bind(void 0, report, suite, context, tests, index + 1));
  }

  /**
   * Asynchronously completes the evaluation of a successful test.
   * @internal
   */
  static runTestSuccess(report: Report, suite: Suite, result: unknown): Suite {
    if (report.didRunTests !== void 0) {
      report.didRunTests(suite);
    }
    suite.didRunTests(report);
    return suite;
  }

  /**
   * Asynchronously completes the evaluation of a failed test.
   * @internal
   */
  static runTestFailure(report: Report, suite: Suite, error: unknown): never {
    if (report.didRunTests !== void 0) {
      report.didRunTests(suite);
    }
    suite.didRunTests(report);
    throw error;
  }

  /**
   * Asynchronously evaluates a list of child `units`.
   * @internal
   */
  static runUnits(report: Report, suite: Suite, context: Object,
                  units: UnitRunner[]): Promise<Suite> {
    suite.willRunUnits(report);
    if (report.willRunUnits !== void 0) {
      report.willRunUnits(suite);
    }
    return Suite.runUnit(report, suite, context, units, 0)
        .then(Suite.runUnitsSuccess.bind(void 0, report, suite),
              Suite.runUnitsFailure.bind(void 0, report, suite));
  }

  /**
   * Asynchronously executes the next unit in a list `units`.
   * @internal
   */
  static runUnit(report: Report, suite: Suite, context: Object,
                 units: UnitRunner[], index: number): Promise<UnitRunner[]> {
    if (index >= units.length) {
      return Promise.resolve(units);
    }
    const testUnit = units[index]!;
    return testUnit.run(report, suite, context)
        .then(Suite.runUnit.bind(void 0, report, suite, context, units, index + 1));
  }

  /**
   * Asynchronously completes the execution of a successful child unit.
   * @internal
   */
  static runUnitsSuccess(report: Report, suite: Suite, result: unknown): Suite {
    if (report.didRunUnits !== void 0) {
      report.didRunUnits(suite);
    }
    suite.didRunUnits(report);
    return suite;
  }

  /**
   * Asynchronously completes the execution of a failed child unit.
   * @internal
   */
  static runUnitsFailure(report: Report, suite: Suite, error: unknown): never {
    if (report.didRunUnits !== void 0) {
      report.didRunUnits(suite);
    }
    suite.didRunUnits(report);
    throw error;
  }

  /**
   * Asynchronously completes the successful execution of a `suite`.
   * @internal
   */
  static runSuccess(report: Report, suite: Suite, result: unknown): Report {
    if (report.didRunSpec !== void 0) {
      report.didRunSpec(suite);
    }
    suite.didRunSpec(report);
    return report;
  }

  /**
   * Asynchronously completes the failed execution of a `suite`.
   * @internal
   */
  static runFailure(report: Report, suite: Suite, error: unknown): Report {
    if (report.didRunSpec !== void 0) {
      report.didRunSpec(suite);
    }
    suite.didRunSpec(report);
    return report;
  }

  /**
   * Returns a new [[Exam]] to be passed to the [[TestMethod test methods]]
   * with the given `name`. `Suite` subclasses can override `createExam` to
   * return a custom `Exam` subclass with added functionality.
   */
  createExam(report: Report, name: string, options: TestOptions): Exam {
    return new Exam(report, this, name, options);
  }

  /**
   * Lifecycle callback invoked before running this `Suite`.
   */
  willRunSuite(report: Report): void {
    // hook
  }

  /**
   * Lifecycle callback invoked before running any [[TestMethod test methods]]
   * registered with this `Suite`.
   */
  willRunTests(report: Report): void {
    // hook
  }

  /**
   * Lifecycle callback invoked before evaluating the `exam`'s
   * [[TestMethod test method]].
   */
  willRunTest(report: Report, exam: Exam): void {
    // hook
  }

  /**
   * Lifecycle callback invoked every time a test function attempts to prove
   * an assertion.
   */
  onProof(report: Report, exam: Exam, proof: Proof): void {
    // hook
  }

  /**
   * Lifecycle callback invoked every time a test function makes a comment.
   */
  onComment(report: Report, exam: Exam, message: string): void {
    // hook
  }

  /**
   * Lifecycle callback invoked after evaluating the `exam`'s
   * [[TestMethod test method]], passing in the returned value
   * of the test method–or a thrown exception–in `result`.
   */
  didRunTest(report: Report, exam: Exam, result: unknown): void {
    // hook
  }

  /**
   * Lifecycle callback invoked after all [[TestMethod test methods]]
   * registered with this `Suite` have been evaluated.
   */
  didRunTests(report: Report): void {
    // hook
  }

  /**
   * Lifecycle callback invoked before executing any child units returned
   * by [[TestUnit unit factory functions]] registered with this `Suite`.
   */
  willRunUnits(report: Report): void {
    // hook
  }

  /**
   * Lifecycle callback invoked before executing a child `unit` suite.
   */
  willRunUnit(report: Report, unit: Suite): void {
    // hook
  }

  /**
   * Lifecycle callback invoked after executing a child `unit` suite.
   */
  didRunUnit(report: Report, unit: Suite): void {
    // hook
  }

  /**
   * Lifecycle callback invoked after all child units returned by [[TestUnit
   * unit factory functions]] registered with this `Suite` have been executed.
   */
  didRunUnits(report: Report): void {
    // hook
  }

  /**
   * Lifecycle callback invoked after all [[TestMethod test methods]] and
   * child units returned by [[UnitMethod unit test factory]] methods
   * registered with this `Suite` have been evaluated.
   */
  didRunSpec(report: Report): void {
    // hook
  }

  /**
   * Instantiates and runs an instance of this test suite.
   */
  static run(report?: Report): Promise<Report> {
    const suite = new this();
    return suite.run(report, suite);
  }
}
