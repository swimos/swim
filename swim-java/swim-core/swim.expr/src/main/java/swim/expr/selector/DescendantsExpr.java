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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.expr.ContextExpr;
import swim.expr.GlobalExpr;
import swim.expr.Evaluator;
import swim.expr.Term;
import swim.expr.TermGenerator;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class DescendantsExpr extends SelectorExpr implements ToSource {

  final Term scope;

  public DescendantsExpr(Term scope) {
    this.scope = scope.commit();
  }

  public Term scope() {
    return this.scope;
  }

  @Override
  public boolean isGenerator() {
    return true;
  }

  @Override
  public TermGenerator generator() {
    return new DescendantsExprGenerator(this.scope.generator());
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    return this.generator().intoTerm(evaluator);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (other instanceof DescendantsExpr) {
      final DescendantsExpr that = (DescendantsExpr) other;
      return this.scope.equals(that.scope);
    }
    return false;
  }

  private static final int hashSeed = Murmur3.seed(DescendantsExpr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(DescendantsExpr.hashSeed, this.scope.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.scope instanceof ContextExpr) {
      notation.beginInvoke("ContextExpr", "descendants");
    } else if (this.scope instanceof GlobalExpr) {
      notation.beginInvoke("GlobalExpr", "descendants");
    } else if (this.scope instanceof SelectorExpr) {
      notation.appendSource(this.scope)
              .beginInvoke("descendants");
    } else {
      notation.beginInvoke("DescendantsExpr", "of")
              .appendArgument(this.scope);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static DescendantsExpr of(Term scope) {
    return new DescendantsExpr(scope);
  }

}

final class DescendantsExprGenerator implements TermGenerator {

  final TermGenerator scope;
  @Nullable TermGenerator descendants;

  DescendantsExprGenerator(TermGenerator scope) {
    this.scope = scope;
    this.descendants = null;
  }

  @Override
  public @Nullable Term evaluateNext(Evaluator evaluator) {
    do {
      if (this.descendants == null) {
        final Term term = this.scope.evaluateNext(evaluator);
        if (term == null) {
          return null;
        }
        this.descendants = term.getDescendants();
      } else {
        final Term descendant = this.descendants.evaluateNext(evaluator);
        if (descendant != null) {
          return descendant.evaluate(evaluator);
        }
        this.descendants = null;
      }
    } while (true);
  }

}
