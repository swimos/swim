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
import swim.util.Assume;

@Internal
public final class ParsePrimaryExpr extends Parse<Term> {

  final ExprParser parser;
  final TermForm<?> form;
  final @Nullable Parse<Term> parseExpr;
  final int step;

  public ParsePrimaryExpr(ExprParser parser, TermForm<?> form,
                          @Nullable Parse<Term> parseExpr, int step) {
    this.parser = parser;
    this.form = form;
    this.parseExpr = parseExpr;
    this.step = step;
  }

  @Override
  public Parse<Term> consume(Input input) {
    return ParsePrimaryExpr.parse(input, this.parser, this.form,
                                  this.parseExpr, this.step);
  }

  public static Parse<Term> parse(Input input, ExprParser parser, TermForm<?> form,
                                  @Nullable Parse<Term> parseExpr, int step) {
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
      if (input.isCont() && c == '(') {
        input.step();
        step = 3;
      } else if (input.isReady()) {
        step = 2;
      }
    }
    if (step == 2) {
      if (parseExpr == null) {
        parseExpr = parser.parseLiteralExpr(input, form);
      } else {
        parseExpr = parseExpr.consume(input);
      }
      if (parseExpr.isDone()) {
        step = 6;
      } else if (parseExpr.isError()) {
        return parseExpr.asError();
      }
    }
    if (step == 3) {
      while (input.isCont() && parser.isWhitespace(input.head())) {
        input.step();
      }
      if (input.isReady()) {
        step = 4;
      }
    }
    if (step == 4) {
      if (parseExpr == null) {
        parseExpr = parser.parseGroupExpr(input, form);
      } else {
        parseExpr = parseExpr.consume(input);
      }
      if (parseExpr.isDone()) {
        step = 5;
      } else if (parseExpr.isError()) {
        return parseExpr.asError();
      }
    }
    if (step == 5) {
      while (input.isCont()) {
        c = input.head();
        if (parser.isWhitespace(c)) {
          input.step();
        } else {
          break;
        }
      }
      if (input.isCont() && c == ')') {
        input.step();
        step = 6;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected(')', input));
      }
    }
    if (step == 6) {
      parseExpr = Assume.nonNull(parseExpr);
      while (input.isCont()) {
        c = input.head();
        if (parser.isSpace(c)) {
          input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == ':' || c == '.' || c == '[' || c == '(') {
          return parser.parseSelectorExpr(input, form, parseExpr.getNonNull());
        } else {
          return parseExpr;
        }
      } else if (input.isDone()) {
        return parseExpr;
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParsePrimaryExpr(parser, form, parseExpr, step);
  }

}
