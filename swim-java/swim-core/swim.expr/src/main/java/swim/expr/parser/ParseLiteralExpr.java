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
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.expr.ContextExpr;
import swim.expr.ExprParser;
import swim.expr.Term;
import swim.expr.TermException;
import swim.expr.TermForm;
import swim.expr.selector.ChildrenExpr;
import swim.expr.selector.DescendantsExpr;

@Internal
public final class ParseLiteralExpr extends Parse<Term> {

  final ExprParser parser;
  final TermForm<?> form;
  final int step;

  public ParseLiteralExpr(ExprParser parser, TermForm<?> form, int step) {
    this.parser = parser;
    this.form = form;
    this.step = step;
  }

  @Override
  public Parse<Term> consume(Input input) {
    return ParseLiteralExpr.parse(input, this.parser, this.form, this.step);
  }

  public static Parse<Term> parse(Input input, ExprParser parser,
                                  TermForm<?> form, int step) {
    int c = 0;
    if (step == 1) {
      while (input.isCont() && parser.isSpace(c = input.head())) {
        input.step();
      }
      if (input.isCont()) {
        if (c == '%') {
          return parser.parseContextExpr(input, form);
        } else if (c == '$') {
          return parser.parseGlobalExpr(input, form);
        } else if (c == '*') {
          input.step();
          step = 2;
        } else if (parser.isIdentifierStartChar(c)) {
          try {
            return parser.parseIdentifierTerm(input, form.identifierForm());
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '-' || (c >= '0' && c <= '9')) {
          try {
            return parser.parseNumberTerm(input, form.numberForm());
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '"') {
          try {
            return parser.parseStringTerm(input, form.stringForm());
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else {
          return Parse.error(Diagnostic.expected("literal", input));
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected("literal", input));
      }
    }
    if (step == 2) {
      if (input.isCont() && input.head() == '*') {
        input.step();
        return Parse.done(new DescendantsExpr(ContextExpr.of()));
      } else if (input.isReady()) {
        return Parse.done(new ChildrenExpr(ContextExpr.of()));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseLiteralExpr(parser, form, step);
  }

}
