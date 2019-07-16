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

package swim.recon;

import org.testng.annotations.Test;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Selector;
import swim.structure.Slot;
import swim.structure.Value;
import static swim.recon.ReconParserSpec.assertParses;

public class ReconOperatorParserSpec {
  @Test
  public void parseConditionalOperator() {
    assertParses("$a ? $b : $c", Selector.identity().get("a").conditional(Selector.identity().get("b"), Selector.identity().get("c")));
    assertParses("$a ? $b : $c ? $d : $e", Selector.identity().get("a").conditional(Selector.identity().get("b"), Selector.identity().get("c").conditional(Selector.identity().get("d"), Selector.identity().get("e"))));
  }

  @Test
  public void parseLogicalOrOperator() {
    assertParses("$a || $b", Selector.identity().get("a").or(Selector.identity().get("b")));
    assertParses("$a || $b || $c", Selector.identity().get("a").or(Selector.identity().get("b")).or(Selector.identity().get("c")));
  }

  @Test
  public void parseLogicalAndOperator() {
    assertParses("$a && $b", Selector.identity().get("a").and(Selector.identity().get("b")));
    assertParses("$a && $b && $c", Selector.identity().get("a").and(Selector.identity().get("b")).and(Selector.identity().get("c")));
  }

  @Test
  public void parseLogicalNotOperator() {
    assertParses("!$a", Selector.identity().get("a").not());
  }

  @Test
  public void parseLogicalOperators() {
    assertParses("$a && $b || $c", Selector.identity().get("a").and(Selector.identity().get("b")).or(Selector.identity().get("c")));
    assertParses("$a || $b && $c", Selector.identity().get("a").or(Selector.identity().get("b").and(Selector.identity().get("c"))));
    assertParses("$a && $b || $c && $d", Selector.identity().get("a").and(Selector.identity().get("b")).or(Selector.identity().get("c").and(Selector.identity().get("d"))));
  }

  @Test
  public void parseAssociatedLogicalOperators() {
    assertParses("$a && ($b || $c) && $d", Selector.identity().get("a").and(Selector.identity().get("b").or(Selector.identity().get("c"))).and(Selector.identity().get("d")));
    assertParses("!($a && $b) || $c && $d", Selector.identity().get("a").and(Selector.identity().get("b")).not().or(Selector.identity().get("c").and(Selector.identity().get("d"))));
    assertParses("$a && $b || !($c && $d)", Selector.identity().get("a").and(Selector.identity().get("b")).or(Selector.identity().get("c").and(Selector.identity().get("d")).not()));
    assertParses("!($a && $b) || !($c && $d)", Selector.identity().get("a").and(Selector.identity().get("b")).not().or(Selector.identity().get("c").and(Selector.identity().get("d")).not()));
    assertParses("!($a && $b || $c && $d)", Selector.identity().get("a").and(Selector.identity().get("b")).or(Selector.identity().get("c").and(Selector.identity().get("d"))).not());
    assertParses("$a && !($b || $c) && $d", Selector.identity().get("a").and(Selector.identity().get("b").or(Selector.identity().get("c")).not()).and(Selector.identity().get("d")));
  }

  @Test
  public void parseBitwiseOrOperator() {
    assertParses("$a | $b", Selector.identity().get("a").bitwiseOr(Selector.identity().get("b")));
    assertParses("$a | $b | $c", Selector.identity().get("a").bitwiseOr(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c")));
  }

  @Test
  public void parseBitwiseXorOperator() {
    assertParses("$a ^ $b", Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")));
    assertParses("$a ^ $b ^ $c", Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).bitwiseXor(Selector.identity().get("c")));
  }

  @Test
  public void parseBitwiseAndOperator() {
    assertParses("$a & $b", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")));
    assertParses("$a & $b & $c", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseAnd(Selector.identity().get("c")));
  }

  @Test
  public void parseBitwiseNotOperator() {
    assertParses("~$a", Selector.identity().get("a").bitwiseNot());
  }

  @Test
  public void parseBitwiseOperators() {
    assertParses("$a & $b | $c", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c")));
    assertParses("$a | $b & $c", Selector.identity().get("a").bitwiseOr(Selector.identity().get("b").bitwiseAnd(Selector.identity().get("c"))));
    assertParses("$a & $b | $c & $d", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d"))));

    assertParses("$a & $b ^ $c", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseXor(Selector.identity().get("c")));
    assertParses("$a ^ $b & $c", Selector.identity().get("a").bitwiseXor(Selector.identity().get("b").bitwiseAnd(Selector.identity().get("c"))));
    assertParses("$a & $b ^ $c & $d", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseXor(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d"))));

    assertParses("$a ^ $b | $c", Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c")));
    assertParses("$a | $b ^ $c", Selector.identity().get("a").bitwiseOr(Selector.identity().get("b").bitwiseXor(Selector.identity().get("c"))));
    assertParses("$a ^ $b | $c ^ $d", Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c").bitwiseXor(Selector.identity().get("d"))));
  }

  @Test
  public void parseAssociatedBitwiseOperators() {
    assertParses("$a & ($b | $c) & $d", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b").bitwiseOr(Selector.identity().get("c"))).bitwiseAnd(Selector.identity().get("d")));
    assertParses("~($a & $b) | $c & $d", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseNot().bitwiseOr(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d"))));
    assertParses("$a & $b | ~($c & $d)", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d")).bitwiseNot()));
    assertParses("~($a & $b) | ~($c & $d)", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseNot().bitwiseOr(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d")).bitwiseNot()));
    assertParses("~($a & $b | $c & $d)", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d"))).bitwiseNot());
    assertParses("$a & ~($b | $c) & $d", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b").bitwiseOr(Selector.identity().get("c")).bitwiseNot()).bitwiseAnd(Selector.identity().get("d")));

    assertParses("$a & ($b ^ $c) & $d", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b").bitwiseXor(Selector.identity().get("c"))).bitwiseAnd(Selector.identity().get("d")));
    assertParses("~($a & $b) ^ $c & $d", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseNot().bitwiseXor(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d"))));
    assertParses("$a & $b ^ ~($c & $d)", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseXor(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d")).bitwiseNot()));
    assertParses("~($a & $b) ^ ~($c & $d)", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseNot().bitwiseXor(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d")).bitwiseNot()));
    assertParses("~($a & $b ^ $c & $d)", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseXor(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d"))).bitwiseNot());
    assertParses("$a & ~($b ^ $c) & $d", Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b").bitwiseXor(Selector.identity().get("c")).bitwiseNot()).bitwiseAnd(Selector.identity().get("d")));

    assertParses("$a ^ ($b | $c) ^ $d", Selector.identity().get("a").bitwiseXor(Selector.identity().get("b").bitwiseOr(Selector.identity().get("c"))).bitwiseXor(Selector.identity().get("d")));
    assertParses("~($a ^ $b) | $c ^ $d", Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).bitwiseNot().bitwiseOr(Selector.identity().get("c").bitwiseXor(Selector.identity().get("d"))));
    assertParses("$a ^ $b | ~($c ^ $d)", Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c").bitwiseXor(Selector.identity().get("d")).bitwiseNot()));
    assertParses("~($a ^ $b) | ~($c ^ $d)", Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).bitwiseNot().bitwiseOr(Selector.identity().get("c").bitwiseXor(Selector.identity().get("d")).bitwiseNot()));
    assertParses("~($a ^ $b | $c ^ $d)", Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c").bitwiseXor(Selector.identity().get("d"))).bitwiseNot());
    assertParses("$a ^ ~($b | $c) ^ $d", Selector.identity().get("a").bitwiseXor(Selector.identity().get("b").bitwiseOr(Selector.identity().get("c")).bitwiseNot()).bitwiseXor(Selector.identity().get("d")));
  }

  @Test
  public void parseBitwiseLogicalOperators() {
    assertParses("$a || $b && $c | $d ^ $e & $f", Selector.identity().get("a").or(Selector.identity().get("b").and(Selector.identity().get("c").bitwiseOr(Selector.identity().get("d").bitwiseXor(Selector.identity().get("e").bitwiseAnd(Selector.identity().get("f")))))));
    assertParses("$f & $e ^ $d | $c && $b || $a", Selector.identity().get("f").bitwiseAnd(Selector.identity().get("e")).bitwiseXor(Selector.identity().get("d")).bitwiseOr(Selector.identity().get("c")).and(Selector.identity().get("b")).or(Selector.identity().get("a")));
  }

  @Test
  public void parseLtOperator() {
    assertParses("$a < 42", Selector.identity().get("a").lt(Num.from(42)));
    assertParses("$a < $b", Selector.identity().get("a").lt(Selector.identity().get("b")));
  }

  @Test
  public void parseLeOperator() {
    assertParses("$a <= 42", Selector.identity().get("a").le(Num.from(42)));
    assertParses("$a <= $b", Selector.identity().get("a").le(Selector.identity().get("b")));
  }

  @Test
  public void parseEqOperator() {
    assertParses("$a == 42", Selector.identity().get("a").eq(Num.from(42)));
    assertParses("$a == $b", Selector.identity().get("a").eq(Selector.identity().get("b")));
  }

  @Test
  public void parseNeOperator() {
    assertParses("$a != 42", Selector.identity().get("a").ne(Num.from(42)));
    assertParses("$a != $b", Selector.identity().get("a").ne(Selector.identity().get("b")));
  }

  @Test
  public void parseGeOperator() {
    assertParses("$a >= 42", Selector.identity().get("a").ge(Num.from(42)));
    assertParses("$a >= $b", Selector.identity().get("a").ge(Selector.identity().get("b")));
  }

  @Test
  public void parseGtOperator() {
    assertParses("$a > 42", Selector.identity().get("a").gt(Num.from(42)));
    assertParses("$a > $b", Selector.identity().get("a").gt(Selector.identity().get("b")));
  }

  @Test
  public void parsePlusOperator() {
    assertParses("$b + 2", Selector.identity().get("b").plus(Num.from(2)));
    assertParses("2 + $b", Num.from(2).plus(Selector.identity().get("b")));
    assertParses("$a + $b", Selector.identity().get("a").plus(Selector.identity().get("b")));
    assertParses("$a + $b + $c", Selector.identity().get("a").plus(Selector.identity().get("b")).plus(Selector.identity().get("c")));
  }

  @Test
  public void parseMinusOperator() {
    assertParses("$b - 2", Selector.identity().get("b").minus(Num.from(2)));
    assertParses("2 - $b", Num.from(2).minus(Selector.identity().get("b")));
    assertParses("$a - $b", Selector.identity().get("a").minus(Selector.identity().get("b")));
    assertParses("$a - $b - $c", Selector.identity().get("a").minus(Selector.identity().get("b")).minus(Selector.identity().get("c")));
  }

  @Test
  public void parseNegativeOperator() {
    assertParses("-$a", Selector.identity().get("a").negative());
  }

  @Test
  public void parsePositiveOperator() {
    assertParses("+$a", Selector.identity().get("a").positive());
  }

  @Test
  public void parseTimesOperator() {
    assertParses("$b * 2", Selector.identity().get("b").times(Num.from(2)));
    assertParses("2 * $b", Num.from(2).times(Selector.identity().get("b")));
    assertParses("$a * $b", Selector.identity().get("a").times(Selector.identity().get("b")));
    assertParses("$a * $b * $c", Selector.identity().get("a").times(Selector.identity().get("b")).times(Selector.identity().get("c")));
  }

  @Test
  public void parseDivideOperator() {
    assertParses("$b / 2", Selector.identity().get("b").divide(Num.from(2)));
    assertParses("2 / $b", Num.from(2).divide(Selector.identity().get("b")));
    assertParses("$a / $b", Selector.identity().get("a").divide(Selector.identity().get("b")));
    assertParses("$a / $b / $c", Selector.identity().get("a").divide(Selector.identity().get("b")).divide(Selector.identity().get("c")));
  }

  @Test
  public void parseModuloOperator() {
    assertParses("$b % 2", Selector.identity().get("b").modulo(Num.from(2)));
    assertParses("2 % $b", Num.from(2).modulo(Selector.identity().get("b")));
    assertParses("$a % $b", Selector.identity().get("a").modulo(Selector.identity().get("b")));
    assertParses("$a % $b % $c", Selector.identity().get("a").modulo(Selector.identity().get("b")).modulo(Selector.identity().get("c")));
  }

  @Test
  public void parseArithmeticOperators() {
    assertParses("$a * $b + $c", Selector.identity().get("a").times(Selector.identity().get("b")).plus(Selector.identity().get("c")));
    assertParses("$a + $b * $c", Selector.identity().get("a").plus(Selector.identity().get("b").times(Selector.identity().get("c"))));
    assertParses("$a * $b + $c * $d", Selector.identity().get("a").times(Selector.identity().get("b")).plus(Selector.identity().get("c").times(Selector.identity().get("d"))));
  }

  @Test
  public void parseAssociatedArithmeticOperators() {
    assertParses("$a * ($b + $c) * $d", Selector.identity().get("a").times(Selector.identity().get("b").plus(Selector.identity().get("c"))).times(Selector.identity().get("d")));
    assertParses("-($a * $b) + $c * $d", Selector.identity().get("a").times(Selector.identity().get("b")).negative().plus(Selector.identity().get("c").times(Selector.identity().get("d"))));
    assertParses("$a * $b + -($c * $d)", Selector.identity().get("a").times(Selector.identity().get("b")).plus(Selector.identity().get("c").times(Selector.identity().get("d")).negative()));
    assertParses("-($a * $b) + -($c * $d)", Selector.identity().get("a").times(Selector.identity().get("b")).negative().plus(Selector.identity().get("c").times(Selector.identity().get("d")).negative()));
    assertParses("-($a * $b + $c * $d)", Selector.identity().get("a").times(Selector.identity().get("b")).plus(Selector.identity().get("c").times(Selector.identity().get("d"))).negative());
    assertParses("$a * -($b + $c) * $d", Selector.identity().get("a").times(Selector.identity().get("b").plus(Selector.identity().get("c")).negative()).times(Selector.identity().get("d")));
  }

  @Test
  public void parseInvokeOperator() {
    assertParses("$foo()", Selector.identity().get("foo").invoke(Value.extant()));
    assertParses("$bar($x)", Selector.identity().get("bar").invoke(Selector.identity().get("x")));
    assertParses("$baz($x, $y)", Selector.identity().get("baz").invoke(Record.of(Selector.identity().get("x"), Selector.identity().get("y"))));
  }

  @Test
  public void parseRecordsWithOperators() {
    assertParses("{a: $foo + 2, b: 2 + $bar}", Record.of(Slot.of("a", Selector.identity().get("foo").plus(Num.from(2))), Slot.of("b", Num.from(2).plus(Selector.identity().get("bar")))));
  }
}
