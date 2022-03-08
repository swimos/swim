// Copyright 2015-2022 Swim.inc
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

import {Mutable, Values, Assert} from "@swim/util";
import {TestException} from "./TestException";
import type {TestOptions} from "./Test";
import type {Spec} from "./Spec";
import {Proof} from "./Proof";
import type {Report} from "./Report";

/**
 * The `Passing`/`Failing`/`Pending` status of an `Exam`.
 * - "passing": the `Exam` has only valid proof points.
 * - "failing": the `Exam` has invalid proof points.
 * - "pending": the `Exam` has tentative proof points.
 * @public
 */
export type ExamStatus = "passing" | "failing" | "pending";

/** @public */
export class Exam implements Assert {
  constructor(report: Report, spec: Spec, name: string, options: TestOptions) {
    this.report = report;
    this.spec = spec;
    this.name = name;
    this.options = options;
    this.status = "passing";
  }

  /**
   * The unit test `Report` to which this `Exam` sends results.
   */
  readonly report: Report;

  /**
   * The `Spec` that created this `Exam`.
   */
  readonly spec: Spec;

  /**
   * The name of the test that this `Exam` is evaluating.
   */
  readonly name: string;

  /**
   * Returns the options that govern the behavior of this `Exam`.
   */
  readonly options: TestOptions;

  /**
   * Returns the current `Passing`/`Failing`/`Pending` status of this `Exam`.
   */
  readonly status: ExamStatus;

  /**
   * Makes a comment about the circumstances of the test case.
   */
  comment(message: string): void {
    if (typeof this.spec.onComment === "function") {
      this.spec.onComment(this.report, this, message);
    }
    this.report.onComment(this.spec, this, message);
  }

  /**
   * Provides `proof` for or against the validity of the test case.
   */
  proove(proof: Proof): void {
    if (!proof.isValid()) {
      (this as Mutable<this>).status = "failing";
    } else if (proof.isPending()) {
      (this as Mutable<this>).status = "pending";
    }
    if (typeof this.spec.onProof === "function") {
      this.spec.onProof(this.report, this, proof);
    }
    this.report.onProof(this.spec, this, proof);
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

  identical(lhs: unknown, rhs: unknown, message?: string): void {
    if (lhs === rhs) {
      this.proove(Proof.valid("identical", message));
    } else {
      this.proove(Proof.refuted(lhs, "===", rhs, message));
      throw new TestException(message);
    }
  }

  notIdentical(lhs: unknown, rhs: unknown, message?: string): void {
    if (lhs !== rhs) {
      this.proove(Proof.valid("not identical", message));
    } else {
      this.proove(Proof.refuted(lhs, "!==", rhs, message));
      throw new TestException(message);
    }
  }

  instanceOf(object: unknown, constructor: Function, message?: string): void {
    if (object instanceof constructor) {
      this.proove(Proof.valid("instanceof", message));
    } else {
      this.proove(Proof.refuted(object, "instanceof", constructor, message));
      throw new TestException(message);
    }
  }

  notInstanceOf(object: unknown, constructor: Function, message?: string): void {
    if (!(object instanceof constructor)) {
      this.proove(Proof.valid("not instanceof", message));
    } else {
      this.proove(Proof.refuted(object, "!instanceof", constructor, message));
      throw new TestException(message);
    }
  }

  equal(lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.equal(lhs, rhs)) {
      this.proove(Proof.valid("equal", message));
    } else {
      this.proove(Proof.refuted(lhs, "equal", rhs, message));
      throw new TestException(message);
    }
  }

  notEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (!Values.equal(lhs, rhs)) {
      this.proove(Proof.valid("not equal"));
    } else {
      this.proove(Proof.refuted(lhs, "not equal", rhs, message));
      throw new TestException(message);
    }
  }

  equivalent(lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.equivalent(lhs, rhs)) {
      this.proove(Proof.valid("equivalent", message));
    } else {
      this.proove(Proof.refuted(lhs, "equivalent", rhs, message));
      throw new TestException(message);
    }
  }

  notEquivalent(lhs: unknown, rhs: unknown, message?: string): void {
    if (!Values.equivalent(lhs, rhs)) {
      this.proove(Proof.valid("not equivalent"));
    } else {
      this.proove(Proof.refuted(lhs, "not equivalent", rhs, message));
      throw new TestException(message);
    }
  }

  compareLessThan(lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) < 0) {
      this.proove(Proof.valid("compare less than", message));
    } else {
      this.proove(Proof.refuted(lhs, "<", rhs, message));
      throw new TestException(message);
    }
  }

  compareNotLessThan(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) < 0)) {
      this.proove(Proof.valid("compare not less than", message));
    } else {
      this.proove(Proof.refuted(lhs, "!<", rhs, message));
      throw new TestException(message);
    }
  }

  compareLessThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) <= 0) {
      this.proove(Proof.valid("compare less than or equal", message));
    } else {
      this.proove(Proof.refuted(lhs, "<=", rhs, message));
      throw new TestException(message);
    }
  }

  compareNotLessThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) <= 0)) {
      this.proove(Proof.valid("compare not less than or equal", message));
    } else {
      this.proove(Proof.refuted(lhs, "!<=", rhs, message));
      throw new TestException(message);
    }
  }

  compareEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) === 0) {
      this.proove(Proof.valid("compare equal", message));
    } else {
      this.proove(Proof.refuted(lhs, "==", rhs, message));
      throw new TestException(message);
    }
  }

  compareNotEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) === 0)) {
      this.proove(Proof.valid("compare not equal", message));
    } else {
      this.proove(Proof.refuted(lhs, "!=", rhs, message));
      throw new TestException(message);
    }
  }

  compareGreaterThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) >= 0) {
      this.proove(Proof.valid("compare greater than or equal", message));
    } else {
      this.proove(Proof.refuted(lhs, ">=", rhs, message));
      throw new TestException(message);
    }
  }

  compareNotGreaterThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) >= 0)) {
      this.proove(Proof.valid("compare not greater than or equal", message));
    } else {
      this.proove(Proof.refuted(lhs, "!>=", rhs, message));
      throw new TestException(message);
    }
  }

  compareGreaterThan(lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) > 0) {
      this.proove(Proof.valid("compare greater than", message));
    } else {
      this.proove(Proof.refuted(lhs, ">", rhs, message));
      throw new TestException(message);
    }
  }

  compareNotGreaterThan(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) > 0)) {
      this.proove(Proof.valid("compare not greater than", message));
    } else {
      this.proove(Proof.refuted(lhs, "!>", rhs, message));
      throw new TestException(message);
    }
  }
}
