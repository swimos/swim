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

package swim.expr.term;

import org.junit.jupiter.api.Test;
import swim.expr.Evaluator;
import swim.expr.Expr;
import swim.expr.Term;
import swim.expr.operator.PlusExpr;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class IntTermTests {

  @Test
  public void evaluateIntOperators() {
    final Expr expr = PlusExpr.of(Term.of(2), Term.of(3));
    final Term result = expr.evaluate(new Evaluator());
    assertEquals(5, result.intValue());
  }

}
