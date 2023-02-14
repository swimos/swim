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

import java.util.Arrays;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.expr.Evaluator;
import swim.expr.Term;
import swim.expr.TermGenerator;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class InvokeExpr extends SelectorExpr implements ToSource {

  final Term scope;
  final Term[] args;

  public InvokeExpr(Term scope, Term[] args) {
    this.scope = scope.commit();
    this.args = args;
    for (int i = 0; i < args.length; i += 1) {
      args[i].commit();
    }
  }

  public Term scope() {
    return this.scope;
  }

  public Term[] args() {
    return this.args;
  }

  @Override
  public int precedence() {
    return 11;
  }

  @Override
  public boolean isGenerator() {
    return true;
  }

  @Override
  public TermGenerator generator() {
    return new InvokeExprGenerator(this.scope.generator(), this.args);
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    return this.generator().intoTerm(evaluator);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (other instanceof InvokeExpr) {
      final InvokeExpr that = (InvokeExpr) other;
      return this.scope.equals(that.scope)
          && Arrays.equals(this.args, that.args);
    }
    return false;
  }

  private static final int hashSeed = Murmur3.seed(InvokeExpr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(InvokeExpr.hashSeed,
        this.scope.hashCode()), Arrays.hashCode(this.args)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("InvokeExpr", "of")
            .appendArgument(this.scope);
    for (int i = 0; i <  this.args.length; i += 1) {
      notation.appendArgument(this.args[i]);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final Term[] EMPTY_ARGS = new Term[0];

  public static InvokeExpr of(Term scope) {
    return new InvokeExpr(scope, EMPTY_ARGS);
  }

  public static InvokeExpr of(Term scope, Term... args) {
    return new InvokeExpr(scope, args);
  }

}

final class InvokeExprGenerator implements TermGenerator {

  final TermGenerator scope;
  final Term[] args;
  @Nullable TermGenerator results;

  InvokeExprGenerator(TermGenerator scope, Term[] args) {
    this.scope = scope;
    this.args = args;
    this.results = null;
  }

  @Override
  public @Nullable Term evaluateNext(Evaluator evaluator) {
    do {
      if (this.results == null) {
        final Term term = this.scope.evaluateNext(evaluator);
        if (term == null) {
          return null;
        }
        this.results = term.invoke(evaluator, this.args).generator();
      } else {
        final Term result = this.results.evaluateNext(evaluator);
        if (result != null) {
          return result;
        }
        this.results = null;
      }
    } while (true);
  }

}
