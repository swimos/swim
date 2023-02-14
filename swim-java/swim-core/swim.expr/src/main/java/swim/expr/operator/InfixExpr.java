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

package swim.expr.operator;

import swim.annotations.Public;
import swim.annotations.Since;
import swim.expr.Term;

@Public
@Since("5.0")
public abstract class InfixExpr extends OperatorExpr {

  final Term lhs;
  final Term rhs;

  InfixExpr(Term lhs, Term rhs) {
    this.lhs = lhs.commit();
    this.rhs = rhs.commit();
  }

  public final Term lhs() {
    return this.lhs;
  }

  public abstract String operator();

  public final Term rhs() {
    return this.rhs;
  }

}
