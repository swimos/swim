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
import swim.annotations.Public;
import swim.annotations.Since;
import swim.expr.selector.ChildExpr;
import swim.expr.selector.ChildrenExpr;
import swim.expr.selector.DescendantsExpr;
import swim.expr.selector.MemberExpr;
import swim.expr.selector.SelectorExpr;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class GlobalExpr implements Expr, ToSource {

  private GlobalExpr() {
    // singleton
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    return evaluator.globalTerm();
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("GlobalExpr", "of").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final GlobalExpr INSTANCE = new GlobalExpr();

  public static GlobalExpr of() {
    return INSTANCE;
  }

  public static SelectorExpr member(String key) {
    return new MemberExpr(GlobalExpr.of(), key);
  }

  public static SelectorExpr child(Term key) {
    return new ChildExpr(GlobalExpr.of(), key);
  }

  public static SelectorExpr children() {
    return new ChildrenExpr(GlobalExpr.of());
  }

  public static SelectorExpr descendants() {
    return new DescendantsExpr(GlobalExpr.of());
  }

}
