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
import swim.expr.TermException;
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
        while (input.isCont() && parser.isSpace(c = input.head())) {
          input.step();
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
            argsBuilder = new ArrayBuilder<Term, Term[]>(Term.class);
            input.step();
            step = 10;
          } else {
            return Parse.done(term);
          }
        } else if (input.isDone()) {
          return Parse.done(term);
        }
      }
      if (step == 2) {
        while (input.isCont() && parser.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && parser.isIdentifierStartChar(c)) {
          stringBuilder = new StringBuilder().appendCodePoint(c);
          input.step();
          step = 3;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("identifier", input));
        }
      }
      if (step == 3) {
        while (input.isCont() && parser.isIdentifierChar(c = input.head())) {
          ((StringBuilder) Assume.nonNull(stringBuilder)).appendCodePoint(c);
          input.step();
        }
        if (input.isReady()) {
          term = new MemberExpr(term, ((StringBuilder) Assume.nonNull(stringBuilder)).toString());
          stringBuilder = null;
          step = 1;
          continue;
        }
      }
      if (step == 4) {
        while (input.isCont() && parser.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (parser.isIdentifierStartChar(c)) {
            try {
              final StringTermForm<Object, Object> stringForm = Assume.conforms(form.stringForm());
              stringBuilder = stringForm.stringBuilder();
              stringBuilder = stringForm.appendCodePoint(stringBuilder, c);
            } catch (TermException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 5;
          } else if (c == '0') {
            final Term keyTerm;
            try {
              final NumberTermForm<Object> numberForm = Assume.conforms(form.numberForm());
              keyTerm = numberForm.intoTerm(numberForm.integerValue(0L));
            } catch (TermException cause) {
              return Parse.diagnostic(input, cause);
            }
            term = new ChildExpr(term, keyTerm);
            input.step();
            step = 1;
            continue;
          } else if (c >= '1' && c <= '9') {
            try {
              form.numberForm(); // ensure numbers are supported
            } catch (TermException cause) {
              return Parse.diagnostic(input, cause);
            }
            index = c - '0';
            input.step();
            step = 6;
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
        final StringTermForm<Object, Object> stringForm;
        try {
          stringForm = Assume.conforms(form.stringForm());
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
        while (input.isCont() && parser.isIdentifierChar(c = input.head())) {
          try {
            stringBuilder = stringForm.appendCodePoint(Assume.nonNull(stringBuilder), c);
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
          input.step();
        }
        if (input.isReady()) {
          final Term keyTerm;
          try {
            keyTerm = stringForm.intoTerm(stringForm.buildString(Assume.nonNull(stringBuilder)));
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
          term = new ChildExpr(term, keyTerm);
          stringBuilder = null;
          step = 1;
          continue;
        }
      }
      if (step == 6) {
        while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
          final int newIndex = 10 * index + (c - '0');
          if (newIndex / index >= 10) {
            index = newIndex;
            input.step();
          } else {
            return Parse.error(Diagnostic.message("index overflow", input));
          }
        }
        if (input.isReady()) {
          final Term keyTerm;
          try {
            final NumberTermForm<Object> numberForm = Assume.conforms(form.numberForm());
            keyTerm = numberForm.intoTerm(numberForm.integerValue((long) index));
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
          term = new ChildExpr(term, keyTerm);
          index = 0;
          step = 1;
          continue;
        }
      }
      if (step == 7) {
        if (input.isCont() && input.head() == '*') {
          term = new DescendantsExpr(term);
          input.step();
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
        while (input.isCont() && parser.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == ']') {
          term = new ChildExpr(term, Assume.nonNull(parseArg).getNonNullUnchecked());
          parseArg = null;
          input.step();
          step = 1;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected(']', input));
        }
      }
      if (step == 10) {
        while (input.isCont() && parser.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == ')') {
            term = new InvokeExpr(term, Assume.nonNull(argsBuilder).build());
            argsBuilder = null;
            input.step();
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
        if (parseArg == null) {
          parseArg = parser.parseExpr(input, form);
        } else {
          parseArg = parseArg.consume(input);
        }
        if (parseArg.isDone()) {
          Assume.nonNull(argsBuilder).add(parseArg.getNonNullUnchecked());
          parseArg = null;
          step = 12;
        } else if (parseArg.isError()) {
          return parseArg.asError();
        }
      }
      if (step == 12) {
        while (input.isCont() && parser.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == ',') {
            input.step();
            step = 11;
            continue;
          } else if (c == ')') {
            term = new InvokeExpr(term, Assume.nonNull(argsBuilder).build());
            argsBuilder = null;
            input.step();
            step = 1;
            continue;
          } else {
            return Parse.error(Diagnostic.expected("',' or ')'", input));
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
