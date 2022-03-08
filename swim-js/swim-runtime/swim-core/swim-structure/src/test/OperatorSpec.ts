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

import {Spec, Test, Exam} from "@swim/unit";
import {Attr, Slot, Value, Record, Num, Bool, Selector} from "@swim/structure";

export class OperatorSpec extends Spec {
  @Test
  evaluateConditionalOperator(exam: Exam): void {
    exam.equal(Selector.get("a").conditional(Selector.get("b"), Selector.get("c")).evaluate(Record.of(Slot.of("a", true), Slot.of("b", 2), Slot.of("c", 3))), Num.from(2));
    exam.equal(Selector.get("a").conditional(Selector.get("b"), Selector.get("c")).evaluate(Record.of(Slot.of("b", 2), Slot.of("c", 3))), Num.from(3));
  }

  @Test
  evaluateLogicalOrOperator(exam: Exam): void {
    exam.equal(Selector.get("a").or(Selector.get("b")).evaluate(Record.of(Slot.of("a", 2), Slot.of("b", 3))), Num.from(2));
    exam.equal(Selector.get("a").or(Selector.get("b")).evaluate(Record.of(Slot.of("b", 3))), Num.from(3));
  }

  @Test
  evaluateLogicalAndOperator(exam: Exam): void {
    exam.equal(Selector.get("a").and(Selector.get("b")).evaluate(Record.of(Slot.of("a", 2), Slot.of("b", 3))), Num.from(3));
    exam.equal(Selector.get("a").and(Selector.get("b")).evaluate(Record.of(Slot.of("a", 2))), Value.absent());
  }

  @Test
  evaluateNotOperator(exam: Exam): void {
    exam.equal(Selector.get("a").not().evaluate(Record.of(Slot.of("a", true), Slot.of("b", false))), Bool.from(false));
    exam.equal(Selector.get("a").not().evaluate(Record.of(Slot.of("b", true))), Value.extant());
  }

  @Test
  evaluateBitwiseOrOperator(exam: Exam): void {
    exam.equal(Num.from(3).bitwiseOr(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(3));
    exam.equal(Selector.get("b").bitwiseOr(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(7));
    exam.equal(Num.from(2).bitwiseOr(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(7));
    exam.equal(Selector.get("a").bitwiseOr(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(5));
  }

  @Test
  evaluateBitwiseXorOperator(exam: Exam): void {
    exam.equal(Num.from(3).bitwiseXor(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(1));
    exam.equal(Selector.get("b").bitwiseXor(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(7));
    exam.equal(Num.from(2).bitwiseXor(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(7));
    exam.equal(Selector.get("a").bitwiseXor(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(1));
  }

  @Test
  evaluateBitwiseAndOperator(exam: Exam): void {
    exam.equal(Num.from(3).bitwiseAnd(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(2));
    exam.equal(Selector.get("b").bitwiseAnd(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(0));
    exam.equal(Num.from(2).bitwiseAnd(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(0));
    exam.equal(Selector.get("a").bitwiseAnd(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(4));
  }

  @Test
  evaluateBitwiseNotOperator(exam: Exam): void {
    exam.equal(Selector.get("a").bitwiseNot().evaluate(Record.of(Slot.of("a", 2), Slot.of("b", 3))), Num.from(0xfffffffd));
    exam.equal(Selector.get("a").bitwiseNot().evaluate(Record.of(Slot.of("b", 2))), Value.absent());
  }

  @Test
  evaluatePlusOperator(exam: Exam): void {
    exam.equal(Num.from(3).plus(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(5));
    exam.equal(Selector.get("b").plus(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(7));
    exam.equal(Num.from(2).plus(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(7));
    exam.equal(Selector.get("a").plus(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(9));
  }

  @Test
  evaluateMinusOperator(exam: Exam): void {
    exam.equal(Num.from(3).minus(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(1));
    exam.equal(Selector.get("b").minus(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(3));
    exam.equal(Num.from(2).minus(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(-3));
    exam.equal(Selector.get("a").minus(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(-1));
  }

  @Test
  evaluateNegativeOperator(exam: Exam): void {
    exam.equal(Selector.get("b").negative().evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(-5));
    exam.equal(Selector.get("a").negative().evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(-4));
  }

  @Test
  evaluatePositiveOperator(exam: Exam): void {
    exam.equal(Selector.get("b").positive().evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(5));
    exam.equal(Selector.get("a").positive().evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(4));
  }

  @Test
  evaluateTimesOperator(exam: Exam): void {
    exam.equal(Num.from(3).times(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(6));
    exam.equal(Selector.get("b").times(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(10));
    exam.equal(Num.from(2).times(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(10));
    exam.equal(Selector.get("a").times(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(20));
  }

  @Test
  evaluateDivideOperator(exam: Exam): void {
    exam.equal(Num.from(3).divide(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(1.5));
    exam.equal(Selector.get("b").divide(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(2.5));
    exam.equal(Num.from(2).divide(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(0.4));
    exam.equal(Selector.get("a").divide(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(0.8));
  }

  @Test
  evaluateModuloOperator(exam: Exam): void {
    exam.equal(Num.from(3).modulo(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(1));
    exam.equal(Selector.get("b").modulo(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(1));
    exam.equal(Num.from(2).modulo(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(2));
    exam.equal(Selector.get("a").modulo(Selector.get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(4));
  }

  @Test
  evaluateInverseOperator(exam: Exam): void {
    exam.equal(Selector.get("b").inverse().evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(0.2));
    exam.equal(Selector.get("a").inverse().evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(0.25));
  }

  @Test
  evaluateInvokeOperator(exam: Exam): void {
    exam.equal(Selector.get("math").get("round").invoke(Selector.get("b")).evaluate(Record.of(Attr.of("a", 2.1), Slot.of("b", 2.9))), Num.from(3));
    exam.equal(Selector.get("math").get("round").invoke(Selector.get("a")).evaluate(Record.of(Attr.of("a", 2.1), Slot.of("b", 2.9))), Num.from(2));
  }
}
