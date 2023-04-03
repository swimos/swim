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
import swim.codec.Input;
import swim.codec.Parse;
import swim.expr.ExprParser;
import swim.expr.Term;
import swim.expr.TermForm;
import swim.expr.operator.BitwiseXorExpr;
import swim.util.Assume;

@Internal
public final class ParseBitwiseXorExpr extends Parse<Term> {

  final ExprParser parser;
  final TermForm<?> form;
  final @Nullable Parse<Term> parseLhs;
  final @Nullable Parse<Term> parseRhs;
  final int step;

  public ParseBitwiseXorExpr(ExprParser parser, TermForm<?> form,
                             @Nullable Parse<Term> parseLhs,
                             @Nullable Parse<Term> parseRhs, int step) {
    this.parser = parser;
    this.form = form;
    this.parseLhs = parseLhs;
    this.parseRhs = parseRhs;
    this.step = step;
  }

  @Override
  public Parse<Term> consume(Input input) {
    return ParseBitwiseXorExpr.parse(input, this.parser, this.form,
                                     this.parseLhs, this.parseRhs, this.step);
  }

  public static Parse<Term> parse(Input input, ExprParser parser, TermForm<?> form,
                                  @Nullable Parse<Term> parseLhs,
                                  @Nullable Parse<Term> parseRhs, int step) {
    int c = 0;
    if (step == 1) {
      if (parseLhs == null) {
        parseLhs = parser.parseBitwiseAndExpr(input, form);
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
        while (input.isCont() && parser.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == '^') {
          input.step();
          step = 3;
        } else if (input.isReady()) {
          return Assume.nonNull(parseLhs);
        }
      }
      if (step == 3) {
        if (parseRhs == null) {
          parseRhs = parser.parseBitwiseAndExpr(input, form);
        } else {
          parseRhs = parseRhs.consume(input);
        }
        if (parseRhs.isDone()) {
          parseLhs = Parse.done(new BitwiseXorExpr(Assume.nonNull(parseLhs).getNonNullUnchecked(),
                                                   parseRhs.getNonNullUnchecked()));
          parseRhs = null;
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
    return new ParseBitwiseXorExpr(parser, form, parseLhs, parseRhs, step);
  }

}
