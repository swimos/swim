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

import {TestOptions, Test, Spec, Report} from "@swim/unit";
import {Slot, Record, Num, Value, Selector} from "@swim/structure";
import {ReconExam} from "../ReconExam";

export class ReconOperatorWriterSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): ReconExam {
    return new ReconExam(report, this, name, options);
  }

  @Test
  writeConditionalOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").conditional(Selector.get("b"), Selector.get("c")), "$a ? $b : $c");
    exam.writes(Selector.get("a").conditional(Selector.get("b"), Selector.get("c").conditional(Selector.get("d"), Selector.get("e"))), "$a ? $b : $c ? $d : $e");
  }

  @Test
  writeLogicalOrOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").or(Selector.get("b")), "$a || $b");
    exam.writes(Selector.get("a").or(Selector.get("b")).or(Selector.get("c")), "$a || $b || $c");
  }

  @Test
  writeLogicalAndOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").and(Selector.get("b")), "$a && $b");
    exam.writes(Selector.get("a").and(Selector.get("b")).and(Selector.get("c")), "$a && $b && $c");
  }

  @Test
  writeLogicalNotOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").not(), "!$a");
  }

  @Test
  writeLogicalOperators(exam: ReconExam): void {
    exam.writes(Selector.get("a").and(Selector.get("b")).or(Selector.get("c")), "$a && $b || $c");
    exam.writes(Selector.get("a").or(Selector.get("b").and(Selector.get("c"))), "$a || $b && $c");
    exam.writes(Selector.get("a").and(Selector.get("b")).or(Selector.get("c").and(Selector.get("d"))), "$a && $b || $c && $d");
  }

  @Test
  writeAssociatedLogicalOperators(exam: ReconExam): void {
    exam.writes(Selector.get("a").and(Selector.get("b").or(Selector.get("c"))).and(Selector.get("d")), "$a && ($b || $c) && $d");
    exam.writes(Selector.get("a").and(Selector.get("b")).not().or(Selector.get("c").and(Selector.get("d"))), "!($a && $b) || $c && $d");
    exam.writes(Selector.get("a").and(Selector.get("b")).or(Selector.get("c").and(Selector.get("d")).not()), "$a && $b || !($c && $d)");
    exam.writes(Selector.get("a").and(Selector.get("b")).not().or(Selector.get("c").and(Selector.get("d")).not()), "!($a && $b) || !($c && $d)");
    exam.writes(Selector.get("a").and(Selector.get("b")).or(Selector.get("c").and(Selector.get("d"))).not(), "!($a && $b || $c && $d)");
    exam.writes(Selector.get("a").and(Selector.get("b").or(Selector.get("c")).not()).and(Selector.get("d")), "$a && !($b || $c) && $d");
  }

  @Test
  writeBitwiseOrOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").bitwiseOr(Selector.get("b")), "$a | $b");
    exam.writes(Selector.get("a").bitwiseOr(Selector.get("b")).bitwiseOr(Selector.get("c")), "$a | $b | $c");
  }

  @Test
  writeBitwiseXorOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").bitwiseXor(Selector.get("b")), "$a ^ $b");
    exam.writes(Selector.get("a").bitwiseXor(Selector.get("b")).bitwiseXor(Selector.get("c")), "$a ^ $b ^ $c");
  }

  @Test
  writeBitwiseAndOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b")), "$a & $b");
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseAnd(Selector.get("c")), "$a & $b & $c");
  }

  @Test
  writeBitwiseNotOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").bitwiseNot(), "~$a");
  }

  @Test
  writeBitwiseOperators(exam: ReconExam): void {
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseOr(Selector.get("c")), "$a & $b | $c");
    exam.writes(Selector.get("a").bitwiseOr(Selector.get("b").bitwiseAnd(Selector.get("c"))), "$a | $b & $c");
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseOr(Selector.get("c").bitwiseAnd(Selector.get("d"))), "$a & $b | $c & $d");

    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseXor(Selector.get("c")), "$a & $b ^ $c");
    exam.writes(Selector.get("a").bitwiseXor(Selector.get("b").bitwiseAnd(Selector.get("c"))), "$a ^ $b & $c");
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseXor(Selector.get("c").bitwiseAnd(Selector.get("d"))), "$a & $b ^ $c & $d");

    exam.writes(Selector.get("a").bitwiseXor(Selector.get("b")).bitwiseOr(Selector.get("c")), "$a ^ $b | $c");
    exam.writes(Selector.get("a").bitwiseOr(Selector.get("b").bitwiseXor(Selector.get("c"))), "$a | $b ^ $c");
    exam.writes(Selector.get("a").bitwiseXor(Selector.get("b")).bitwiseOr(Selector.get("c").bitwiseXor(Selector.get("d"))), "$a ^ $b | $c ^ $d");
  }

  @Test
  writeAssociatedBitwiseOperators(exam: ReconExam): void {
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b").bitwiseOr(Selector.get("c"))).bitwiseAnd(Selector.get("d")), "$a & ($b | $c) & $d");
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseNot().bitwiseOr(Selector.get("c").bitwiseAnd(Selector.get("d"))), "~($a & $b) | $c & $d");
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseOr(Selector.get("c").bitwiseAnd(Selector.get("d")).bitwiseNot()), "$a & $b | ~($c & $d)");
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseNot().bitwiseOr(Selector.get("c").bitwiseAnd(Selector.get("d")).bitwiseNot()), "~($a & $b) | ~($c & $d)");
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseOr(Selector.get("c").bitwiseAnd(Selector.get("d"))).bitwiseNot(), "~($a & $b | $c & $d)");
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b").bitwiseOr(Selector.get("c")).bitwiseNot()).bitwiseAnd(Selector.get("d")), "$a & ~($b | $c) & $d");

    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b").bitwiseXor(Selector.get("c"))).bitwiseAnd(Selector.get("d")), "$a & ($b ^ $c) & $d");
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseNot().bitwiseXor(Selector.get("c").bitwiseAnd(Selector.get("d"))), "~($a & $b) ^ $c & $d");
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseXor(Selector.get("c").bitwiseAnd(Selector.get("d")).bitwiseNot()), "$a & $b ^ ~($c & $d)");
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseNot().bitwiseXor(Selector.get("c").bitwiseAnd(Selector.get("d")).bitwiseNot()), "~($a & $b) ^ ~($c & $d)");
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseXor(Selector.get("c").bitwiseAnd(Selector.get("d"))).bitwiseNot(), "~($a & $b ^ $c & $d)");
    exam.writes(Selector.get("a").bitwiseAnd(Selector.get("b").bitwiseXor(Selector.get("c")).bitwiseNot()).bitwiseAnd(Selector.get("d")), "$a & ~($b ^ $c) & $d");

    exam.writes(Selector.get("a").bitwiseXor(Selector.get("b").bitwiseOr(Selector.get("c"))).bitwiseXor(Selector.get("d")), "$a ^ ($b | $c) ^ $d");
    exam.writes(Selector.get("a").bitwiseXor(Selector.get("b")).bitwiseNot().bitwiseOr(Selector.get("c").bitwiseXor(Selector.get("d"))), "~($a ^ $b) | $c ^ $d");
    exam.writes(Selector.get("a").bitwiseXor(Selector.get("b")).bitwiseOr(Selector.get("c").bitwiseXor(Selector.get("d")).bitwiseNot()), "$a ^ $b | ~($c ^ $d)");
    exam.writes(Selector.get("a").bitwiseXor(Selector.get("b")).bitwiseNot().bitwiseOr(Selector.get("c").bitwiseXor(Selector.get("d")).bitwiseNot()), "~($a ^ $b) | ~($c ^ $d)");
    exam.writes(Selector.get("a").bitwiseXor(Selector.get("b")).bitwiseOr(Selector.get("c").bitwiseXor(Selector.get("d"))).bitwiseNot(), "~($a ^ $b | $c ^ $d)");
    exam.writes(Selector.get("a").bitwiseXor(Selector.get("b").bitwiseOr(Selector.get("c")).bitwiseNot()).bitwiseXor(Selector.get("d")), "$a ^ ~($b | $c) ^ $d");
  }

  @Test
  writeBitwiseLogicalOperators(exam: ReconExam): void {
    exam.writes(Selector.get("a").or(Selector.get("b").and(Selector.get("c").bitwiseOr(Selector.get("d").bitwiseXor(Selector.get("e").bitwiseAnd(Selector.get("f")))))), "$a || $b && $c | $d ^ $e & $f");
    exam.writes(Selector.get("f").bitwiseAnd(Selector.get("e")).bitwiseXor(Selector.get("d")).bitwiseOr(Selector.get("c")).and(Selector.get("b")).or(Selector.get("a")), "$f & $e ^ $d | $c && $b || $a");
  }

  @Test
  writeLtOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").lt(Num.from(42)), "$a < 42");
    exam.writes(Selector.get("a").lt(Selector.get("b")), "$a < $b");
  }

  @Test
  writeLeOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").le(Num.from(42)), "$a <= 42");
    exam.writes(Selector.get("a").le(Selector.get("b")), "$a <= $b");
  }

  @Test
  writeEqOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").eq(Num.from(42)), "$a == 42");
    exam.writes(Selector.get("a").eq(Selector.get("b")), "$a == $b");
  }

  @Test
  writeNeOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").ne(Num.from(42)), "$a != 42");
    exam.writes(Selector.get("a").ne(Selector.get("b")), "$a != $b");
  }

  @Test
  writeGeOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").ge(Num.from(42)), "$a >= 42");
    exam.writes(Selector.get("a").ge(Selector.get("b")), "$a >= $b");
  }

  @Test
  writeGtOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").gt(Num.from(42)), "$a > 42");
    exam.writes(Selector.get("a").gt(Selector.get("b")), "$a > $b");
  }

  @Test
  writePlusOperator(exam: ReconExam): void {
    exam.writes(Selector.get("b").plus(Num.from(2)), "$b + 2");
    exam.writes(Num.from(2).plus(Selector.get("b")), "2 + $b");
    exam.writes(Selector.get("a").plus(Selector.get("b")), "$a + $b");
    exam.writes(Selector.get("a").plus(Selector.get("b")).plus(Selector.get("c")), "$a + $b + $c");
  }

  @Test
  writeMinusOperator(exam: ReconExam): void {
    exam.writes(Selector.get("b").minus(Num.from(2)), "$b - 2");
    exam.writes(Num.from(2).minus(Selector.get("b")), "2 - $b");
    exam.writes(Selector.get("a").minus(Selector.get("b")), "$a - $b");
    exam.writes(Selector.get("a").minus(Selector.get("b")).minus(Selector.get("c")), "$a - $b - $c");
  }

  @Test
  writeNegativeOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").negative(), "-$a");
  }

  @Test
  writePositiveOperator(exam: ReconExam): void {
    exam.writes(Selector.get("a").positive(), "+$a");
  }

  @Test
  writeTimesOperator(exam: ReconExam): void {
    exam.writes(Selector.get("b").times(Num.from(2)), "$b * 2");
    exam.writes(Num.from(2).times(Selector.get("b")), "2 * $b");
    exam.writes(Selector.get("a").times(Selector.get("b")), "$a * $b");
    exam.writes(Selector.get("a").times(Selector.get("b")).times(Selector.get("c")), "$a * $b * $c");
  }

  @Test
  writeDivideOperator(exam: ReconExam): void {
    exam.writes(Selector.get("b").divide(Num.from(2)), "$b / 2");
    exam.writes(Num.from(2).divide(Selector.get("b")), "2 / $b");
    exam.writes(Selector.get("a").divide(Selector.get("b")), "$a / $b");
    exam.writes(Selector.get("a").divide(Selector.get("b")).divide(Selector.get("c")), "$a / $b / $c");
  }

  @Test
  writeModuloOperator(exam: ReconExam): void {
    exam.writes(Selector.get("b").modulo(Num.from(2)), "$b % 2");
    exam.writes(Num.from(2).modulo(Selector.get("b")), "2 % $b");
    exam.writes(Selector.get("a").modulo(Selector.get("b")), "$a % $b");
    exam.writes(Selector.get("a").modulo(Selector.get("b")).modulo(Selector.get("c")), "$a % $b % $c");
  }

  @Test
  writeArithmeticOperators(exam: ReconExam): void {
    exam.writes(Selector.get("a").times(Selector.get("b")).plus(Selector.get("c")), "$a * $b + $c");
    exam.writes(Selector.get("a").plus(Selector.get("b").times(Selector.get("c"))), "$a + $b * $c");
    exam.writes(Selector.get("a").times(Selector.get("b")).plus(Selector.get("c").times(Selector.get("d"))), "$a * $b + $c * $d");
  }

  @Test
  writeAssociatedArithmeticOperators(exam: ReconExam): void {
    exam.writes(Selector.get("a").times(Selector.get("b").plus(Selector.get("c"))).times(Selector.get("d")), "$a * ($b + $c) * $d");
    exam.writes(Selector.get("a").times(Selector.get("b")).negative().plus(Selector.get("c").times(Selector.get("d"))), "-($a * $b) + $c * $d");
    exam.writes(Selector.get("a").times(Selector.get("b")).plus(Selector.get("c").times(Selector.get("d")).negative()), "$a * $b + -($c * $d)");
    exam.writes(Selector.get("a").times(Selector.get("b")).negative().plus(Selector.get("c").times(Selector.get("d")).negative()), "-($a * $b) + -($c * $d)");
    exam.writes(Selector.get("a").times(Selector.get("b")).plus(Selector.get("c").times(Selector.get("d"))).negative(), "-($a * $b + $c * $d)");
    exam.writes(Selector.get("a").times(Selector.get("b").plus(Selector.get("c")).negative()).times(Selector.get("d")), "$a * -($b + $c) * $d");
  }

  @Test
  writeInvokeOperator(exam: ReconExam): void {
    exam.writes(Selector.get("foo").invoke(Value.extant()), "$foo()");
    exam.writes(Selector.get("bar").invoke(Selector.get("x")), "$bar($x)");
    exam.writes(Selector.get("baz").invoke(Record.of(Selector.get("x"), Selector.get("y"))), "$baz($x,$y)");
  }

  @Test
  writeRecordsWithOperators(exam: ReconExam): void {
    exam.writes(Record.of(Slot.of("a", Selector.get("foo").plus(Num.from(2))), Slot.of("b", Num.from(2).plus(Selector.get("bar")))), "{a:$foo + 2,b:2 + $bar}");
  }
}
