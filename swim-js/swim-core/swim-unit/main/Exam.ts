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

import type {Mutable} from "@swim/util";
import {Values} from "@swim/util";
import type {Assert} from "@swim/util";
import {TestException} from "./TestException";
import {Proof} from "./Proof";
import type {TestOptions} from "./Test";
import type {Suite} from "./Suite";
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
  constructor(report: Report, suite: Suite, name: string, options: TestOptions) {
    this.report = report;
    this.suite = suite;
    this.name = name;
    this.options = options;
    this.status = "passing";
  }

  /**
   * The unit test `Report` to which this `Exam` sends results.
   */
  readonly report: Report;

  /**
   * The `Suite` that created this `Exam`.
   */
  readonly suite: Suite;

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
    this.suite.onComment(this.report, this, message);
    if (this.report.onComment !== void 0) {
      this.report.onComment(this.suite, this, message);
    }
  }

  /**
   * Provides `proof` for or against the validity of the test case.
   */
  prove(proof: Proof): void {
    if (!proof.isValid()) {
      (this as Mutable<this>).status = "failing";
    } else if (proof.isPending()) {
      (this as Mutable<this>).status = "pending";
    }
    this.suite.onProof(this.report, this, proof);
    if (this.report.onProof !== void 0) {
      this.report.onProof(this.suite, this, proof);
    }
  }

  /**
   * Provides tentative proof for the validity of the test case, and throws a
   * `TestException` to cancel evaluation of the test.
   */
  pending(message?: string): void {
    this.prove(Proof.pending(message));
    throw new TestException(message);
  }

  pass(message?: string): void {
    this.prove(Proof.valid("pass", message));
  }

  fail(message?: string): void {
    this.prove(Proof.invalid("fail", message));
    throw new TestException(message);
  }

  throws(fn: () => unknown, expected: Function | RegExp | string = Error, message?: string): void {
    try {
      fn();
      this.prove(Proof.invalid("throws", message));
    } catch (error) {
      if (typeof expected === "function") {
        if (error instanceof expected) {
          this.prove(Proof.valid("throws", message));
        } else {
          this.prove(Proof.invalid("throws", message));
        }
      } else {
        if (typeof expected === "string") {
          expected = new RegExp(expected);
        }
        if (expected instanceof RegExp) {
          if (expected.test(error.toString())) {
            this.prove(Proof.valid("throws", message));
          } else {
            this.prove(Proof.invalid("throws", message));
          }
        } else {
          throw new TypeError("" + expected);
        }
      }
    }
  }

  /** @override */
  ok(condition: unknown, message?: string): void {
    if (condition) {
      this.prove(Proof.valid("ok", message));
    } else {
      this.prove(Proof.invalid("ok", message));
      throw new TestException(message);
    }
  }

  /** @override */
  notOk(condition: unknown, message?: string): void {
    if (!condition) {
      this.prove(Proof.valid("not ok", message));
    } else {
      this.prove(Proof.invalid("not ok", message));
      throw new TestException(message);
    }
  }

  true(condition: unknown, message?: string): void {
    if (condition) {
      this.prove(Proof.valid("true", message));
    } else {
      this.prove(Proof.invalid("true", message));
      throw new TestException(message);
    }
  }

  false(condition: unknown, message?: string): void {
    if (!condition) {
      this.prove(Proof.valid("false", message));
    } else {
      this.prove(Proof.invalid("false", message));
      throw new TestException(message);
    }
  }

  /** @override */
  identical(lhs: unknown, rhs: unknown, message?: string): void {
    if (lhs === rhs) {
      this.prove(Proof.valid("identical", message));
    } else {
      this.prove(Proof.refuted(lhs, "===", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  notIdentical(lhs: unknown, rhs: unknown, message?: string): void {
    if (lhs !== rhs) {
      this.prove(Proof.valid("not identical", message));
    } else {
      this.prove(Proof.refuted(lhs, "!==", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  lessThan(lhs: unknown, rhs: unknown, message?: string): void {
    if ((lhs as any) < (rhs as any)) {
      this.prove(Proof.valid("less than", message));
    } else {
      this.prove(Proof.refuted(lhs, "!<", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  lessThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if ((lhs as any) <= (rhs as any)) {
      this.prove(Proof.valid("less than or equal", message));
    } else {
      this.prove(Proof.refuted(lhs, "!<=", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  greaterThan(lhs: unknown, rhs: unknown, message?: string): void {
    if ((lhs as any) > (rhs as any)) {
      this.prove(Proof.valid("greater than", message));
    } else {
      this.prove(Proof.refuted(lhs, "!>", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  greaterThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if ((lhs as any) >= (rhs as any)) {
      this.prove(Proof.valid("greater than or equal", message));
    } else {
      this.prove(Proof.refuted(lhs, "!>=", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  notLessThan(lhs: unknown, rhs: unknown, message?: string): void {
    if (!((lhs as any) < (rhs as any))) {
      this.prove(Proof.valid("not less than", message));
    } else {
      this.prove(Proof.refuted(lhs, "<", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  notLessThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (!((lhs as any) <= (rhs as any))) {
      this.prove(Proof.valid("not less than or equal", message));
    } else {
      this.prove(Proof.refuted(lhs, "<=", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  notGreaterThan(lhs: unknown, rhs: unknown, message?: string): void {
    if (!((lhs as any) > (rhs as any))) {
      this.prove(Proof.valid("not greater than", message));
    } else {
      this.prove(Proof.refuted(lhs, ">", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  notGreaterThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (!((lhs as any) >= (rhs as any))) {
      this.prove(Proof.valid("not greater than or equal", message));
    } else {
      this.prove(Proof.refuted(lhs, ">=", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  instanceOf(object: unknown, constructor: Function, message?: string): void {
    if (object instanceof constructor) {
      this.prove(Proof.valid("instanceof", message));
    } else {
      this.prove(Proof.refuted(object, "instanceof", constructor, message));
      throw new TestException(message);
    }
  }

  /** @override */
  notInstanceOf(object: unknown, constructor: Function, message?: string): void {
    if (!(object instanceof constructor)) {
      this.prove(Proof.valid("not instanceof", message));
    } else {
      this.prove(Proof.refuted(object, "!instanceof", constructor, message));
      throw new TestException(message);
    }
  }

  /** @override */
  equal(lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.equal(lhs, rhs)) {
      this.prove(Proof.valid("equal", message));
    } else {
      this.prove(Proof.refuted(lhs, "equal", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  notEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (!Values.equal(lhs, rhs)) {
      this.prove(Proof.valid("not equal"));
    } else {
      this.prove(Proof.refuted(lhs, "not equal", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  equivalent(lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.equivalent(lhs, rhs)) {
      this.prove(Proof.valid("equivalent", message));
    } else {
      this.prove(Proof.refuted(lhs, "equivalent", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  notEquivalent(lhs: unknown, rhs: unknown, message?: string): void {
    if (!Values.equivalent(lhs, rhs)) {
      this.prove(Proof.valid("not equivalent"));
    } else {
      this.prove(Proof.refuted(lhs, "not equivalent", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  compareLessThan(lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) < 0) {
      this.prove(Proof.valid("compare less than", message));
    } else {
      this.prove(Proof.refuted(lhs, "<", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  compareNotLessThan(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) < 0)) {
      this.prove(Proof.valid("compare not less than", message));
    } else {
      this.prove(Proof.refuted(lhs, "!<", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  compareLessThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) <= 0) {
      this.prove(Proof.valid("compare less than or equal", message));
    } else {
      this.prove(Proof.refuted(lhs, "<=", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  compareNotLessThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) <= 0)) {
      this.prove(Proof.valid("compare not less than or equal", message));
    } else {
      this.prove(Proof.refuted(lhs, "!<=", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  compareEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) === 0) {
      this.prove(Proof.valid("compare equal", message));
    } else {
      this.prove(Proof.refuted(lhs, "==", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  compareNotEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) === 0)) {
      this.prove(Proof.valid("compare not equal", message));
    } else {
      this.prove(Proof.refuted(lhs, "!=", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  compareGreaterThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) >= 0) {
      this.prove(Proof.valid("compare greater than or equal", message));
    } else {
      this.prove(Proof.refuted(lhs, ">=", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  compareNotGreaterThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) >= 0)) {
      this.prove(Proof.valid("compare not greater than or equal", message));
    } else {
      this.prove(Proof.refuted(lhs, "!>=", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  compareGreaterThan(lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) > 0) {
      this.prove(Proof.valid("compare greater than", message));
    } else {
      this.prove(Proof.refuted(lhs, ">", rhs, message));
      throw new TestException(message);
    }
  }

  /** @override */
  compareNotGreaterThan(lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) > 0)) {
      this.prove(Proof.valid("compare not greater than", message));
    } else {
      this.prove(Proof.refuted(lhs, "!>", rhs, message));
      throw new TestException(message);
    }
  }
}
