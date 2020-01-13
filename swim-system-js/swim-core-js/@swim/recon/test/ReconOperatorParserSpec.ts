// Copyright 2015-2020 SWIM.AI inc.
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
import {Slot, Value, Record, Num, Selector} from "@swim/structure";
import {ReconExam} from "./ReconExam";

export class ReconOperatorParserSpec extends Spec {
  createExam(report: Report, name: string, options: TestOptions): ReconExam {
    return new ReconExam(report, this, name, options);
  }

  @Test
  parseConditionalOperator(exam: ReconExam): void {
    exam.parses("$a ? $b : $c", Selector.get("a").conditional(Selector.get("b"), Selector.get("c")));
    exam.parses("$a ? $b : $c ? $d : $e", Selector.get("a").conditional(Selector.get("b"), Selector.get("c").conditional(Selector.get("d"), Selector.get("e"))));
  }

  @Test
  parseLogicalOrOperator(exam: ReconExam): void {
    exam.parses("$a || $b", Selector.get("a").or(Selector.get("b")));
    exam.parses("$a || $b || $c", Selector.get("a").or(Selector.get("b")).or(Selector.get("c")));
  }

  @Test
  parseLogicalAndOperator(exam: ReconExam): void {
    exam.parses("$a && $b", Selector.get("a").and(Selector.get("b")));
    exam.parses("$a && $b && $c", Selector.get("a").and(Selector.get("b")).and(Selector.get("c")));
  }

  @Test
  parseLogicalNotOperator(exam: ReconExam): void {
    exam.parses("!$a", Selector.get("a").not());
  }

  @Test
  parseLogicalOperators(exam: ReconExam): void {
    exam.parses("$a && $b || $c", Selector.get("a").and(Selector.get("b")).or(Selector.get("c")));
    exam.parses("$a || $b && $c", Selector.get("a").or(Selector.get("b").and(Selector.get("c"))));
    exam.parses("$a && $b || $c && $d", Selector.get("a").and(Selector.get("b")).or(Selector.get("c").and(Selector.get("d"))));
  }

  @Test
  parseAssociatedLogicalOperators(exam: ReconExam): void {
    exam.parses("$a && ($b || $c) && $d", Selector.get("a").and(Selector.get("b").or(Selector.get("c"))).and(Selector.get("d")));
    exam.parses("!($a && $b) || $c && $d", Selector.get("a").and(Selector.get("b")).not().or(Selector.get("c").and(Selector.get("d"))));
    exam.parses("$a && $b || !($c && $d)", Selector.get("a").and(Selector.get("b")).or(Selector.get("c").and(Selector.get("d")).not()));
    exam.parses("!($a && $b) || !($c && $d)", Selector.get("a").and(Selector.get("b")).not().or(Selector.get("c").and(Selector.get("d")).not()));
    exam.parses("!($a && $b || $c && $d)", Selector.get("a").and(Selector.get("b")).or(Selector.get("c").and(Selector.get("d"))).not());
    exam.parses("$a && !($b || $c) && $d", Selector.get("a").and(Selector.get("b").or(Selector.get("c")).not()).and(Selector.get("d")));
  }

  @Test
  parseBitwiseOrOperator(exam: ReconExam): void {
    exam.parses("$a | $b", Selector.get("a").bitwiseOr(Selector.get("b")));
    exam.parses("$a | $b | $c", Selector.get("a").bitwiseOr(Selector.get("b")).bitwiseOr(Selector.get("c")));
  }

  @Test
  parseBitwiseXorOperator(exam: ReconExam): void {
    exam.parses("$a ^ $b", Selector.get("a").bitwiseXor(Selector.get("b")));
    exam.parses("$a ^ $b ^ $c", Selector.get("a").bitwiseXor(Selector.get("b")).bitwiseXor(Selector.get("c")));
  }

  @Test
  parseBitwiseAndOperator(exam: ReconExam): void {
    exam.parses("$a & $b", Selector.get("a").bitwiseAnd(Selector.get("b")));
    exam.parses("$a & $b & $c", Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseAnd(Selector.get("c")));
  }

  @Test
  parseBitwiseNotOperator(exam: ReconExam): void {
    exam.parses("~$a", Selector.get("a").bitwiseNot());
  }

  @Test
  parseBitwiseOperators(exam: ReconExam): void {
    exam.parses("$a & $b | $c", Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseOr(Selector.get("c")));
    exam.parses("$a | $b & $c", Selector.get("a").bitwiseOr(Selector.get("b").bitwiseAnd(Selector.get("c"))));
    exam.parses("$a & $b | $c & $d", Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseOr(Selector.get("c").bitwiseAnd(Selector.get("d"))));

    exam.parses("$a & $b ^ $c", Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseXor(Selector.get("c")));
    exam.parses("$a ^ $b & $c", Selector.get("a").bitwiseXor(Selector.get("b").bitwiseAnd(Selector.get("c"))));
    exam.parses("$a & $b ^ $c & $d", Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseXor(Selector.get("c").bitwiseAnd(Selector.get("d"))));

    exam.parses("$a ^ $b | $c", Selector.get("a").bitwiseXor(Selector.get("b")).bitwiseOr(Selector.get("c")));
    exam.parses("$a | $b ^ $c", Selector.get("a").bitwiseOr(Selector.get("b").bitwiseXor(Selector.get("c"))));
    exam.parses("$a ^ $b | $c ^ $d", Selector.get("a").bitwiseXor(Selector.get("b")).bitwiseOr(Selector.get("c").bitwiseXor(Selector.get("d"))));
  }

  @Test
  parseAssociatedBitwiseOperators(exam: ReconExam): void {
    exam.parses("$a & ($b | $c) & $d", Selector.get("a").bitwiseAnd(Selector.get("b").bitwiseOr(Selector.get("c"))).bitwiseAnd(Selector.get("d")));
    exam.parses("~($a & $b) | $c & $d", Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseNot().bitwiseOr(Selector.get("c").bitwiseAnd(Selector.get("d"))));
    exam.parses("$a & $b | ~($c & $d)", Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseOr(Selector.get("c").bitwiseAnd(Selector.get("d")).bitwiseNot()));
    exam.parses("~($a & $b) | ~($c & $d)", Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseNot().bitwiseOr(Selector.get("c").bitwiseAnd(Selector.get("d")).bitwiseNot()));
    exam.parses("~($a & $b | $c & $d)", Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseOr(Selector.get("c").bitwiseAnd(Selector.get("d"))).bitwiseNot());
    exam.parses("$a & ~($b | $c) & $d", Selector.get("a").bitwiseAnd(Selector.get("b").bitwiseOr(Selector.get("c")).bitwiseNot()).bitwiseAnd(Selector.get("d")));

    exam.parses("$a & ($b ^ $c) & $d", Selector.get("a").bitwiseAnd(Selector.get("b").bitwiseXor(Selector.get("c"))).bitwiseAnd(Selector.get("d")));
    exam.parses("~($a & $b) ^ $c & $d", Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseNot().bitwiseXor(Selector.get("c").bitwiseAnd(Selector.get("d"))));
    exam.parses("$a & $b ^ ~($c & $d)", Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseXor(Selector.get("c").bitwiseAnd(Selector.get("d")).bitwiseNot()));
    exam.parses("~($a & $b) ^ ~($c & $d)", Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseNot().bitwiseXor(Selector.get("c").bitwiseAnd(Selector.get("d")).bitwiseNot()));
    exam.parses("~($a & $b ^ $c & $d)", Selector.get("a").bitwiseAnd(Selector.get("b")).bitwiseXor(Selector.get("c").bitwiseAnd(Selector.get("d"))).bitwiseNot());
    exam.parses("$a & ~($b ^ $c) & $d", Selector.get("a").bitwiseAnd(Selector.get("b").bitwiseXor(Selector.get("c")).bitwiseNot()).bitwiseAnd(Selector.get("d")));

    exam.parses("$a ^ ($b | $c) ^ $d", Selector.get("a").bitwiseXor(Selector.get("b").bitwiseOr(Selector.get("c"))).bitwiseXor(Selector.get("d")));
    exam.parses("~($a ^ $b) | $c ^ $d", Selector.get("a").bitwiseXor(Selector.get("b")).bitwiseNot().bitwiseOr(Selector.get("c").bitwiseXor(Selector.get("d"))));
    exam.parses("$a ^ $b | ~($c ^ $d)", Selector.get("a").bitwiseXor(Selector.get("b")).bitwiseOr(Selector.get("c").bitwiseXor(Selector.get("d")).bitwiseNot()));
    exam.parses("~($a ^ $b) | ~($c ^ $d)", Selector.get("a").bitwiseXor(Selector.get("b")).bitwiseNot().bitwiseOr(Selector.get("c").bitwiseXor(Selector.get("d")).bitwiseNot()));
    exam.parses("~($a ^ $b | $c ^ $d)", Selector.get("a").bitwiseXor(Selector.get("b")).bitwiseOr(Selector.get("c").bitwiseXor(Selector.get("d"))).bitwiseNot());
    exam.parses("$a ^ ~($b | $c) ^ $d", Selector.get("a").bitwiseXor(Selector.get("b").bitwiseOr(Selector.get("c")).bitwiseNot()).bitwiseXor(Selector.get("d")));
  }

  @Test
  parseBitwiseLogicalOperators(exam: ReconExam): void {
    exam.parses("$a || $b && $c | $d ^ $e & $f", Selector.get("a").or(Selector.get("b").and(Selector.get("c").bitwiseOr(Selector.get("d").bitwiseXor(Selector.get("e").bitwiseAnd(Selector.get("f")))))));
    exam.parses("$f & $e ^ $d | $c && $b || $a", Selector.get("f").bitwiseAnd(Selector.get("e")).bitwiseXor(Selector.get("d")).bitwiseOr(Selector.get("c")).and(Selector.get("b")).or(Selector.get("a")));
  }

  @Test
  parseLtOperator(exam: ReconExam): void {
    exam.parses("$a < 42", Selector.get("a").lt(Num.from(42)));
    exam.parses("$a < $b", Selector.get("a").lt(Selector.get("b")));
  }

  @Test
  parseLeOperator(exam: ReconExam): void {
    exam.parses("$a <= 42", Selector.get("a").le(Num.from(42)));
    exam.parses("$a <= $b", Selector.get("a").le(Selector.get("b")));
  }

  @Test
  parseEqOperator(exam: ReconExam): void {
    exam.parses("$a == 42", Selector.get("a").eq(Num.from(42)));
    exam.parses("$a == $b", Selector.get("a").eq(Selector.get("b")));
  }

  @Test
  parseNeOperator(exam: ReconExam): void {
    exam.parses("$a != 42", Selector.get("a").ne(Num.from(42)));
    exam.parses("$a != $b", Selector.get("a").ne(Selector.get("b")));
  }

  @Test
  parseGeOperator(exam: ReconExam): void {
    exam.parses("$a >= 42", Selector.get("a").ge(Num.from(42)));
    exam.parses("$a >= $b", Selector.get("a").ge(Selector.get("b")));
  }

  @Test
  parseGtOperator(exam: ReconExam): void {
    exam.parses("$a > 42", Selector.get("a").gt(Num.from(42)));
    exam.parses("$a > $b", Selector.get("a").gt(Selector.get("b")));
  }

  @Test
  parsePlusOperator(exam: ReconExam): void {
    exam.parses("$b + 2", Selector.get("b").plus(Num.from(2)));
    exam.parses("2 + $b", Num.from(2).plus(Selector.get("b")));
    exam.parses("$a + $b", Selector.get("a").plus(Selector.get("b")));
    exam.parses("$a + $b + $c", Selector.get("a").plus(Selector.get("b")).plus(Selector.get("c")));
  }

  @Test
  parseMinusOperator(exam: ReconExam): void {
    exam.parses("$b - 2", Selector.get("b").minus(Num.from(2)));
    exam.parses("2 - $b", Num.from(2).minus(Selector.get("b")));
    exam.parses("$a - $b", Selector.get("a").minus(Selector.get("b")));
    exam.parses("$a - $b - $c", Selector.get("a").minus(Selector.get("b")).minus(Selector.get("c")));
  }

  @Test
  parseNegativeOperator(exam: ReconExam): void {
    exam.parses("-$a", Selector.get("a").negative());
  }

  @Test
  parsePositiveOperator(exam: ReconExam): void {
    exam.parses("+$a", Selector.get("a").positive());
  }

  @Test
  parseTimesOperator(exam: ReconExam): void {
    exam.parses("$b * 2", Selector.get("b").times(Num.from(2)));
    exam.parses("2 * $b", Num.from(2).times(Selector.get("b")));
    exam.parses("$a * $b", Selector.get("a").times(Selector.get("b")));
    exam.parses("$a * $b * $c", Selector.get("a").times(Selector.get("b")).times(Selector.get("c")));
  }

  @Test
  parseDivideOperator(exam: ReconExam): void {
    exam.parses("$b / 2", Selector.get("b").divide(Num.from(2)));
    exam.parses("2 / $b", Num.from(2).divide(Selector.get("b")));
    exam.parses("$a / $b", Selector.get("a").divide(Selector.get("b")));
    exam.parses("$a / $b / $c", Selector.get("a").divide(Selector.get("b")).divide(Selector.get("c")));
  }

  @Test
  parseModuloOperator(exam: ReconExam): void {
    exam.parses("$b % 2", Selector.get("b").modulo(Num.from(2)));
    exam.parses("2 % $b", Num.from(2).modulo(Selector.get("b")));
    exam.parses("$a % $b", Selector.get("a").modulo(Selector.get("b")));
    exam.parses("$a % $b % $c", Selector.get("a").modulo(Selector.get("b")).modulo(Selector.get("c")));
  }

  @Test
  parseArithmeticOperators(exam: ReconExam): void {
    exam.parses("$a * $b + $c", Selector.get("a").times(Selector.get("b")).plus(Selector.get("c")));
    exam.parses("$a + $b * $c", Selector.get("a").plus(Selector.get("b").times(Selector.get("c"))));
    exam.parses("$a * $b + $c * $d", Selector.get("a").times(Selector.get("b")).plus(Selector.get("c").times(Selector.get("d"))));
  }

  @Test
  parseAssociatedArithmeticOperators(exam: ReconExam): void {
    exam.parses("$a * ($b + $c) * $d", Selector.get("a").times(Selector.get("b").plus(Selector.get("c"))).times(Selector.get("d")));
    exam.parses("-($a * $b) + $c * $d", Selector.get("a").times(Selector.get("b")).negative().plus(Selector.get("c").times(Selector.get("d"))));
    exam.parses("$a * $b + -($c * $d)", Selector.get("a").times(Selector.get("b")).plus(Selector.get("c").times(Selector.get("d")).negative()));
    exam.parses("-($a * $b) + -($c * $d)", Selector.get("a").times(Selector.get("b")).negative().plus(Selector.get("c").times(Selector.get("d")).negative()));
    exam.parses("-($a * $b + $c * $d)", Selector.get("a").times(Selector.get("b")).plus(Selector.get("c").times(Selector.get("d"))).negative());
    exam.parses("$a * -($b + $c) * $d", Selector.get("a").times(Selector.get("b").plus(Selector.get("c")).negative()).times(Selector.get("d")));
  }

  @Test
  parseInvokeOperator(exam: ReconExam): void {
    exam.parses("$foo()", Selector.get("foo").invoke(Value.extant()));
    exam.parses("$bar($x)", Selector.get("bar").invoke(Selector.get("x")));
    exam.parses("$baz($x, $y)", Selector.get("baz").invoke(Record.of(Selector.get("x"), Selector.get("y"))));
  }

  @Test
  parseRecordsWithOperators(exam: ReconExam): void {
    exam.parses("{a: $foo + 2, b: 2 + $bar}", Record.of(Slot.of("a", Selector.get("foo").plus(Num.from(2))), Slot.of("b", Num.from(2).plus(Selector.get("bar")))));
  }
}
