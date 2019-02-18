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

package swim.structure;

import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;

public class OperatorSpec {
  @Test
  public void evaluateConditionalOperator() {
    assertEquals(Selector.identity().get("a").conditional(Selector.identity().get("b"), Selector.identity().get("c")).evaluate(Record.of(Slot.of("a", true), Slot.of("b", 2), Slot.of("c", 3))), Num.from(2));
    assertEquals(Selector.identity().get("a").conditional(Selector.identity().get("b"), Selector.identity().get("c")).evaluate(Record.of(Slot.of("b", 2), Slot.of("c", 3))), Num.from(3));
  }

  @Test
  public void evaluateLogicalOrOperator() {
    assertEquals(Selector.identity().get("a").or(Selector.identity().get("b")).evaluate(Record.of(Slot.of("a", 2), Slot.of("b", 3))), Num.from(2));
    assertEquals(Selector.identity().get("a").or(Selector.identity().get("b")).evaluate(Record.of(Slot.of("b", 3))), Num.from(3));
  }

  @Test
  public void evaluateLogicalAndOperator() {
    assertEquals(Selector.identity().get("a").and(Selector.identity().get("b")).evaluate(Record.of(Slot.of("a", 2), Slot.of("b", 3))), Num.from(3));
    assertEquals(Selector.identity().get("a").and(Selector.identity().get("b")).evaluate(Record.of(Slot.of("a", 2))), Value.absent());
  }

  @Test
  public void evaluateNotOperator() {
    assertEquals(Selector.identity().get("a").not().evaluate(Record.of(Slot.of("a", true), Slot.of("b", false))), Bool.from(false));
    assertEquals(Selector.identity().get("a").not().evaluate(Record.of(Slot.of("b", true))), Value.extant());
  }

  @Test
  public void evaluateBitwiseOrOperator() {
    assertEquals(Num.from(3).bitwiseOr(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(3));
    assertEquals(Selector.identity().get("b").bitwiseOr(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(7));
    assertEquals(Num.from(2).bitwiseOr(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(7));
    assertEquals(Selector.identity().get("a").bitwiseOr(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(5));
  }

  @Test
  public void evaluateBitwiseXorOperator() {
    assertEquals(Num.from(3).bitwiseXor(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(1));
    assertEquals(Selector.identity().get("b").bitwiseXor(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(7));
    assertEquals(Num.from(2).bitwiseXor(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(7));
    assertEquals(Selector.identity().get("a").bitwiseXor(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(1));
  }

  @Test
  public void evaluateBitwiseAndOperator() {
    assertEquals(Num.from(3).bitwiseAnd(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(2));
    assertEquals(Selector.identity().get("b").bitwiseAnd(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(0));
    assertEquals(Num.from(2).bitwiseAnd(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(0));
    assertEquals(Selector.identity().get("a").bitwiseAnd(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(4));
  }

  @Test
  public void evaluateBitwiseNotOperator() {
    assertEquals(Selector.identity().get("a").bitwiseNot().evaluate(Record.of(Slot.of("a", 2), Slot.of("b", 3))), Num.from(0xfffffffd));
    assertEquals(Selector.identity().get("a").bitwiseNot().evaluate(Record.of(Slot.of("b", 2))), Value.absent());
  }

  @Test
  public void evaluatePlusOperator() {
    assertEquals(Num.from(3).plus(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(5));
    assertEquals(Selector.identity().get("b").plus(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(7));
    assertEquals(Num.from(2).plus(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(7));
    assertEquals(Selector.identity().get("a").plus(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(9));
  }

  @Test
  public void evaluateMinusOperator() {
    assertEquals(Num.from(3).minus(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(1));
    assertEquals(Selector.identity().get("b").minus(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(3));
    assertEquals(Num.from(2).minus(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(-3));
    assertEquals(Selector.identity().get("a").minus(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(-1));
  }

  @Test
  public void evaluateNegativeOperator() {
    assertEquals(Selector.identity().get("b").negative().evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(-5));
    assertEquals(Selector.identity().get("a").negative().evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(-4));
  }

  @Test
  public void evaluatePositiveOperator() {
    assertEquals(Selector.identity().get("b").positive().evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(5));
    assertEquals(Selector.identity().get("a").positive().evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(4));
  }

  @Test
  public void evaluateTimesOperator() {
    assertEquals(Num.from(3).times(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(6));
    assertEquals(Selector.identity().get("b").times(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(10));
    assertEquals(Num.from(2).times(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(10));
    assertEquals(Selector.identity().get("a").times(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(20));
  }

  @Test
  public void evaluateDivideOperator() {
    assertEquals(Num.from(3).divide(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(1.5));
    assertEquals(Selector.identity().get("b").divide(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(2.5));
    assertEquals(Num.from(2).divide(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(0.4));
    assertEquals(Selector.identity().get("a").divide(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(0.8));
  }

  @Test
  public void evaluateModuloOperator() {
    assertEquals(Num.from(3).modulo(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(1));
    assertEquals(Selector.identity().get("b").modulo(Num.from(2)).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(1));
    assertEquals(Num.from(2).modulo(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(02));
    assertEquals(Selector.identity().get("a").modulo(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(4));
  }

  @Test
  public void evaluateInverseOperator() {
    assertEquals(Selector.identity().get("b").inverse().evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(0.2));
    assertEquals(Selector.identity().get("a").inverse().evaluate(Record.of(Attr.of("a", 4), Slot.of("b", 5))), Num.from(0.25));
  }

  @Test
  public void evaluateInvokeOperator() {
    assertEquals(Selector.identity().get("math").get("round").invoke(Selector.identity().get("b")).evaluate(Record.of(Attr.of("a", 2.1), Slot.of("b", 2.9))), Num.from(3));
    assertEquals(Selector.identity().get("math").get("round").invoke(Selector.identity().get("a")).evaluate(Record.of(Attr.of("a", 2.1), Slot.of("b", 2.9))), Num.from(2));
  }
}
