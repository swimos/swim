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
public final class FilterMethod implements Term, WriteSource {

  final Term scope;

  public FilterMethod(Term scope) {
    this.scope = scope.commit();
  }

  public Term scope() {
    return this.scope;
  }

  @Override
  public Term invoke(Evaluator evaluator, Term... args) {
    if (args.length == 0) {
      return Term.trap();
    }
    return new FilterTerm(this.scope, args[0]);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof FilterMethod that) {
      return this.scope.equals(that.scope);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(FilterMethod.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, this.scope.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("FilterMethod", "of")
            .appendArgument(this.scope)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static FilterMethod of(Term scope) {
    return new FilterMethod(scope);
  }

}
