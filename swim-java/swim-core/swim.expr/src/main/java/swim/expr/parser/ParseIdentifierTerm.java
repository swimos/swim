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

package swim.expr.parser;

import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.expr.ExprParser;
import swim.expr.IdentifierTermForm;
import swim.expr.Term;
import swim.expr.TermException;
import swim.util.Assume;

@Internal
public final class ParseIdentifierTerm<T> extends Parse<Term> {

  final ExprParser parser;
  final IdentifierTermForm<T> form;
  final @Nullable StringBuilder builder;
  final int step;

  public ParseIdentifierTerm(ExprParser parser, IdentifierTermForm<T> form,
                             @Nullable StringBuilder builder, int step) {
    this.parser = parser;
    this.form = form;
    this.builder = builder;
    this.step = step;
  }

  @Override
  public Parse<Term> consume(Input input) {
    return ParseIdentifierTerm.parse(input, this.parser, this.form,
                                     this.builder, this.step);
  }

  public static <T> Parse<Term> parse(Input input, ExprParser parser,
                                      IdentifierTermForm<T> form,
                                      @Nullable StringBuilder builder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && parser.isIdentifierStartChar(c = input.head())) {
        builder = new StringBuilder();
        builder.appendCodePoint(c);
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("identifier", input));
      }
    }
    if (step == 2) {
      while (input.isCont() && parser.isIdentifierChar(c = input.head())) {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        final String identifier = Assume.nonNull(builder).toString();
        try {
          return Parse.done(form.intoTerm(form.identifierValue(identifier, parser)));
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseIdentifierTerm<T>(parser, form, builder, step);
  }

}
