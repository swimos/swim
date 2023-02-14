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
import swim.expr.operator.BitwiseOrExpr;
import swim.util.Assume;

@Internal
public final class ParseBitwiseOrExpr extends Parse<Term> {

  final ExprParser parser;
  final TermForm<?> form;
  final @Nullable Parse<Term> parseLhs;
  final @Nullable Parse<Term> parseRhs;
  final int step;

  public ParseBitwiseOrExpr(ExprParser parser, TermForm<?> form,
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
    return ParseBitwiseOrExpr.parse(input, this.parser, this.form,
                                    this.parseLhs, this.parseRhs, this.step);
  }

  public static Parse<Term> parse(Input input, ExprParser parser, TermForm<?> form,
                                  @Nullable Parse<Term> parseLhs,
                                  @Nullable Parse<Term> parseRhs, int step) {
    int c = 0;
    if (step == 1) {
      if (parseLhs == null) {
        parseLhs = parser.parseBitwiseXorExpr(input, form);
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
        parseLhs = Assume.nonNull(parseLhs);
        while (input.isCont()) {
          c = input.head();
          if (parser.isSpace(c)) {
            input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && c == '|') {
          final Input lookahead = input.clone();
          lookahead.step();
          if (lookahead.isCont() && lookahead.head() == '|') {
            return parseLhs;
          } else if (!lookahead.isEmpty()) {
            input.step();
            step = 3;
          }
        } else if (input.isReady()) {
          return parseLhs;
        }
      }
      if (step == 3) {
        parseLhs = Assume.nonNull(parseLhs);
        if (parseRhs == null) {
          parseRhs = parser.parseBitwiseXorExpr(input, form);
        } else {
          parseRhs = parseRhs.consume(input);
        }
        if (parseRhs.isDone()) {
          parseLhs = Parse.done(new BitwiseOrExpr(parseLhs.getNonNull(), parseRhs.getNonNull()));
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
    return new ParseBitwiseOrExpr(parser, form, parseLhs, parseRhs, step);
  }

}
