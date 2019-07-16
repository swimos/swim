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

import swim.codec.Input;
import swim.codec.Parser;
import swim.util.Builder;

final class LambdaFuncParser<I, V> extends Parser<V> {
  final ReconParser<I, V> recon;
  final Builder<I, V> builder;
  final Parser<V> bindingsParser;
  final Parser<V> templateParser;
  final int step;

  LambdaFuncParser(ReconParser<I, V> recon, Builder<I, V> builder, Parser<V> bindingsParser,
                   Parser<V> templateParser, int step) {
    this.recon = recon;
    this.builder = builder;
    this.bindingsParser = bindingsParser;
    this.templateParser = templateParser;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.recon, this.builder, this.bindingsParser, this.templateParser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder,
                                Parser<V> bindingsParser, Parser<V> templateParser, int step) {
    int c = 0;
    if (step == 1) {
      if (bindingsParser == null) {
        bindingsParser = recon.parseConditionalOperator(input, builder);
      }
      while (bindingsParser.isCont() && !input.isEmpty()) {
        bindingsParser = bindingsParser.feed(input);
      }
      if (bindingsParser.isDone()) {
        step = 2;
      } else if (bindingsParser.isError()) {
        return bindingsParser.asError();
      }
    }
    if (step == 2) {
      if (input.isCont()) {
        c = input.head();
        if (c == '>') {
          // leading '=' consumed by ComparisonOperatorParser
          input = input.step();
          step = 3;
        } else {
          return bindingsParser;
        }
      } else if (input.isDone()) {
        return bindingsParser;
      }
    }
    if (step == 3) {
      if (templateParser == null) {
        templateParser = recon.parseConditionalOperator(input, null);
      }
      while (templateParser.isCont() && !input.isEmpty()) {
        templateParser = templateParser.feed(input);
      }
      if (templateParser.isDone()) {
        final V bindings = bindingsParser.bind();
        final V template = templateParser.bind();
        return done(recon.lambda(bindings, template));
      } else if (templateParser.isError()) {
        return templateParser.asError();
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new LambdaFuncParser<I, V>(recon, builder, bindingsParser, templateParser, step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder) {
    return parse(input, recon, builder, null, null, 1);
  }
}
