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
import swim.expr.operator.CondExpr;
import swim.util.Assume;

@Internal
public final class ParseCondExpr extends Parse<Term> {

  final ExprParser parser;
  final TermForm<?> form;
  final @Nullable Parse<Term> parseIf;
  final @Nullable Parse<Term> parseThen;
  final @Nullable Parse<Term> parseElse;
  final int step;

  public ParseCondExpr(ExprParser parser, TermForm<?> form,
                       @Nullable Parse<Term> parseIf,
                       @Nullable Parse<Term> parseThen,
                       @Nullable Parse<Term> parseElse, int step) {
    this.parser = parser;
    this.form = form;
    this.parseIf = parseIf;
    this.parseThen = parseThen;
    this.parseElse = parseElse;
    this.step = step;
  }

  @Override
  public Parse<Term> consume(Input input) {
    return ParseCondExpr.parse(input, this.parser, this.form, this.parseIf,
                               this.parseThen, this.parseElse, this.step);
  }

  public static Parse<Term> parse(Input input, ExprParser parser, TermForm<?> form,
                                  @Nullable Parse<Term> parseIf,
                                  @Nullable Parse<Term> parseThen,
                                  @Nullable Parse<Term> parseElse, int step) {
    int c = 0;
    if (step == 1) {
      if (parseIf == null) {
        parseIf = parser.parseOrExpr(input, form);
      } else {
        parseIf = parseIf.consume(input);
      }
      if (parseIf.isDone()) {
        step = 2;
      } else if (parseIf.isError()) {
        return parseIf.asError();
      }
    }
    if (step == 2) {
      parseIf = Assume.nonNull(parseIf);
      while (input.isCont()) {
        c = input.head();
        if (parser.isSpace(c)) {
          input.step();
        } else {
          break;
        }
      }
      if (input.isCont() && c == '?') {
        input.step();
        step = 3;
      } else if (input.isReady()) {
        return parseIf;
      }
    }
    if (step == 3) {
      if (parseThen == null) {
        parseThen = parser.parseCondExpr(input, form);
      } else {
        parseThen = parseThen.consume(input);
      }
      if (parseThen.isDone()) {
        step = 4;
      } else if (parseThen.isError()) {
        return parseThen.asError();
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
      if (input.isCont() && c == ':') {
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected(':', input));
      }
    }
    if (step == 5) {
      parseIf = Assume.nonNull(parseIf);
      parseThen = Assume.nonNull(parseThen);
      if (parseElse == null) {
        parseElse = parser.parseCondExpr(input, form);
      } else {
        parseElse = parseElse.consume(input);
      }
      if (parseElse.isDone()) {
        return Parse.done(new CondExpr(parseIf.getNonNull(),
                                       parseThen.getNonNull(),
                                       parseElse.getNonNull()));
      } else if (parseElse.isError()) {
        return parseElse.asError();
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseCondExpr(parser, form, parseIf, parseThen, parseElse, step);
  }

}
