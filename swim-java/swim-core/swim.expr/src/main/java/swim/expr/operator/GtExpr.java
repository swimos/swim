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
public final class GtExpr extends InfixExpr implements ToSource {

  public GtExpr(Term lhs, Term rhs) {
    super(lhs, rhs);
  }

  @Override
  public String operator() {
    return ">";
  }

  @Override
  public int precedence() {
    return 0;
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    final Term lhs = this.lhs.evaluate(evaluator);
    final Term rhs = this.rhs.evaluate(evaluator);
    return lhs.gt(rhs);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (other instanceof GtExpr) {
      final GtExpr that = (GtExpr) other;
      return this.lhs.equals(that.lhs) && this.rhs.equals(that.rhs);
    }
    return false;
  }

  private static final int hashSeed = Murmur3.seed(GtExpr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(GtExpr.hashSeed,
        this.lhs.hashCode()), this.rhs.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("GtExpr", "of")
            .appendArgument(this.lhs)
            .appendArgument(this.rhs)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static GtExpr of(Term lhs, Term rhs) {
    return new GtExpr(lhs, rhs);
  }

}
