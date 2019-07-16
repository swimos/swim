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

final class ConditionalOperatorParser<I, V> extends Parser<V> {
  final ReconParser<I, V> recon;
  final Builder<I, V> builder;
  final Parser<V> ifParser;
  final Parser<V> thenParser;
  final Parser<V> elseParser;
  final int step;

  ConditionalOperatorParser(ReconParser<I, V> recon, Builder<I, V> builder, Parser<V> ifParser,
                            Parser<V> thenParser, Parser<V> elseParser, int step) {
    this.recon = recon;
    this.builder = builder;
    this.ifParser = ifParser;
    this.thenParser = thenParser;
    this.elseParser = elseParser;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.recon, this.builder, this.ifParser, this.thenParser,
                 this.elseParser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder,
                                Parser<V> ifParser, Parser<V> thenParser,
                                Parser<V> elseParser, int step) {
    int c = 0;
    if (step == 1) {
      if (ifParser == null) {
        ifParser = recon.parseOrOperator(input, builder);
      }
      while (ifParser.isCont() && !input.isEmpty()) {
        ifParser = ifParser.feed(input);
      }
      if (ifParser.isDone()) {
        step = 2;
      } else if (ifParser.isError()) {
        return ifParser.asError();
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
        if (c == '?') {
          input = input.step();
          step = 3;
        } else {
          return ifParser;
        }
      } else if (input.isDone()) {
        return ifParser;
      }
    }
    if (step == 3) {
      if (thenParser == null) {
        thenParser = recon.parseConditionalOperator(input, builder);
      }
      while (thenParser.isCont() && !input.isEmpty()) {
        thenParser = thenParser.feed(input);
      }
      if (thenParser.isDone()) {
        step = 4;
      } else if (thenParser.isError()) {
        return thenParser.asError();
      }
    }
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
        if (c == ':') {
          input = input.step();
          step = 5;
        } else {
          return error(Diagnostic.expected(':', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected(':', input));
      }
    }
    if (step == 5) {
      if (elseParser == null) {
        elseParser = recon.parseConditionalOperator(input, builder);
      }
      while (elseParser.isCont() && !input.isEmpty()) {
        elseParser = elseParser.feed(input);
      }
      if (elseParser.isDone()) {
        final V ifTerm = ifParser.bind();
        final V thenTerm = thenParser.bind();
        final V elseTerm = elseParser.bind();
        return done(recon.conditional(ifTerm, thenTerm, elseTerm));
      } else if (elseParser.isError()) {
        return elseParser.asError();
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new ConditionalOperatorParser<I, V>(recon, builder, ifParser, thenParser, elseParser, step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder) {
    return parse(input, recon, builder, null, null, null, 1);
  }
}
