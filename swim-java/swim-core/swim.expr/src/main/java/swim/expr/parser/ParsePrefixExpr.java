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
import swim.expr.Term;
import swim.expr.TermForm;
import swim.expr.operator.BitwiseNotExpr;
import swim.expr.operator.NegativeExpr;
import swim.expr.operator.NotExpr;
import swim.expr.operator.PositiveExpr;

@Internal
public final class ParsePrefixExpr extends Parse<Term> {

  final ExprParser parser;
  final TermForm<?> form;
  final @Nullable String operator;
  final @Nullable Parse<Term> parseRhs;
  final int step;

  public ParsePrefixExpr(ExprParser parser, TermForm<?> form,
                         @Nullable String operator,
                         @Nullable Parse<Term> parseRhs, int step) {
    this.parser = parser;
    this.form = form;
    this.operator = operator;
    this.parseRhs = parseRhs;
    this.step = step;
  }

  @Override
  public Parse<Term> consume(Input input) {
    return ParsePrefixExpr.parse(input, this.parser, this.form,
                                 this.operator, this.parseRhs, this.step);
  }

  public static Parse<Term> parse(Input input, ExprParser parser, TermForm<?> form,
                                  @Nullable String operator,
                                  @Nullable Parse<Term> parseRhs, int step) {
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
        if (c == '!') {
          input.step();
          operator = "!";
          step = 2;
        } else if (c == '~') {
          input.step();
          operator = "~";
          step = 2;
        } else if (c == '-') {
          input.step();
          operator = "-";
          step = 2;
        } else if (c == '+') {
          input.step();
          operator = "+";
          step = 2;
        } else {
          return parser.parsePrimaryExpr(input, form);
        }
      } else if (input.isDone()) {
        return parser.parsePrimaryExpr(input, form);
      }
    }
    if (step == 2) {
      if (parseRhs == null) {
        parseRhs = parser.parsePrefixExpr(input, form);
      } else {
        parseRhs = parseRhs.consume(input);
      }
      if (parseRhs.isDone()) {
        if ("!".equals(operator)) {
          return Parse.done(new NotExpr(parseRhs.getNonNull()));
        } else if ("~".equals(operator)) {
          return Parse.done(new BitwiseNotExpr(parseRhs.getNonNull()));
        } else if ("-".equals(operator)) {
          final Term rhs = parseRhs.getNonNull();
          if (rhs.isValidNumber()) {
            return Parse.done(rhs.negative());
          } else {
            return Parse.done(new NegativeExpr(parseRhs.getNonNull()));
          }
        } else if ("+".equals(operator)) {
          final Term rhs = parseRhs.getNonNull();
          if (rhs.isValidNumber()) {
            return Parse.done(rhs.positive());
          } else {
            return Parse.done(new PositiveExpr(parseRhs.getNonNull()));
          }
        } else {
          return Parse.error(Diagnostic.message(operator, input));
        }
      } else if (parseRhs.isError()) {
        return parseRhs.asError();
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParsePrefixExpr(parser, form, operator, parseRhs, step);
  }

}
