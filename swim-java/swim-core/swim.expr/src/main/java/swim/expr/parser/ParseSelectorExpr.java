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
import swim.expr.NumberTermForm;
import swim.expr.StringTermForm;
import swim.expr.Term;
import swim.expr.TermForm;
import swim.expr.selector.ChildExpr;
import swim.expr.selector.ChildrenExpr;
import swim.expr.selector.DescendantsExpr;
import swim.expr.selector.InvokeExpr;
import swim.expr.selector.MemberExpr;
import swim.util.ArrayBuilder;
import swim.util.Assume;

@Internal
public final class ParseSelectorExpr extends Parse<Term> {

  final ExprParser parser;
  final TermForm<?> form;
  final Term term;
  final @Nullable Parse<Term> parseArg;
  final @Nullable ArrayBuilder<Term, Term[]> argsBuilder;
  final @Nullable Object stringBuilder;
  final int index;
  final int step;

  public ParseSelectorExpr(ExprParser parser, TermForm<?> form, Term term,
                           @Nullable Parse<Term> parseArg,
                           @Nullable ArrayBuilder<Term, Term[]> argsBuilder,
                           @Nullable Object stringBuilder,
                           int index, int step) {
    this.parser = parser;
    this.form = form;
    this.term = term;
    this.parseArg = parseArg;
    this.argsBuilder = argsBuilder;
    this.stringBuilder = stringBuilder;
    this.index = index;
    this.step = step;
  }

  @Override
  public Parse<Term> consume(Input input) {
    return ParseSelectorExpr.parse(input, this.parser, this.form, this.term,
                                   this.parseArg, this.argsBuilder,
                                   this.stringBuilder, this.index, this.step);
  }

  public static Parse<Term> parse(Input input, ExprParser parser, TermForm<?> form,
                                  Term term, @Nullable Parse<Term> parseArg,
                                  @Nullable ArrayBuilder<Term, Term[]> argsBuilder,
                                  @Nullable Object stringBuilder,
                                  int index, int step) {
    int c = 0;
    do {
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
          if (c == ':') {
            final Input lookahead = input.clone();
            lookahead.step();
            if (lookahead.isCont() && lookahead.head() == ':') {
              input.step();
              input.step();
              step = 2;
            } else if (!lookahead.isEmpty()) {
              return Parse.done(term);
            }
          } else if (c == '.') {
            input.step();
            step = 4;
          } else if (c == '[') {
            input.step();
            step = 8;
          } else if (c == '(') {
            input.step();
            argsBuilder = new ArrayBuilder<Term, Term[]>(Term.class);
            step = 10;
          } else {
            return Parse.done(term);
          }
        } else if (input.isDone()) {
          return Parse.done(term);
        }
      }
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (parser.isSpace(c)) {
            input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && parser.isIdentifierStartChar(c)) {
          input.step();
          stringBuilder = new StringBuilder().appendCodePoint(c);
          step = 3;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("identifier", input));
        }
      }
      if (step == 3) {
        stringBuilder = Assume.nonNull(stringBuilder);
        while (input.isCont()) {
          c = input.head();
          if (parser.isIdentifierChar(c)) {
            input.step();
            ((StringBuilder) stringBuilder).appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isReady()) {
          term = new MemberExpr(term, ((StringBuilder) stringBuilder).toString());
          stringBuilder = null;
          step = 1;
          continue;
        }
      }
      if (step == 4) {
        while (input.isCont()) {
          c = input.head();
          if (parser.isSpace(c)) {
            input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (parser.isIdentifierStartChar(c)) {
            final StringTermForm<Object, Object> stringForm = Assume.conformsNullable(form.stringForm());
            if (stringForm != null) {
              input.step();
              stringBuilder = stringForm.stringBuilder();
              stringBuilder = stringForm.appendCodePoint(stringBuilder, c);
              step = 5;
            } else {
              return Parse.error(Diagnostic.message("unexpected string", input));
            }
          } else if (c == '0') {
            final NumberTermForm<Object> numberForm = Assume.conformsNullable(form.numberForm());
            if (numberForm != null) {
              input.step();
              term = new ChildExpr(term, numberForm.intoTerm(numberForm.integerValue(0L)));
              step = 1;
              continue;
            } else {
              return Parse.error(Diagnostic.message("unexpected number", input));
            }
          } else if (c >= '1' && c <= '9') {
            final NumberTermForm<Object> numberForm = Assume.conformsNullable(form.numberForm());
            if (numberForm != null) {
              input.step();
              index = c - '0';
              step = 6;
            } else {
              return Parse.error(Diagnostic.message("unexpected number", input));
            }
          } else if (c == '*') {
            input.step();
            step = 7;
          } else {
            return Parse.error(Diagnostic.expected("selector", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected("selector", input));
        }
      }
      if (step == 5) {
        stringBuilder = Assume.nonNull(stringBuilder);
        final StringTermForm<Object, Object> stringForm = Assume.conformsNonNull(form.stringForm());
        while (input.isCont()) {
          c = input.head();
          if (parser.isIdentifierChar(c)) {
            input.step();
            stringBuilder = stringForm.appendCodePoint(stringBuilder, c);
          } else {
            break;
          }
        }
        if (input.isReady()) {
          term = new ChildExpr(term, stringForm.intoTerm(stringForm.buildString(stringBuilder)));
          stringBuilder = null;
          step = 1;
          continue;
        }
      }
      if (step == 6) {
        while (input.isCont()) {
          c = input.head();
          if (c >= '0' && c <= '9') {
            final int newIndex = 10 * index + (c - '0');
            if (newIndex / index >= 10) {
              input.step();
              index = newIndex;
            } else {
              return Parse.error(Diagnostic.message("index overflow", input));
            }
          } else {
            break;
          }
        }
        if (input.isReady()) {
          final NumberTermForm<Object> numberForm = Assume.conformsNonNull(form.numberForm());
          term = new ChildExpr(term, numberForm.intoTerm(numberForm.integerValue((long) index)));
          index = 0;
          step = 1;
          continue;
        }
      }
      if (step == 7) {
        if (input.isCont() && input.head() == '*') {
          input.step();
          term = new DescendantsExpr(term);
          step = 1;
          continue;
        } else if (input.isReady()) {
          term = new ChildrenExpr(term);
          step = 1;
          continue;
        }
      }
      if (step == 8) {
        if (parseArg == null) {
          parseArg = parser.parseExpr(input, form);
        } else {
          parseArg = parseArg.consume(input);
        }
        if (parseArg.isDone()) {
          step = 9;
        } else if (parseArg.isError()) {
          return parseArg.asError();
        }
      }
      if (step == 9) {
        parseArg = Assume.nonNull(parseArg);
        while (input.isCont()) {
          c = input.head();
          if (parser.isSpace(c)) {
            input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && c == ']') {
          input.step();
          term = new ChildExpr(term, parseArg.getNonNull());
          parseArg = null;
          step = 1;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected(']', input));
        }
      }
      if (step == 10) {
        argsBuilder = Assume.nonNull(argsBuilder);
        while (input.isCont()) {
          c = input.head();
          if (parser.isWhitespace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == ')') {
            input.step();
            term = new InvokeExpr(term, argsBuilder.build());
            argsBuilder = null;
            step = 1;
            continue;
          } else {
            step = 11;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected(')', input));
        }
      }
      if (step == 11) {
        argsBuilder = Assume.nonNull(argsBuilder);
        if (parseArg == null) {
          parseArg = parser.parseExpr(input, form);
        } else {
          parseArg = parseArg.consume(input);
        }
        if (parseArg.isDone()) {
          argsBuilder.add(parseArg.getNonNull());
          parseArg = null;
          step = 12;
        } else if (parseArg.isError()) {
          return parseArg.asError();
        }
      }
      if (step == 12) {
        argsBuilder = Assume.nonNull(argsBuilder);
        while (input.isCont()) {
          c = input.head();
          if (parser.isWhitespace(c)) {
            input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == ',') {
            input.step();
            step = 11;
            continue;
          } else if (c == ')') {
            input.step();
            term = new InvokeExpr(term, argsBuilder.build());
            argsBuilder = null;
            step = 1;
            continue;
          } else {
            return Parse.error(Diagnostic.expected(')', input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected(')', input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseSelectorExpr(parser, form, term, parseArg, argsBuilder,
                                 stringBuilder, index, step);
  }

}
