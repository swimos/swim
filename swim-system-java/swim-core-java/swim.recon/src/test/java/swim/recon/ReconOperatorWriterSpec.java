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
import static swim.recon.ReconWriterSpec.assertWrites;

public class ReconOperatorWriterSpec {
  @Test
  public void writeConditionalOperator() {
    assertWrites(Selector.identity().get("a").conditional(Selector.identity().get("b"), Selector.identity().get("c")), "$a ? $b : $c");
    assertWrites(Selector.identity().get("a").conditional(Selector.identity().get("b"), Selector.identity().get("c").conditional(Selector.identity().get("d"), Selector.identity().get("e"))), "$a ? $b : $c ? $d : $e");
  }

  @Test
  public void writeLogicalOrOperator() {
    assertWrites(Selector.identity().get("a").or(Selector.identity().get("b")), "$a || $b");
    assertWrites(Selector.identity().get("a").or(Selector.identity().get("b")).or(Selector.identity().get("c")), "$a || $b || $c");
  }

  @Test
  public void writeLogicalAndOperator() {
    assertWrites(Selector.identity().get("a").and(Selector.identity().get("b")), "$a && $b");
    assertWrites(Selector.identity().get("a").and(Selector.identity().get("b")).and(Selector.identity().get("c")), "$a && $b && $c");
  }

  @Test
  public void writeLogicalNotOperator() {
    assertWrites(Selector.identity().get("a").not(), "!$a");
  }

  @Test
  public void writeLogicalOperators() {
    assertWrites(Selector.identity().get("a").and(Selector.identity().get("b")).or(Selector.identity().get("c")), "$a && $b || $c");
    assertWrites(Selector.identity().get("a").or(Selector.identity().get("b").and(Selector.identity().get("c"))), "$a || $b && $c");
    assertWrites(Selector.identity().get("a").and(Selector.identity().get("b")).or(Selector.identity().get("c").and(Selector.identity().get("d"))), "$a && $b || $c && $d");
  }

  @Test
  public void writeAssociatedLogicalOperators() {
    assertWrites(Selector.identity().get("a").and(Selector.identity().get("b").or(Selector.identity().get("c"))).and(Selector.identity().get("d")), "$a && ($b || $c) && $d");
    assertWrites(Selector.identity().get("a").and(Selector.identity().get("b")).not().or(Selector.identity().get("c").and(Selector.identity().get("d"))), "!($a && $b) || $c && $d");
    assertWrites(Selector.identity().get("a").and(Selector.identity().get("b")).or(Selector.identity().get("c").and(Selector.identity().get("d")).not()), "$a && $b || !($c && $d)");
    assertWrites(Selector.identity().get("a").and(Selector.identity().get("b")).not().or(Selector.identity().get("c").and(Selector.identity().get("d")).not()), "!($a && $b) || !($c && $d)");
    assertWrites(Selector.identity().get("a").and(Selector.identity().get("b")).or(Selector.identity().get("c").and(Selector.identity().get("d"))).not(), "!($a && $b || $c && $d)");
    assertWrites(Selector.identity().get("a").and(Selector.identity().get("b").or(Selector.identity().get("c")).not()).and(Selector.identity().get("d")), "$a && !($b || $c) && $d");
  }

  @Test
  public void writeBitwiseOrOperator() {
    assertWrites(Selector.identity().get("a").bitwiseOr(Selector.identity().get("b")), "$a | $b");
    assertWrites(Selector.identity().get("a").bitwiseOr(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c")), "$a | $b | $c");
  }

  @Test
  public void writeBitwiseXorOperator() {
    assertWrites(Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")), "$a ^ $b");
    assertWrites(Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).bitwiseXor(Selector.identity().get("c")), "$a ^ $b ^ $c");
  }

  @Test
  public void writeBitwiseAndOperator() {
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")), "$a & $b");
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseAnd(Selector.identity().get("c")), "$a & $b & $c");
  }

  @Test
  public void writeBitwiseNotOperator() {
    assertWrites(Selector.identity().get("a").bitwiseNot(), "~$a");
  }

  @Test
  public void writeBitwiseOperators() {
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c")), "$a & $b | $c");
    assertWrites(Selector.identity().get("a").bitwiseOr(Selector.identity().get("b").bitwiseAnd(Selector.identity().get("c"))), "$a | $b & $c");
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d"))), "$a & $b | $c & $d");

    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseXor(Selector.identity().get("c")), "$a & $b ^ $c");
    assertWrites(Selector.identity().get("a").bitwiseXor(Selector.identity().get("b").bitwiseAnd(Selector.identity().get("c"))), "$a ^ $b & $c");
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseXor(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d"))), "$a & $b ^ $c & $d");

    assertWrites(Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c")), "$a ^ $b | $c");
    assertWrites(Selector.identity().get("a").bitwiseOr(Selector.identity().get("b").bitwiseXor(Selector.identity().get("c"))), "$a | $b ^ $c");
    assertWrites(Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c").bitwiseXor(Selector.identity().get("d"))), "$a ^ $b | $c ^ $d");
  }

  @Test
  public void writeAssociatedBitwiseOperators() {
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b").bitwiseOr(Selector.identity().get("c"))).bitwiseAnd(Selector.identity().get("d")), "$a & ($b | $c) & $d");
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseNot().bitwiseOr(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d"))), "~($a & $b) | $c & $d");
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d")).bitwiseNot()), "$a & $b | ~($c & $d)");
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseNot().bitwiseOr(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d")).bitwiseNot()), "~($a & $b) | ~($c & $d)");
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d"))).bitwiseNot(), "~($a & $b | $c & $d)");
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b").bitwiseOr(Selector.identity().get("c")).bitwiseNot()).bitwiseAnd(Selector.identity().get("d")), "$a & ~($b | $c) & $d");

    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b").bitwiseXor(Selector.identity().get("c"))).bitwiseAnd(Selector.identity().get("d")), "$a & ($b ^ $c) & $d");
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseNot().bitwiseXor(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d"))), "~($a & $b) ^ $c & $d");
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseXor(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d")).bitwiseNot()), "$a & $b ^ ~($c & $d)");
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseNot().bitwiseXor(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d")).bitwiseNot()), "~($a & $b) ^ ~($c & $d)");
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).bitwiseXor(Selector.identity().get("c").bitwiseAnd(Selector.identity().get("d"))).bitwiseNot(), "~($a & $b ^ $c & $d)");
    assertWrites(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b").bitwiseXor(Selector.identity().get("c")).bitwiseNot()).bitwiseAnd(Selector.identity().get("d")), "$a & ~($b ^ $c) & $d");

    assertWrites(Selector.identity().get("a").bitwiseXor(Selector.identity().get("b").bitwiseOr(Selector.identity().get("c"))).bitwiseXor(Selector.identity().get("d")), "$a ^ ($b | $c) ^ $d");
    assertWrites(Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).bitwiseNot().bitwiseOr(Selector.identity().get("c").bitwiseXor(Selector.identity().get("d"))), "~($a ^ $b) | $c ^ $d");
    assertWrites(Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c").bitwiseXor(Selector.identity().get("d")).bitwiseNot()), "$a ^ $b | ~($c ^ $d)");
    assertWrites(Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).bitwiseNot().bitwiseOr(Selector.identity().get("c").bitwiseXor(Selector.identity().get("d")).bitwiseNot()), "~($a ^ $b) | ~($c ^ $d)");
    assertWrites(Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).bitwiseOr(Selector.identity().get("c").bitwiseXor(Selector.identity().get("d"))).bitwiseNot(), "~($a ^ $b | $c ^ $d)");
    assertWrites(Selector.identity().get("a").bitwiseXor(Selector.identity().get("b").bitwiseOr(Selector.identity().get("c")).bitwiseNot()).bitwiseXor(Selector.identity().get("d")), "$a ^ ~($b | $c) ^ $d");
  }

  @Test
  public void writeBitwiseLogicalOperators() {
    assertWrites(Selector.identity().get("a").or(Selector.identity().get("b").and(Selector.identity().get("c").bitwiseOr(Selector.identity().get("d").bitwiseXor(Selector.identity().get("e").bitwiseAnd(Selector.identity().get("f")))))), "$a || $b && $c | $d ^ $e & $f");
    assertWrites(Selector.identity().get("f").bitwiseAnd(Selector.identity().get("e")).bitwiseXor(Selector.identity().get("d")).bitwiseOr(Selector.identity().get("c")).and(Selector.identity().get("b")).or(Selector.identity().get("a")), "$f & $e ^ $d | $c && $b || $a");
  }

  @Test
  public void writeLtOperator() {
    assertWrites(Selector.identity().get("a").lt(Num.from(42)), "$a < 42");
    assertWrites(Selector.identity().get("a").lt(Selector.identity().get("b")), "$a < $b");
  }

  @Test
  public void writeLeOperator() {
    assertWrites(Selector.identity().get("a").le(Num.from(42)), "$a <= 42");
    assertWrites(Selector.identity().get("a").le(Selector.identity().get("b")), "$a <= $b");
  }

  @Test
  public void writeEqOperator() {
    assertWrites(Selector.identity().get("a").eq(Num.from(42)), "$a == 42");
    assertWrites(Selector.identity().get("a").eq(Selector.identity().get("b")), "$a == $b");
  }

  @Test
  public void writeNeOperator() {
    assertWrites(Selector.identity().get("a").ne(Num.from(42)), "$a != 42");
    assertWrites(Selector.identity().get("a").ne(Selector.identity().get("b")), "$a != $b");
  }

  @Test
  public void writeGeOperator() {
    assertWrites(Selector.identity().get("a").ge(Num.from(42)), "$a >= 42");
    assertWrites(Selector.identity().get("a").ge(Selector.identity().get("b")), "$a >= $b");
  }

  @Test
  public void writeGtOperator() {
    assertWrites(Selector.identity().get("a").gt(Num.from(42)), "$a > 42");
    assertWrites(Selector.identity().get("a").gt(Selector.identity().get("b")), "$a > $b");
  }

  @Test
  public void writePlusOperator() {
    assertWrites(Selector.identity().get("b").plus(Num.from(2)), "$b + 2");
    assertWrites(Num.from(2).plus(Selector.identity().get("b")), "2 + $b");
    assertWrites(Selector.identity().get("a").plus(Selector.identity().get("b")), "$a + $b");
    assertWrites(Selector.identity().get("a").plus(Selector.identity().get("b")).plus(Selector.identity().get("c")), "$a + $b + $c");
  }

  @Test
  public void writeMinusOperator() {
    assertWrites(Selector.identity().get("b").minus(Num.from(2)), "$b - 2");
    assertWrites(Num.from(2).minus(Selector.identity().get("b")), "2 - $b");
    assertWrites(Selector.identity().get("a").minus(Selector.identity().get("b")), "$a - $b");
    assertWrites(Selector.identity().get("a").minus(Selector.identity().get("b")).minus(Selector.identity().get("c")), "$a - $b - $c");
  }

  @Test
  public void writeNegativeOperator() {
    assertWrites(Selector.identity().get("a").negative(), "-$a");
  }

  @Test
  public void writePositiveOperator() {
    assertWrites(Selector.identity().get("a").positive(), "+$a");
  }

  @Test
  public void writeTimesOperator() {
    assertWrites(Selector.identity().get("b").times(Num.from(2)), "$b * 2");
    assertWrites(Num.from(2).times(Selector.identity().get("b")), "2 * $b");
    assertWrites(Selector.identity().get("a").times(Selector.identity().get("b")), "$a * $b");
    assertWrites(Selector.identity().get("a").times(Selector.identity().get("b")).times(Selector.identity().get("c")), "$a * $b * $c");
  }

  @Test
  public void writeDivideOperator() {
    assertWrites(Selector.identity().get("b").divide(Num.from(2)), "$b / 2");
    assertWrites(Num.from(2).divide(Selector.identity().get("b")), "2 / $b");
    assertWrites(Selector.identity().get("a").divide(Selector.identity().get("b")), "$a / $b");
    assertWrites(Selector.identity().get("a").divide(Selector.identity().get("b")).divide(Selector.identity().get("c")), "$a / $b / $c");
  }

  @Test
  public void writeModuloOperator() {
    assertWrites(Selector.identity().get("b").modulo(Num.from(2)), "$b % 2");
    assertWrites(Num.from(2).modulo(Selector.identity().get("b")), "2 % $b");
    assertWrites(Selector.identity().get("a").modulo(Selector.identity().get("b")), "$a % $b");
    assertWrites(Selector.identity().get("a").modulo(Selector.identity().get("b")).modulo(Selector.identity().get("c")), "$a % $b % $c");
  }

  @Test
  public void writeArithmeticOperators() {
    assertWrites(Selector.identity().get("a").times(Selector.identity().get("b")).plus(Selector.identity().get("c")), "$a * $b + $c");
    assertWrites(Selector.identity().get("a").plus(Selector.identity().get("b").times(Selector.identity().get("c"))), "$a + $b * $c");
    assertWrites(Selector.identity().get("a").times(Selector.identity().get("b")).plus(Selector.identity().get("c").times(Selector.identity().get("d"))), "$a * $b + $c * $d");
  }

  @Test
  public void writeAssociatedArithmeticOperators() {
    assertWrites(Selector.identity().get("a").times(Selector.identity().get("b").plus(Selector.identity().get("c"))).times(Selector.identity().get("d")), "$a * ($b + $c) * $d");
    assertWrites(Selector.identity().get("a").times(Selector.identity().get("b")).negative().plus(Selector.identity().get("c").times(Selector.identity().get("d"))), "-($a * $b) + $c * $d");
    assertWrites(Selector.identity().get("a").times(Selector.identity().get("b")).plus(Selector.identity().get("c").times(Selector.identity().get("d")).negative()), "$a * $b + -($c * $d)");
    assertWrites(Selector.identity().get("a").times(Selector.identity().get("b")).negative().plus(Selector.identity().get("c").times(Selector.identity().get("d")).negative()), "-($a * $b) + -($c * $d)");
    assertWrites(Selector.identity().get("a").times(Selector.identity().get("b")).plus(Selector.identity().get("c").times(Selector.identity().get("d"))).negative(), "-($a * $b + $c * $d)");
    assertWrites(Selector.identity().get("a").times(Selector.identity().get("b").plus(Selector.identity().get("c")).negative()).times(Selector.identity().get("d")), "$a * -($b + $c) * $d");
  }

  @Test
  public void writeInvokeOperator() {
    assertWrites(Selector.identity().get("foo").invoke(Value.extant()), "$foo()");
    assertWrites(Selector.identity().get("bar").invoke(Selector.identity().get("x")), "$bar($x)");
    assertWrites(Selector.identity().get("baz").invoke(Record.of(Selector.identity().get("x"), Selector.identity().get("y"))), "$baz($x,$y)");
  }

  @Test
  public void writeRecordsWithOperators() {
    assertWrites(Record.of(Slot.of("a", Selector.identity().get("foo").plus(Num.from(2))), Slot.of("b", Num.from(2).plus(Selector.identity().get("bar")))), "{a:$foo + 2,b:2 + $bar}");
  }
}
