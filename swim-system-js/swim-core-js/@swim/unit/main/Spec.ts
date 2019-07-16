// Copyright 2015-2019 SWIM.AI inc.
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

import {TestOptions} from "./Test";
import {SpecTest} from "./SpecTest";
import {SpecUnit} from "./SpecUnit";
import {Proof} from "./Proof";
import {Report} from "./Report";
import {ConsoleReport} from "./ConsoleReport";
import {Exam} from "./Exam";

/** @hidden */
export interface SpecClass {
  _tests?: SpecTest[];
  _units?: SpecUnit[];
}

/**
 * Specification for testing a unit of code functionality.  A `Spec` evaluates
 * [[TestFunc test functions]], registered with [[Test @Test]] method
 * decorators.  A `Spec` also executes child specs, instantiated by [[UnitSpec
 * unit factory functions]] that are registered with [[Unit @Unit]] method
 * decorators.
 */
export class Spec {
  /**
   * Optional custom name of this `Spec`.
   * @hidden
   */
  _name?: string;

  /**
   * Parent of this `Spec`, if this is not a root spec.
   * @hidden
   */
  _parent?: Spec;

  /**
   * Returns the name of this `Spec`.  Returns the custom `name`, if set via
   * the `name(string)` method; otherwise returns the constructor name of this
   * spec's prototype.
   */
  name(): string;

  /**
   * Sets the name of this `Spec`, and returns `this`.  Setting `name` to `null`
   * reverts this spec's name back to the constructor name of its prototype.
   */
  name(name: string | null): Spec;

  name(name?: string | null): string | Spec {
    if (name === void 0) {
      return typeof this._name === "string" ? this._name : Object.getPrototypeOf(this).constructor.name;
    } else {
      if (name !== null) {
        this._name = name;
      } else {
        this._name = void 0;
      }
      return this;
    }
  }

  /**
   * Returns the `Spec` that instantiated this spec via one of the parent's
   * [[UnitFunc child unit factory functions]]; returns `undefined` if this
   * is a root spec.
   */
  parent(): Spec | undefined {
    return this._parent;
  }

  /**
   * Evaluates all [[TestFunc test functions]] registered with this `Spec`,
   * then executes any child specs returned by [[UnitFunc unit factory
   * functions]] registered with this `Spec`.  Returns a `Promise` that
   * completes with the test report.
   */
  run(report?: Report): Promise<Report> {
    return Spec.run(report, (this as any).__proto__, this);
  }

  /**
   * Returns a new [[Exam]] to be passed to the [[TestFunc test function]] with
   * the given `name`.  `Spec` subclasses can override `createExam` to return a
   * custome `Exam` subclass with added functionality.
   */
  createExam(report: Report, name: string, options: TestOptions): Exam {
    return new Exam(report, this, name, options);
  }

  /**
   * Lifecycle callback invoked before running this `Spec`.
   */
  willRunSpec(report: Report): void {
    // stub
  }

  /**
   * Lifecycle callback invoked before running any [[TestFunc test functions]]
   * registered with this `Spec`.
   */
  willRunTests(report: Report): void {
    // stub
  }

  /**
   * Lifecycle callback invoked before evaluating the `exam`'s [[TestFunc test
   * function]].
   */
  willRunTest(report: Report, exam: Exam): void {
    // stub
  }

  /**
   * Lifecycle callback invoked every time a test function attempts to proove
   * an assertion.
   */
  onProof(report: Report, exam: Exam, proof: Proof): void {
    // stub
  }

  /**
   * Lifecycle callback invoked every time a test function makes a comment.
   */
  onComment(report: Report, exam: Exam, message: string): void {
    // stub
  }

  /**
   * Lifecycle callback invoked after evaluating the `exam`'s [[TestFunc test
   * function]], passing in the returned value of the test function–or a thrown
   * exception–in `result`.
   */
  didRunTest(report: Report, exam: Exam, result: unknown): void {
    // stub
  }

  /**
   * Lifecycle callback invoked after all [[TestFunc test functions]]
   * registered with this `Spec` have been evaluated.
   */
  didRunTests(report: Report): void {
    // stub
  }

  /**
   * Lifecycle callback invoked before executing any child specs returned by
   * [[TestUnit unit factory functions]] registered with this `Spec`.
   */
  willRunUnits(report: Report): void {
    // stub
  }

  /**
   * Lifecycle callback invoked before executing a child `unit` spec.
   */
  willRunUnit(report: Report, unit: Spec): void {
    // stub
  }

  /**
   * Lifecycle callback invoked after executing a child `unit` spec.
   */
  didRunUnit(report: Report, unit: Spec): void {
    // stub
  }

  /**
   * Lifecycle callback invoked after all child specs returned by [[TestUnit
   * unit factory functions]] registered with this `Spec` have been executed.
   */
  didRunUnits(report: Report): void {
    // stub
  }

  /**
   * Lifecycle callback invoked after all [[TestFunc test functions]] and child
   * specs returned by [[UnitFunc unit factory functions]] registered with this
   * `Spec` have been evaluated.
   */
  didRunSpec(report: Report): void {
    // stub
  }

  /**
   * Initializes the prototype of a `Spec` subclass.
   * @hidden
   */
  static init(specClass: SpecClass): void {
    if (!specClass.hasOwnProperty("_tests")) {
      specClass._tests = [];
    }
    if (!specClass.hasOwnProperty("_units")) {
      specClass._units = [];
    }
  }

  /**
   * Evaluates all [[TestFunc test functions]] registered with a `spec`,
   * then executes any child specs returned by [[UnitFunc unit factory
   * functions]] registered with this `Spec`.  Returns a `Promise` that
   * completes with the test report.  Instantiates `spec` from the given
   * `specClass`, if `spec` is undefined.  Uses the constructor function of
   * the `Spec` class on which `run` is invoked, if `specClass` is undefined.
   * Creates a new `ConsoleReport` if `report` is undefined.
   */
  static run(report?: Report, specClass?: SpecClass, spec?: Spec): Promise<Report> {
    if (report === void 0) {
      report = new ConsoleReport();
    }
    if (specClass === void 0) {
      specClass = this.prototype as unknown as SpecClass;
    }
    if (spec === void 0) {
      spec = new (specClass as any).constructor() as Spec;
    }
    let tests = new Array<SpecTest>();
    let units = new Array<SpecUnit>();
    do {
      if (specClass.hasOwnProperty("_tests")) {
        tests = tests.concat(specClass._tests!);
      }
      if (specClass.hasOwnProperty("_units")) {
        units = units.concat(specClass._units!);
      }
      specClass = (specClass as any).__proto__ as SpecClass | undefined;
    } while (specClass);

    if (typeof spec.willRunSpec === "function") {
      spec.willRunSpec(report);
    }
    report.willRunSpec(spec);
    return Spec.runTests(report, spec, tests)
        .then(Spec.runUnits.bind(void 0, report, spec, units))
        .then(Spec.runSuccess.bind(void 0, report, spec) as () => Report,
              Spec.runFailure.bind(void 0, report, spec));
  }

  /**
   * Asynchronously evaluates a list of `tests`.
   * @hidden
   */
  static runTests(report: Report, spec: Spec, tests: SpecTest[]): Promise<Spec> {
    if (typeof spec.willRunTests === "function") {
      spec.willRunTests(report);
    }
    report.willRunTests(spec);
    return Spec.runTest(report, spec, tests, 0)
        .then(Spec.runTestSuccess.bind(void 0, report, spec) as () => Spec,
              Spec.runTestFailure.bind(void 0, report, spec));
  }

  /**
   * Asynchronously executes the next test in a list `tests`.
   * @hidden
   */
  static runTest(report: Report, spec: Spec, tests: SpecTest[], index: number): Promise<SpecTest[]> {
    if (index < tests.length) {
      const testCase = tests[index];
      return testCase.run(report, spec)
          .then(Spec.runTest.bind(void 0, report, spec, tests, index + 1) as () => Promise<SpecTest[]>);
    } else {
      return Promise.resolve(tests);
    }
  }

  /**
   * Asynchronously completes the evaluation of a successful test.
   * @hidden
   */
  static runTestSuccess(report: Report, spec: Spec, result: unknown): Spec {
    report.didRunTests(spec);
    if (typeof spec.didRunTests === "function") {
      spec.didRunTests(report);
    }
    return spec;
  }

  /**
   * Asynchronously completes the evaluation of a failed test.
   * @hidden
   */
  static runTestFailure(report: Report, spec: Spec, error: unknown): never {
    report.didRunTests(spec);
    if (typeof spec.didRunTests === "function") {
      spec.didRunTests(report);
    }
    throw error;
  }

  /**
   * Asynchronously evaluates a list of child `units`.
   * @hidden
   */
  static runUnits(report: Report, spec: Spec, units: SpecUnit[]): Promise<Spec> {
    if (typeof spec.willRunUnits === "function") {
      spec.willRunUnits(report);
    }
    report.willRunUnits(spec);
    return Spec.runUnit(report, spec, units, 0)
        .then(Spec.runUnitsSuccess.bind(void 0, report, spec) as () => Spec,
              Spec.runUnitsFailure.bind(void 0, report, spec));
  }

  /**
   * Asynchronously executes the next unit in a list `units`.
   * @hidden
   */
  static runUnit(report: Report, spec: Spec, units: SpecUnit[], index: number): Promise<SpecUnit[]> {
    if (index < units.length) {
      const testUnit = units[index];
      return testUnit.run(report, spec)
          .then(Spec.runUnit.bind(void 0, report, spec, units, index + 1) as () => Promise<SpecUnit[]>);
    } else {
      return Promise.resolve(units);
    }
  }

  /**
   * Asynchronously completes the execution of a successful child unit.
   * @hidden
   */
  static runUnitsSuccess(report: Report, spec: Spec, result: unknown): Spec {
    report.didRunUnits(spec);
    if (typeof spec.didRunUnits === "function") {
      spec.didRunUnits(report);
    }
    return spec;
  }

  /**
   * Asynchronously completes the execution of a failed child unit.
   * @hidden
   */
  static runUnitsFailure(report: Report, spec: Spec, error: unknown): never {
    report.didRunUnits(spec);
    if (typeof spec.didRunUnits === "function") {
      spec.didRunUnits(report);
    }
    throw error;
  }

  /**
   * Asynchronously completes the successful execution of a `spec`.
   * @hidden
   */
  static runSuccess(report: Report, spec: Spec, result: unknown): Report {
    report.didRunSpec(spec);
    if (typeof spec.didRunSpec === "function") {
      spec.didRunSpec(report);
    }
    return report;
  }

  /**
   * Asynchronously completes the failed execution of a `spec`.
   * @hidden
   */
  static runFailure(report: Report, spec: Spec, error: unknown): Report {
    report.didRunSpec(spec);
    if (typeof spec.didRunSpec === "function") {
      spec.didRunSpec(report);
    }
    return report;
  }
}
