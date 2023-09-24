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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.term.Evaluator;
import swim.term.Term;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class GeExpr extends ComparisonExpr implements WriteSource {

  public GeExpr(Term lhs, Term rhs) {
    super(lhs, rhs);
  }

  @Override
  public String operator() {
    return ">=";
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    final Term lhs = this.lhs.evaluate(evaluator);
    final Term rhs = this.rhs.evaluate(evaluator);
    return lhs.ge(rhs);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof GeExpr that) {
      return this.lhs.equals(that.lhs) && this.rhs.equals(that.rhs);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(GeExpr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.lhs.hashCode()), this.rhs.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("GeExpr", "of")
            .appendArgument(this.lhs)
            .appendArgument(this.rhs)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static GeExpr of(Term lhs, Term rhs) {
    return new GeExpr(lhs, rhs);
  }

}
