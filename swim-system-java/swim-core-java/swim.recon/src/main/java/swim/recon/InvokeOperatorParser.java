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

final class InvokeOperatorParser<I, V> extends Parser<V> {
  final ReconParser<I, V> recon;
  final Builder<I, V> builder;
  final Parser<V> exprParser;
  final Parser<V> argsParser;
  final int step;

  InvokeOperatorParser(ReconParser<I, V> recon, Builder<I, V> builder, Parser<V> exprParser,
                       Parser<V> argsParser, int step) {
    this.recon = recon;
    this.builder = builder;
    this.exprParser = exprParser;
    this.argsParser = argsParser;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.recon, this.builder, this.exprParser, this.argsParser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder,
                                Parser<V> exprParser, Parser<V> argsParser, int step) {
    int c = 0;
    if (step == 1) {
      if (exprParser == null) {
        exprParser = recon.parsePrimary(input, builder);
      }
      while (exprParser.isCont() && !input.isEmpty()) {
        exprParser = exprParser.feed(input);
      }
      if (exprParser.isDone()) {
        step = 2;
      } else if (exprParser.isError()) {
        return exprParser.asError();
      }
    }
    do {
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
          if (c == '(') {
            input = input.step();
            step = 3;
          } else {
            return exprParser;
          }
        } else if (input.isDone()) {
          return exprParser;
        }
      }
      if (step == 3) {
        while (input.isCont()) {
          c = input.head();
          if (Recon.isWhitespace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == ')') {
            input = input.step();
            final V expr = exprParser.bind();
            exprParser = done(recon.invoke(expr, recon.extant()));
            step = 2;
            continue;
          } else {
            step = 4;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected(')', input));
        }
      }
      if (step == 4) {
        if (argsParser == null) {
          argsParser = recon.parseBlock(input);
        }
        while (argsParser.isCont() && !input.isEmpty()) {
          argsParser = argsParser.feed(input);
        }
        if (argsParser.isDone()) {
          step = 5;
        } else if (argsParser.isError()) {
          return argsParser.asError();
        }
      }
      if (step == 5) {
        while (input.isCont()) {
          c = input.head();
          if (Recon.isWhitespace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == ')') {
            input = input.step();
            final V expr = exprParser.bind();
            final V args = argsParser.bind();
            exprParser = done(recon.invoke(expr, args));
            argsParser = null;
            step = 2;
            continue;
          } else {
            return error(Diagnostic.expected(')', input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected(')', input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new InvokeOperatorParser<I, V>(recon, builder, exprParser, argsParser, step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder) {
    return parse(input, recon, builder, null, null, 1);
  }
}
