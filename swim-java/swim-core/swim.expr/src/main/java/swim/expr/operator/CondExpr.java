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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.expr.Evaluator;
import swim.expr.Term;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class CondExpr extends OperatorExpr implements ToSource {

  final Term ifTerm;
  final Term thenTerm;
  final Term elseTerm;

  public CondExpr(Term ifTerm, Term thenTerm, Term elseTerm) {
    this.ifTerm = ifTerm.commit();
    this.thenTerm = thenTerm.commit();
    this.elseTerm = elseTerm.commit();
  }

  public Term ifTerm() {
    return this.ifTerm;
  }

  public Term thenTerm() {
    return this.thenTerm;
  }

  public Term elseTerm() {
    return this.elseTerm;
  }

  @Override
  public int precedence() {
    return 2;
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    final Term condition = this.ifTerm.evaluate(evaluator);
    if (condition.isTruthy()) {
      return this.thenTerm.evaluate(evaluator);
    } else {
      return this.elseTerm.evaluate(evaluator);
    }
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (other instanceof CondExpr) {
      final CondExpr that = (CondExpr) other;
      return this.ifTerm.equals(that.ifTerm)
          && this.thenTerm.equals(that.thenTerm)
          && this.elseTerm.equals(that.elseTerm);
    }
    return false;
  }

  private static final int hashSeed = Murmur3.seed(CondExpr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(CondExpr.hashSeed,
        this.ifTerm.hashCode()), this.thenTerm.hashCode()), this.elseTerm.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("CondExpr", "of")
            .appendArgument(this.ifTerm)
            .appendArgument(this.thenTerm)
            .appendArgument(this.elseTerm)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static CondExpr of(Term ifTerm, Term thenTerm, Term elseTerm) {
    return new CondExpr(ifTerm, thenTerm, elseTerm);
  }

}
