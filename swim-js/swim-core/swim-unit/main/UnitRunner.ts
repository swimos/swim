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

import type {UnitMethod} from "./Unit";
import type {UnitOptions} from "./Unit";
import {Suite} from "./"; // forward import
import type {Report} from "./Report";

/** @internal */
export const UnitRunnerCache: unique symbol = Symbol("UnitRunnerCache");

/** @internal */
export interface UnitRunnerContext<T = unknown> {
  /** @internal */
  [UnitRunnerCache]: {[unitName: string]: UnitRunner<T> | undefined};
}

/**
 * A unit test factory registration descriptor. A `UnitRunner` associates
 * a [[UnitMethod unit test factory]] with [[UnitOptions unit test options]].
 *
 * @internal
 */
export class UnitRunner<T = unknown> {
  constructor(name: string, method: UnitMethod<T>, options: UnitOptions) {
    this.name = name;
    this.method = method;
    this.options = options;
  }

  /**
   * The name of this unit test–typically the name of the factory function.
   */
  readonly name: string;

  /**
   * The factory function used to instantiate child units.
   */
  readonly method: UnitMethod<T>;

  /**
   * The options that govern the execution of this unit.
   */
  readonly options: UnitOptions;

  /**
   * Executes a set of child units by evaluating the underlying unit test
   * factory method, and asynchronously executes each instantiated test suite
   * in turn. Returns a `Promise` that completes with the generated child units.
   */
  run(report: Report, parent: Suite, context: T): Promise<Object[] | Object | undefined> {
    const units = this.method.call(context);
    if (units === void 0) {
      return Promise.resolve(void 0);
    } else if (Array.isArray(units)) {
      return this.runUnit(report, parent, units, 0);
    }
    let child: Suite;
    if (units instanceof Suite) {
      child = units;
    } else {
      child = new Suite(this.name);
    }
    child.setParent(parent);
    this.willRunUnit(report, parent, child);
    return child.run(report, units)
        .then(this.runUnitSuccess.bind(this, report, parent, child),
              this.runUnitFailure.bind(this, report, parent, child));
  }

  /**
   * Asynchronously executes the next unit in an array of child units.
   * @internal
   */
  runUnit(report: Report, parent: Suite, units: Object[], index: number): Promise<Object[]> {
    if (index >= units.length) {
      return Promise.resolve(units);
    }
    const unit = units[index]!;
    let child: Suite;
    if (unit instanceof Suite) {
      child = unit;
    } else {
      child = new Suite(this.name);
    }
    child.setParent(parent);
    this.willRunUnit(report, parent, child);
    return child.run(report, unit)
        .then(this.runUnitSuccess.bind(this, report, parent, child),
              this.runUnitFailure.bind(this, report, parent, child))
        .then(this.runUnit.bind(this, report, parent, units, index + 1));
  }

  /**
   * Asynchronously completes the execution of a successful child unit.
   * @internal
   */
  runUnitSuccess(report: Report, suite: Suite, unit: Suite): Suite {
    this.didRunUnit(report, suite, unit);
    return unit;
  }

  /**
   * Asynchronous completes the execution of a failed child unit.
   * @internal
   */
  runUnitFailure(report: Report, suite: Suite, unit: Suite, error: unknown): never {
    // A child suite can only fail if it encounters a bug in the test framework.
    throw error;
  }

  /**
   * Lifecycle callback invoked before the execution of each child unit.
   */
  willRunUnit(report: Report, suite: Suite, unit: Suite): void {
    suite.willRunUnit(report, unit);
    if (report.willRunUnit !== void 0) {
      report.willRunUnit(suite, unit);
    }
  }

  /**
   * Lifecycle callback invoked after the execution of each child unit.
   */
  didRunUnit(report: Report, suite: Suite, unit: Suite): void {
    if (report.didRunUnit !== void 0) {
      report.didRunUnit(suite, unit);
    }
    suite.didRunUnit(report, unit);
  }

  /**
   * Curried [[Unit]] method decorator with captured `options`.
   * @internal
   */
  static decorate<T>(options: UnitOptions, target: UnitMethod<T>,
                     context: ClassMethodDecoratorContext<T, UnitMethod<T>>): void {
    if (typeof context.name === 'symbol') {
      throw new Error("unsupported symbol name for unit");
    }
    const runner = new UnitRunner<T>(context.name, target, options);

    context.addInitializer(function (this: T): void {
      const contextClass = (this as any).constructor as UnitRunnerContext<T>;
      if (!Object.prototype.hasOwnProperty.call(contextClass, UnitRunnerCache)) {
        Object.defineProperty(contextClass, UnitRunnerCache, {
          value: Object.create(null),
          configurable: true,
        });
      }
      contextClass[UnitRunnerCache][runner.name] = runner;
    });
  }
}
