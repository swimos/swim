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
import swim.expr.IdentifierTermForm;
import swim.expr.NumberTermForm;
import swim.expr.StringTermForm;
import swim.expr.Term;
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
      while (input.isCont()) {
        c = input.head();
        if (parser.isSpace(c)) {
          input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == '%') {
          return parser.parseContextExpr(input, form);
        } else if (c == '$') {
          return parser.parseGlobalExpr(input, form);
        } else if (c == '*') {
          input.step();
          step = 2;
        } else if (c == '"') {
          final StringTermForm<?, ?> stringForm = form.stringForm();
          if (stringForm != null) {
            return parser.parseStringTerm(input, stringForm);
          } else {
            return Parse.error(Diagnostic.message("unexpected string", input));
          }
        } else if (c == '-' || (c >= '0' && c <= '9')) {
          final NumberTermForm<?> numberForm = form.numberForm();
          if (numberForm != null) {
            return parser.parseNumberTerm(input, numberForm);
          } else {
            return Parse.error(Diagnostic.message("unexpected number", input));
          }
        } else if (parser.isIdentifierStartChar(c)) {
          final IdentifierTermForm<?> identifierForm = form.identifierForm();
          if (identifierForm != null) {
            return parser.parseIdentifierTerm(input, identifierForm);
          } else {
            return Parse.error(Diagnostic.message("unexpected identifier", input));
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
