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

package swim.expr.selector;

import swim.annotations.Public;
import swim.annotations.Since;
import swim.expr.Expr;
import swim.expr.Term;

@Public
@Since("5.0")
public abstract class SelectorExpr implements Expr {

  SelectorExpr() {
    // nop
  }

  @Override
  public int precedence() {
    return 11;
  }

  public SelectorExpr member(String key) {
    return new MemberExpr(this, key);
  }

  public SelectorExpr child(Term key) {
    return new ChildExpr(this, key);
  }

  public SelectorExpr children() {
    return new ChildrenExpr(this);
  }

  public SelectorExpr descendants() {
    return new DescendantsExpr(this);
  }

}
