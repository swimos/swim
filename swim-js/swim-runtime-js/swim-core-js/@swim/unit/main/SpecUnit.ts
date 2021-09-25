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

import type {UnitFunc, UnitOptions} from "./Unit";
import {SpecClass, Spec} from "./Spec";
import type {Report} from "./Report";

/**
 * Test unit factory function registration descriptor.  A `SpecUnit` associates
 * a [[UnitFunc test unit factory function]] with [[UnitOptions unit options]].
 * The [[run]] method manages the asynchronous execution of the test unit in
 * the context of a particular parent `Spec` instance.
 */
export class SpecUnit {
  constructor(name: string, func: UnitFunc, options: UnitOptions) {
    this.name = name;
    this.func = func;
    this.options = options;
  }

  /**
   * The name of this `SpecUnit`–typically the name of the factory function
   * that instantiates its child specs.
   */
  readonly name: string;

  /**
   * The factory function used to instantiate child specs to be executed by
   * the test unit.
   */
  readonly func: UnitFunc;

  /**
   * The options that govern the execution of this test unit.
   */
  readonly options: UnitOptions;

  /**
   * Lifecycle callback invoked before the execution of each child spec
   * instantiated by this test unit.
   */
  willRunUnit(report: Report, spec: Spec, unit: Spec): void {
    if (typeof spec.willRunUnit === "function") {
      spec.willRunUnit(report, unit);
    }
    report.willRunUnit(spec, unit);
  }

  /**
   * Lifecycle callback invoked after all child specs instantiated by this test
   * unit have been executed.
   */
  didRunUnit(report: Report, spec: Spec, unit: Spec): void {
    report.didRunUnit(spec, unit);
    if (typeof spec.didRunUnit === "function") {
      spec.didRunUnit(report, unit);
    }
  }

  /**
   * Generates a set of child specs by evaluating the underlying test unit
   * factory function as a method on the given `spec`, and asynchronously
   * executes each instantiated test spec in turn.  Returns a `Promise` that
   * completes with the generated child test specs.
   */
  run(report: Report, spec: Spec): Promise<Spec[] | Spec | undefined> {
    const units = this.func.call(spec);
    if (Array.isArray(units)) {
      return this.runUnit(report, spec, units, 0);
    } else if (units !== void 0) {
      units.setParent(spec);
      this.willRunUnit(report, spec, units);
      return units.run(report)
          .then(this.runUnitSuccess.bind(this, report, spec, units),
                this.runUnitFailure.bind(this, report, spec, units));
    } else {
      return Promise.resolve(void 0);
    }
  }

  /**
   * Asynchronously executes the next spec in an array of child specs.
   * @hidden
   */
  runUnit(report: Report, spec: Spec, units: Spec[], index: number): Promise<Spec[]> {
    if (index < units.length) {
      const unit = units[index]!;
      unit.setParent(spec);
      this.willRunUnit(report, spec, unit);
      return unit.run(report)
          .then(this.runUnitSuccess.bind(this, report, spec, unit),
                this.runUnitFailure.bind(this, report, spec, unit))
          .then(this.runUnit.bind(this, report, spec, units, index + 1));
    } else {
      return Promise.resolve(units);
    }
  }

  /**
   * Asynchronously completes the execution of a successfuly child unit.
   * @hidden
   */
  runUnitSuccess(report: Report, spec: Spec, unit: Spec): Spec {
    this.didRunUnit(report, spec, unit);
    return unit;
  }

  /**
   * Asynchronous completes the execution of a failed child unit.
   * @hidden
   */
  runUnitFailure(report: Report, spec: Spec, unit: Spec, error: unknown): never {
    // A child spec can only fail if it encounters a bug in the test framework.
    throw error;
  }

  /**
   * Curried [[Unit]] method decorator, with captured `options`.
   * @hidden
   */
  static decorate(options: UnitOptions, target: SpecClass, propertyKey: string | symbol,
                  descriptor: PropertyDescriptor): void {
    Spec.init(target);
    const unit = new SpecUnit(propertyKey.toString(), descriptor.value, options);
    target.units!.push(unit);
  }
}
