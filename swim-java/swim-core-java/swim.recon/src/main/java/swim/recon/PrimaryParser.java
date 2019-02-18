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

final class PrimaryParser<I, V> extends Parser<V> {
  final ReconParser<I, V> recon;
  final Builder<I, V> builder;
  final Parser<V> exprParser;
  final int step;

  PrimaryParser(ReconParser<I, V> recon, Builder<I, V> builder, Parser<V> exprParser, int step) {
    this.recon = recon;
    this.builder = builder;
    this.exprParser = exprParser;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.recon, this.builder, this.exprParser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder,
                                Parser<V> exprParser, int step) {
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
        if (c == '(') {
          input = input.step();
          step = 3;
        } else {
          step = 2;
        }
      } else if (input.isDone()) {
        step = 2;
      }
    }
    if (step == 2) {
      if (exprParser == null) {
        exprParser = recon.parseLiteral(input, builder);
      }
      while (exprParser.isCont() && !input.isEmpty()) {
        exprParser = exprParser.feed(input);
      }
      if (exprParser.isDone()) {
        return exprParser;
      } else if (exprParser.isError()) {
        return exprParser.asError();
      }
    }
    if (step == 3) {
      if (exprParser == null) {
        exprParser = recon.parseBlockExpression(input, builder);
      }
      while (exprParser.isCont() && !input.isEmpty()) {
        exprParser = exprParser.feed(input);
      }
      if (exprParser.isDone()) {
        step = 4;
      } else if (exprParser.isError()) {
        return exprParser.asError();
      }
    }
    do {
      if (step == 4) {
        while (input.isCont()) {
          c = input.head();
          if (Recon.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == ',') {
            input = input.step();
            if (exprParser != null) {
              if (builder == null) {
                builder = recon.recordBuilder();
                builder.add(recon.item(exprParser.bind()));
              }
              exprParser = null;
            }
            step = 5;
          } else if (c == ')') {
            input = input.step();
            if (exprParser != null) {
              return exprParser;
            } else {
              return done(builder.bind());
            }
          } else {
            return error(Diagnostic.expected(')', input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected(')', input));
        }
      }
      if (step == 5) {
        if (exprParser == null) {
          exprParser = recon.parseBlockExpression(input, builder);
        }
        while (exprParser.isCont() && !input.isEmpty()) {
          exprParser = exprParser.feed(input);
        }
        if (exprParser.isDone()) {
          exprParser = null;
          step = 4;
          continue;
        } else if (exprParser.isError()) {
          return exprParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new PrimaryParser<I, V>(recon, builder, exprParser, step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder) {
    return parse(input, recon, builder, null, 1);
  }
}
