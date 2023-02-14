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

package swim.expr;

import java.util.Iterator;
import org.junit.jupiter.api.Test;
import swim.annotations.Nullable;
import swim.expr.selector.ChildExpr;
import swim.expr.selector.InvokeExpr;
import swim.expr.selector.MemberExpr;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class ReflectedTermTests {

  static final class Point {

    final int x;
    final int y;

    public Point(int x, int y) {
      this.x = x;
      this.y = y;
    }

    Point() {
      this.x = 0;
      this.y = 0;
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (other instanceof Point) {
        final Point that = (Point) other;
        return this.x == that.x && this.y == that.y;
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.seed(Point.class), this.x), this.y));
    }

    @Override
    public String toString() {
      return new Notation().beginInvokeNew("Point")
                           .appendArgument(this.x)
                           .appendArgument(this.y)
                           .endInvoke()
                           .toString();
    }

  }

  @Test
  public void evaluateChildSelectors() {
    final TermForm<Point> termForm = TermForm.forType(Point.class);
    final Term point = termForm.intoTerm(new Point(2, 3));
    final Expr expr = ChildExpr.of(point, Term.of("x"));
    final TermGenerator generator = expr.generator();
    final Evaluator evaluator = new Evaluator();
    assertEquals(2, Assume.nonNull(generator.evaluateNext(evaluator)).intValue());
    assertNull(generator.evaluateNext(evaluator));
  }

  @Test
  public void evaluateChildMethods() {
    final TermForm<Point> termForm = TermForm.forType(Point.class);
    final Term point = termForm.intoTerm(new Point(2, 3));
    final Expr expr = InvokeExpr.of(MemberExpr.of(point, "child"), Term.of("x"));
    final TermGenerator generator = expr.generator();
    final Evaluator evaluator = new Evaluator();
    assertEquals(2, Assume.nonNull(generator.evaluateNext(evaluator)).intValue());
    assertNull(generator.evaluateNext(evaluator));
  }

  @Test
  public void filterChildren() {
    final TermForm<Point> termForm = TermForm.forType(Point.class);
    final Term point = termForm.intoTerm(new Point(2, 3));
    final Term expr = Expr.parse("%::filter(x == 1 + 1 && y == 6 / 2)");
    final TermGenerator generator = expr.generator();
    final Evaluator evaluator = new Evaluator(Term.trap(), point);
    assertEquals(point, generator.evaluateNext(evaluator));
    assertNull(generator.evaluateNext(evaluator));
  }

}
