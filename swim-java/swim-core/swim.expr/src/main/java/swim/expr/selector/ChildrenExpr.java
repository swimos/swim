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
import swim.expr.Evaluator;
import swim.expr.GlobalExpr;
import swim.expr.Term;
import swim.expr.TermGenerator;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class ChildrenExpr extends SelectorExpr implements ToSource {

  final Term scope;

  public ChildrenExpr(Term scope) {
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
    return new ChildrenExprGenerator(this.scope.generator());
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    return this.generator().intoTerm(evaluator);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (other instanceof ChildrenExpr) {
      final ChildrenExpr that = (ChildrenExpr) other;
      return this.scope.equals(that.scope);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(ChildrenExpr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, this.scope.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.scope instanceof ContextExpr) {
      notation.beginInvoke("ContextExpr", "children");
    } else if (this.scope instanceof GlobalExpr) {
      notation.beginInvoke("GlobalExpr", "children");
    } else if (this.scope instanceof SelectorExpr) {
      notation.appendSource(this.scope)
              .beginInvoke("children");
    } else {
      notation.beginInvoke("ChildrenExpr", "of")
              .appendArgument(this.scope);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static ChildrenExpr of(Term scope) {
    return new ChildrenExpr(scope);
  }

}

final class ChildrenExprGenerator implements TermGenerator {

  final TermGenerator scope;
  @Nullable TermGenerator children;

  ChildrenExprGenerator(TermGenerator scope) {
    this.scope = scope;
    this.children = null;
  }

  @Override
  public @Nullable Term evaluateNext(Evaluator evaluator) {
    do {
      if (this.children == null) {
        final Term term = this.scope.evaluateNext(evaluator);
        if (term == null) {
          return null;
        }
        this.children = term.getChildren();
      } else {
        final Term child = this.children.evaluateNext(evaluator);
        if (child != null) {
          return child.evaluate(evaluator);
        }
        this.children = null;
      }
    } while (true);
  }

}
