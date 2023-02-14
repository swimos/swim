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
public final class MemberExpr extends SelectorExpr implements ToSource {

  final Term scope;
  final String key;

  public MemberExpr(Term scope, String key) {
    this.scope = scope.commit();
    this.key = key;
  }

  public Term scope() {
    return this.scope;
  }

  public String key() {
    return this.key;
  }

  @Override
  public boolean isGenerator() {
    return true;
  }

  @Override
  public TermGenerator generator() {
    return new MemberExprGenerator(this.scope.generator(), this.key);
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    return this.generator().intoTerm(evaluator);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (other instanceof MemberExpr) {
      final MemberExpr that = (MemberExpr) other;
      return this.scope.equals(that.scope)
          && this.key.equals(that.key);
    }
    return false;
  }

  private static final int hashSeed = Murmur3.seed(MemberExpr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(MemberExpr.hashSeed,
        this.scope.hashCode()), this.key.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.scope instanceof ContextExpr) {
      notation.beginInvoke("ContextExpr", "member");
    } else if (this.scope instanceof GlobalExpr) {
      notation.beginInvoke("GlobalExpr", "member");
    } else if (this.scope instanceof SelectorExpr) {
      notation.appendSource(this.scope)
              .beginInvoke("member");
    } else {
      notation.beginInvoke("MemberExpr", "of")
              .appendArgument(this.scope);
    }
    notation.appendArgument(this.key);
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static MemberExpr of(Term scope, String key) {
    return new MemberExpr(scope, key);
  }

}

final class MemberExprGenerator implements TermGenerator {

  final TermGenerator scope;
  final String key;

  MemberExprGenerator(TermGenerator scope, String key) {
    this.scope = scope;
    this.key = key;
  }

  @Override
  public @Nullable Term evaluateNext(Evaluator evaluator) {
    do {
      final Term term = this.scope.evaluateNext(evaluator);
      if (term == null) {
        return null;
      }
      final Term member = term.getMember(evaluator, this.key);
      if (member != null) {
        return member.evaluate(evaluator);
      }
    } while (true);
  }

}
