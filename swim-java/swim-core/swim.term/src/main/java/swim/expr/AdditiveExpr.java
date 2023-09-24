// Copyright 2015-2023 Nstream, inc.
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
import swim.util.Assume;

@Public
@Since("5.0")
public abstract class AdditiveExpr extends InfixExpr {

  AdditiveExpr(Term lhs, Term rhs) {
    super(lhs, rhs);
  }

  @Override
  public int precedence() {
    return 8;
  }

  public static Parse<Object> parse(Input input, TermParser<?> parser,
                                    TermParserOptions options) {
    return ParseAdditiveExpr.parse(input, parser, options, null, null, null, 1);
  }

}

final class ParseAdditiveExpr extends Parse<Object> {

  final TermParser<?> parser;
  final TermParserOptions options;
  final @Nullable Parse<Object> parseLhs;
  final @Nullable String operator;
  final @Nullable Parse<Object> parseRhs;
  final int step;

  ParseAdditiveExpr(TermParser<?> parser, TermParserOptions options,
                    @Nullable Parse<Object> parseLhs, @Nullable String operator,
                    @Nullable Parse<Object> parseRhs, int step) {
    this.parser = parser;
    this.options = options;
    this.parseLhs = parseLhs;
    this.operator = operator;
    this.parseRhs = parseRhs;
    this.step = step;
  }

  @Override
  public Parse<Object> consume(Input input) {
    return ParseAdditiveExpr.parse(input, this.parser, this.options, this.parseLhs,
                                   this.operator, this.parseRhs, this.step);
  }

  static Parse<Object> parse(Input input, TermParser<?> parser, TermParserOptions options,
                             @Nullable Parse<Object> parseLhs, @Nullable String operator,
                             @Nullable Parse<Object> parseRhs, int step) {
    int c = 0;
    if (step == 1) {
      if (parseLhs == null) {
        parseLhs = MultiplicativeExpr.parse(input, parser, options);
      } else {
        parseLhs = parseLhs.consume(input);
      }
      if (parseLhs.isDone()) {
        step = 2;
      } else if (parseLhs.isError()) {
        return parseLhs.asError();
      }
    }
    do {
      if (step == 2) {
        while (input.isCont() && Term.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == '+') {
            operator = "+";
            input.step();
            step = 3;
          } else if (c == '-') {
            operator = "-";
            input.step();
            step = 3;
          } else {
            return Assume.nonNull(parseLhs);
          }
        } else if (input.isDone()) {
          return Assume.nonNull(parseLhs);
        }
      }
      if (step == 3) {
        if (parseRhs == null) {
          parseRhs = MultiplicativeExpr.parse(input, parser, options);
        } else {
          parseRhs = parseRhs.consume(input);
        }
        if (parseRhs.isDone()) {
          final Term lhs;
          try {
            lhs = options.termRegistry().intoTerm(Assume.nonNull(parseLhs).getUnchecked()).flatten();
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
          final Term rhs;
          try {
            rhs = options.termRegistry().intoTerm(parseRhs.getUnchecked()).flatten();
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
          if ("+".equals(operator)) {
            parseLhs = Parse.done(new PlusExpr(lhs, rhs));
          } else if ("-".equals(operator)) {
            parseLhs = Parse.done(new MinusExpr(lhs, rhs));
          } else {
            return Parse.error(Diagnostic.message("unexpected operator: " + operator, input));
          }
          parseRhs = null;
          operator = null;
          step = 2;
          continue;
        } else if (parseRhs.isError()) {
          return parseRhs.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseAdditiveExpr(parser, options, parseLhs, operator, parseRhs, step);
  }

}
