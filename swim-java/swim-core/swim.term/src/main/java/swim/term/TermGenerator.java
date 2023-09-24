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

package swim.term;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.ArrayBuilder;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public interface TermGenerator {

  @Nullable Term evaluateNext(Evaluator evaluator);

  default Term intoTerm(Evaluator evaluator) {
    final Term head = this.evaluateNext(evaluator);
    if (head == null) {
      return Term.trap();
    }
    Term term = this.evaluateNext(evaluator);
    if (term == null) {
      return head;
    }
    final ArrayBuilder<Term, Term[]> builder = new ArrayBuilder<Term, Term[]>(Term.class);
    builder.add(head);
    builder.add(term);
    do {
      term = this.evaluateNext(evaluator);
      if (term == null) {
        break;
      }
      builder.add(term);
    } while (true);
    return new TermList(builder.build());
  }

  static TermGenerator empty() {
    return GenerateTerm.EMPTY;
  }

  static TermGenerator of(@Nullable Term term) {
    if (term == null) {
      return GenerateTerm.EMPTY;
    }
    return new GenerateTerm(term);
  }

}

final class GenerateTerm implements TermGenerator, WriteSource {

  @Nullable Term term;

  GenerateTerm(@Nullable Term term) {
    this.term = term;
  }

  @Override
  public @Nullable Term evaluateNext(Evaluator evaluator) {
    final Term term = this.term;
    if (term == null) {
      return null;
    }
    this.term = null;
    return term.evaluate(evaluator);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.term != null) {
      notation.beginInvoke("TermGenerator", "of")
              .appendArgument(this.term)
              .endInvoke();
    } else {
      notation.beginInvoke("TermGenerator", "empty").endInvoke();
    }
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final GenerateTerm EMPTY = new GenerateTerm(null);

}
