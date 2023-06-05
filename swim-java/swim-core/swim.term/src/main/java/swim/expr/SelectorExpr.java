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
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.term.Term;
import swim.term.TermException;
import swim.term.TermParser;
import swim.term.TermParserOptions;
import swim.util.ArrayBuilder;
import swim.util.Assume;

@Public
@Since("5.0")
public abstract class SelectorExpr implements Expr {

  SelectorExpr() {
    // nop
  }

  @Override
  public int precedence() {
    return 11;
  }

  public SelectorExpr member(String key) {
    return new MemberExpr(this, key);
  }

  public SelectorExpr child(Term key) {
    return new ChildExpr(this, key);
  }

  public SelectorExpr children() {
    return new ChildrenExpr(this);
  }

  public SelectorExpr descendants() {
    return new DescendantsExpr(this);
  }

  public static Parse<Term> parse(Input input, TermParser<?> parser,
                                  TermParserOptions options, Term term) {
    return ParseSelectorExpr.parse(input, parser, options, term, null, null, null, 0, 1);
  }

}

final class ParseSelectorExpr<T> extends Parse<Term> {

  final TermParser<T> parser;
  final TermParserOptions options;
  final Term term;
  final @Nullable Parse<T> parseArg;
  final @Nullable ArrayBuilder<Term, Term[]> argsBuilder;
  final @Nullable StringBuilder stringBuilder;
  final int index;
  final int step;

  ParseSelectorExpr(TermParser<T> parser, TermParserOptions options,
                    Term term, @Nullable Parse<T> parseArg,
                    @Nullable ArrayBuilder<Term, Term[]> argsBuilder,
                    @Nullable StringBuilder stringBuilder, int index, int step) {
    this.parser = parser;
    this.options = options;
    this.term = term;
    this.parseArg = parseArg;
    this.argsBuilder = argsBuilder;
    this.stringBuilder = stringBuilder;
    this.index = index;
    this.step = step;
  }

  @Override
  public Parse<Term> consume(Input input) {
    return ParseSelectorExpr.parse(input, this.parser, this.options,
                                   this.term, this.parseArg, this.argsBuilder,
                                   this.stringBuilder, this.index, this.step);
  }

  static <T> Parse<Term> parse(Input input, TermParser<T> parser, TermParserOptions options,
                               Term term, @Nullable Parse<T> parseArg,
                               @Nullable ArrayBuilder<Term, Term[]> argsBuilder,
                               @Nullable StringBuilder stringBuilder, int index, int step) {
    int c = 0;
    do {
      if (step == 1) {
        while (input.isCont() && Term.isSpace(c = input.head())) {
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
        while (input.isCont() && Term.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && Term.isIdentifierStartChar(c)) {
          stringBuilder = new StringBuilder().appendCodePoint(c);
          input.step();
          step = 3;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("identifier", input));
        }
      }
      if (step == 3) {
        while (input.isCont() && Term.isIdentifierChar(c = input.head())) {
          Assume.nonNull(stringBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isReady()) {
          term = new MemberExpr(term, Assume.nonNull(stringBuilder).toString());
          stringBuilder = null;
          step = 1;
          continue;
        }
      }
      if (step == 4) {
        while (input.isCont() && Term.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (Term.isIdentifierStartChar(c)) {
            stringBuilder = new StringBuilder().appendCodePoint(c);
            input.step();
            step = 5;
          } else if (c == '0') {
            term = new ChildExpr(term.flatten(), Term.of(0));
            input.step();
            step = 1;
            continue;
          } else if (c >= '1' && c <= '9') {
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
        while (input.isCont() && Term.isIdentifierChar(c = input.head())) {
          Assume.nonNull(stringBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isReady()) {
          term = new ChildExpr(term.flatten(), Term.of(Assume.nonNull(stringBuilder).toString()));
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
          term = new ChildExpr(term.flatten(), Term.of(index));
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
          parseArg = parser.parse(input, options);
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
        while (input.isCont() && Term.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == ']') {
          final Term arg;
          try {
            arg = options.termRegistry().intoTerm(Assume.nonNull(parseArg).getUnchecked()).flatten();
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
          term = new ChildExpr(term.flatten(), arg);
          parseArg = null;
          input.step();
          step = 1;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected(']', input));
        }
      }
      if (step == 10) {
        while (input.isCont() && Term.isWhitespace(c = input.head())) {
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
          parseArg = parser.parse(input, options);
        } else {
          parseArg = parseArg.consume(input);
        }
        if (parseArg.isDone()) {
          final Term arg;
          try {
            arg = options.termRegistry().intoTerm(Assume.nonNull(parseArg).getUnchecked()).flatten();
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
          Assume.nonNull(argsBuilder).add(arg);
          parseArg = null;
          step = 12;
        } else if (parseArg.isError()) {
          return parseArg.asError();
        }
      }
      if (step == 12) {
        while (input.isCont() && Term.isWhitespace(c = input.head())) {
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
    return new ParseSelectorExpr<T>(parser, options, term, parseArg, argsBuilder,
                                    stringBuilder, index, step);
  }

}
