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
import swim.term.TermGenerator;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class FilterTerm implements Term, ToSource {

  final Term scope;
  final Term predicate;

  public FilterTerm(Term scope, Term predicate) {
    this.scope = scope.commit();
    this.predicate = predicate.commit();
  }

  public Term scope() {
    return this.scope;
  }

  public Term predicate() {
    return this.predicate;
  }

  @Override
  public boolean isGenerator() {
    return true;
  }

  @Override
  public TermGenerator generator() {
    return new FilterTermGenerator(this.scope.generator(), this.predicate);
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    return this.generator().intoTerm(evaluator);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof FilterTerm that) {
      return this.scope.equals(that.scope)
          && this.predicate.equals(that.predicate);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(FilterTerm.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.scope.hashCode()), this.predicate.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("FilterTerm", "of")
            .appendArgument(this.scope)
            .appendArgument(this.predicate)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static FilterTerm of(Term scope, Term predicate) {
    return new FilterTerm(scope, predicate);
  }

}

final class FilterTermGenerator implements TermGenerator {

  final TermGenerator scope;
  final Term predicate;

  FilterTermGenerator(TermGenerator scope, Term predicate) {
    this.scope = scope;
    this.predicate = predicate;
  }

  @Override
  public @Nullable Term evaluateNext(Evaluator evaluator) {
    do {
      Term term = this.scope.evaluateNext(evaluator);
      if (term == null) {
        return null;
      }
      term = term.evaluate(evaluator);
      if (evaluator.evaluateInContext(this.predicate, term).isTruthy()) {
        return term;
      }
    } while (true);
  }

}
