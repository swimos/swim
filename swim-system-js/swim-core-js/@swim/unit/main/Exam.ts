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

import {Objects, Assert} from "@swim/util";
import {Spec} from "./Spec";
import {TestOptions} from "./Test";
import {TestException} from "./TestException";
import {Proof} from "./Proof";
import {Report} from "./Report";

/**
 * The `Passing`/`Failing`/`Pending` status of an `Exam`.
 */
export const enum ExamStatus {
  /**
   * The `Exam` has only valid proof points.
   */
  Passing,
  /**
   * The `Exam` has invalid proof points.
   */
  Failing,
  /**
   * The `Exam` has tentative proof points.
   */
  Pending,
}

export class Exam implements Assert {
  /**
   * The unit test `Report` to which this `Exam` sends results.
   * @hidden
   */
  readonly _report: Report;

  /**
   * The `Spec` that created this `Exam`.
   * @hidden
   */
  readonly _spec: Spec;

  /**
   * The name of the test that this `Exam` is evaluating.
   * @hidden
   */
  readonly _name: string;

  /**
   * The options that govern the behavior of this `Exam`.
   * @hidden
   */
  readonly _options: TestOptions;

  /**
   * The current `Passing`/`Failing`/`Pending` status of this `Exam`.
   * @hidden
   */
  _status: ExamStatus;

  constructor(report: Report, spec: Spec, name: string,
              options: TestOptions, status: ExamStatus = ExamStatus.Passing) {
    this._report = report;
    this._spec = spec;
    this._name = name;
    this._options = options;
    this._status = status;
  }

  /**
   * Returns the unit test `Report` to which this `Exam` sends results.
   */
  report(): Report {
    return this._report;
  }

  /**
   * Returns the `Spec` that created this `Exam`.
   */
  spec(): Spec {
    return this._spec;
  }

  /**
   * Returns the name of the test that this `Exam` is evaluating.
   */
  name(): string {
    return this._name;
  }

  /**
   * Returns the options that govern the behavior of this `Exam`.
   */
  options(): TestOptions {
    return this._options;
  }

  /**
   * Returns the current `Passing`/`Failing`/`Pending` status of this `Exam`.
   */
  status(): ExamStatus {
    return this._status;
  }

  /**
   * Makes a comment about the circumstances of the test case.
   */
  comment(message: string): void {
    if (typeof this._spec.onComment === "function") {
      this._spec.onComment(this._report, this, message);
    }
    this._report.onComment(this._spec, this, message);
  }

  /**
   * Provides `proof` for or against the validity of the test case.
   */
  proove(proof: Proof): void {
    if (!proof.isValid()) {
      this._status = ExamStatus.Failing;
    } else if (proof.isPending()) {
      this._status = ExamStatus.Pending;
    }
    if (typeof this._spec.onProof === "function") {
      this._spec.onProof(this._report, this, proof);
    }
    this._report.onProof(this._spec, this, proof);
  }

  /**
   * Provides tentative proof for the validity of the test case, and throws a
   * `TestException` to cancel evaluation of the test.
   */
  pending(message?: string): void {
    this.proove(Proof.pending(message));
    throw new TestException(message);
  }

  pass(message?: string): void {
    this.proove(Proof.valid("pass", message));
  }

  fail(message?: string): void {
    this.proove(Proof.invalid("fail", message));
    throw new TestException(message);
  }

  throws(fn: () => unknown, expected: Function | RegExp | string = Error, message?: string): void {
    try {
      fn();
      this.proove(Proof.invalid("throws", message));
    } catch (error) {
      if (typeof expected === "function") {
        if (error instanceof expected) {
          this.proove(Proof.valid("throws", message));
        } else {
          this.proove(Proof.invalid("throws", message));
        }
      } else {
        if (typeof expected === "string") {
          expected = new RegExp(expected);
        }
        if (expected instanceof RegExp) {
          if (expected.test(error.toString())) {
            this.proove(Proof.valid("throws", message));
          } else {
            this.proove(Proof.invalid("throws", message));
          }
        } else {
          throw new TypeError("" + expected);
        }
      }
    }
  }

  ok(condition: unknown, message?: string): void {
    if (condition) {
      this.proove(Proof.valid("ok", message));
    } else {
      this.proove(Proof.invalid("ok", message));
      throw new TestException(message);
    }
  }

  notOk(condition: unknown, message?: string): void {
    if (!condition) {
      this.proove(Proof.valid("not ok", message));
    } else {
      this.proove(Proof.invalid("not ok", message));
      throw new TestException(message);
    }
  }

  true(condition: unknown, message?: string): void {
    if (condition) {
      this.proove(Proof.valid("true", message));
    } else {
      this.proove(Proof.invalid("true", message));
      throw new TestException(message);
    }
  }

  false(condition: unknown, message?: string): void {
    if (!condition) {
      this.proove(Proof.valid("false", message));
    } else {
      this.proove(Proof.invalid("false", message));
      throw new TestException(message);
    }
  }

  equal(lhs: unknown, rhs: unknown, message?: string): void {
    if (Objects.equal(lhs, rhs)) {
      this.proove(Proof.valid("equal", message));
    } else {
      this.proove(Proof.refuted(lhs, "equal", rhs, message));
      throw new TestException(message);
    }
  }

  notEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (!Objects.equal(lhs, rhs)) {
      this.proove(Proof.valid("not equal"));
    } else {
      this.proove(Proof.refuted(lhs, "not equal", rhs, message));
      throw new TestException(message);
    }
  }

  identity(lhs: unknown, rhs: unknown, message?: string): void {
    if (lhs === rhs) {
      this.proove(Proof.valid("identity", message));
    } else {
      this.proove(Proof.refuted(lhs, "===", rhs, message));
      throw new TestException(message);
    }
  }

  notIdentity(lhs: unknown, rhs: unknown, message?: string): void {
    if (lhs !== rhs) {
      this.proove(Proof.valid("not identity", message));
    } else {
      this.proove(Proof.refuted(lhs, "!==", rhs, message));
      throw new TestException(message);
    }
  }

  compareLessThan(lhs: unknown, rhs: unknown, message?: string): void {
    if (Objects.compare(lhs, rhs) < 0) {
      this.proove(Proof.valid("compare less than", message));
    } else {
      this.proove(Proof.refuted(lhs, "<", rhs, message));
      throw new TestException(message);
    }
  }

  compareNotLessThan(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Objects.compare(lhs, rhs) < 0)) {
      this.proove(Proof.valid("compare not less than", message));
    } else {
      this.proove(Proof.refuted(lhs, "!<", rhs, message));
      throw new TestException(message);
    }
  }

  compareLessThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (Objects.compare(lhs, rhs) <= 0) {
      this.proove(Proof.valid("compare less than or equal", message));
    } else {
      this.proove(Proof.refuted(lhs, "<=", rhs, message));
      throw new TestException(message);
    }
  }

  compareNotLessThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Objects.compare(lhs, rhs) <= 0)) {
      this.proove(Proof.valid("compare not less than or equal", message));
    } else {
      this.proove(Proof.refuted(lhs, "!<=", rhs, message));
      throw new TestException(message);
    }
  }

  compareEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (Objects.compare(lhs, rhs) === 0) {
      this.proove(Proof.valid("compare equal", message));
    } else {
      this.proove(Proof.refuted(lhs, "==", rhs, message));
      throw new TestException(message);
    }
  }

  compareNotEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Objects.compare(lhs, rhs) === 0)) {
      this.proove(Proof.valid("compare not equal", message));
    } else {
      this.proove(Proof.refuted(lhs, "!=", rhs, message));
      throw new TestException(message);
    }
  }

  compareGreaterThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (Objects.compare(lhs, rhs) >= 0) {
      this.proove(Proof.valid("compare greater than or equal", message));
    } else {
      this.proove(Proof.refuted(lhs, ">=", rhs, message));
      throw new TestException(message);
    }
  }

  compareNotGreaterThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Objects.compare(lhs, rhs) >= 0)) {
      this.proove(Proof.valid("compare not greater than or equal", message));
    } else {
      this.proove(Proof.refuted(lhs, "!>=", rhs, message));
      throw new TestException(message);
    }
  }

  compareGreaterThan(lhs: unknown, rhs: unknown, message?: string): void {
    if (Objects.compare(lhs, rhs) > 0) {
      this.proove(Proof.valid("compare greater than", message));
    } else {
      this.proove(Proof.refuted(lhs, ">", rhs, message));
      throw new TestException(message);
    }
  }

  compareNotGreaterThan(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Objects.compare(lhs, rhs) > 0)) {
      this.proove(Proof.valid("compare not greater than", message));
    } else {
      this.proove(Proof.refuted(lhs, "!>", rhs, message));
      throw new TestException(message);
    }
  }
}
