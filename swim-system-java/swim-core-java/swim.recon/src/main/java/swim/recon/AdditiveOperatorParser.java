// Copyright 2015-2019 SWIM.AI inc.
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

package swim.recon;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.util.Builder;

final class AdditiveOperatorParser<I, V> extends Parser<V> {
  final ReconParser<I, V> recon;
  final Builder<I, V> builder;
  final Parser<V> lhsParser;
  final String operator;
  final Parser<V> rhsParser;
  final int step;

  AdditiveOperatorParser(ReconParser<I, V> recon, Builder<I, V> builder, Parser<V> lhsParser,
                         String operator, Parser<V> rhsParser, int step) {
    this.recon = recon;
    this.builder = builder;
    this.lhsParser = lhsParser;
    this.operator = operator;
    this.rhsParser = rhsParser;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.recon, this.builder, this.lhsParser, this.operator,
                 this.rhsParser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder,
                                Parser<V> lhsParser, String operator, Parser<V> rhsParser, int step) {
    int c = 0;
    do {
      if (step == 1) {
        if (lhsParser == null) {
          lhsParser = recon.parseMultiplicativeOperator(input, builder);
        }
        while (lhsParser.isCont() && !input.isEmpty()) {
          lhsParser = lhsParser.feed(input);
        }
        if (lhsParser.isDone()) {
          step = 2;
        } else if (lhsParser.isError()) {
          return lhsParser.asError();
        }
      }
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (Recon.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '+') {
            input = input.step();
            operator = "+";
            step = 3;
          } else if (c == '-') {
            input = input.step();
            operator = "-";
            step = 3;
          } else {
            return lhsParser;
          }
        } else if (input.isDone()) {
          return lhsParser;
        }
      }
      if (step == 3) {
        if (rhsParser == null) {
          rhsParser = recon.parseMultiplicativeOperator(input, builder);
        }
        while (rhsParser.isCont() && !input.isEmpty()) {
          rhsParser = rhsParser.feed(input);
        }
        if (rhsParser.isDone()) {
          final V lhs = lhsParser.bind();
          final V rhs = rhsParser.bind();
          if ("+".equals(operator)) {
            lhsParser = done(recon.plus(lhs, rhs));
          } else if ("-".equals(operator)) {
            lhsParser = done(recon.minus(lhs, rhs));
          } else {
            return error(Diagnostic.message(operator, input));
          }
          rhsParser = null;
          operator = null;
          step = 2;
          continue;
        } else if (rhsParser.isError()) {
          return rhsParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new AdditiveOperatorParser<I, V>(recon, builder, lhsParser, operator, rhsParser, step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder) {
    return parse(input, recon, builder, null, null, null, 1);
  }
}
