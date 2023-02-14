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
import swim.util.ArrayIterator;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
final class TermList implements Term, ToSource {

  final Term[] terms;

  TermList(Term[] terms) {
    this.terms = terms;
  }

  @Override
  public @Nullable Term getChild(Evaluator evaluator, Term keyExpr) {
    final Term keyTerm = keyExpr.evaluate(evaluator);
    if (keyTerm.isValidInt()) {
      final int index = keyTerm.intValue();
      if (index >= 0 && index < this.terms.length) {
        return this.terms[index];
      }
    }
    return null;
  }

  @Override
  public TermGenerator getChildren() {
    return new TermListGenerator(this.terms);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("TermList", "of");
    for (int i = 0; i < this.terms.length; i += 1) {
      final Term term = this.terms[i];
      if (term.isValidObject()) {
        notation.appendArgument(term.objectValue());
      } else {
        notation.appendArgument(term);
      }
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static TermList of(Term... terms) {
    return new TermList(terms);
  }

}

final class TermListGenerator implements TermGenerator {

  final Term[] terms;
  int index;

  TermListGenerator(Term[] terms) {
    this.terms = terms;
    this.index = 0;
  }

  @Override
  public @Nullable Term evaluateNext(Evaluator evaluator) {
    final int index = this.index;
    if (index >= this.terms.length) {
      return null;
    }
    this.index = index + 1;
    return this.terms[index].evaluate(evaluator);
  }

}
