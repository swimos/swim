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

final class PrefixOperatorParser<I, V> extends Parser<V> {
  final ReconParser<I, V> recon;
  final Builder<I, V> builder;
  final String operator;
  final Parser<V> rhsParser;
  final int step;

  PrefixOperatorParser(ReconParser<I, V> recon, Builder<I, V> builder, String operator,
                       Parser<V> rhsParser, int step) {
    this.recon = recon;
    this.builder = builder;
    this.operator = operator;
    this.rhsParser = rhsParser;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.recon, this.builder, this.operator, this.rhsParser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder,
                                String operator, Parser<V> rhsParser, int step) {
    int c = 0;
    if (step == 1) {
      while (input.isCont()) {
        c = input.head();
        if (Recon.isSpace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == '!') {
          input = input.step();
          operator = "!";
        } else if (c == '~') {
          input = input.step();
          operator = "~";
        } else if (c == '-') {
          input = input.step();
          operator = "-";
        } else if (c == '+') {
          input = input.step();
          operator = "+";
        } else {
          return recon.parseInvokeOperator(input, builder);
        }
        step = 2;
      } else if (input.isDone()) {
        return recon.parseInvokeOperator(input, builder);
      }
    }
    if (step == 2) {
      if (rhsParser == null) {
        rhsParser = recon.parsePrefixOperator(input, builder);
      }
      while (rhsParser.isCont() && !input.isEmpty()) {
        rhsParser = rhsParser.feed(input);
      }
      if (rhsParser.isDone()) {
        final V operand = rhsParser.bind();
        if (!recon.isDistinct(operand)) {
          return error(Diagnostic.expected("value", input));
        } else if ("!".equals(operator)) {
          return done(recon.not(operand));
        } else if ("~".equals(operator)) {
          return done(recon.bitwiseNot(operand));
        } else if ("-".equals(operator)) {
          return done(recon.negative(operand));
        } else if ("+".equals(operator)) {
          return done(recon.positive(operand));
        } else {
          return error(Diagnostic.message(operator, input));
        }
      } else if (rhsParser.isError()) {
        return rhsParser.asError();
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new PrefixOperatorParser<I, V>(recon, builder, operator, rhsParser, step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder) {
    return parse(input, recon, builder, null, null, 1);
  }
}
