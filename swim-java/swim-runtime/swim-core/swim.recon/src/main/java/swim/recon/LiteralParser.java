// Copyright 2015-2023 Nstream, inc.
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

final class LiteralParser<I, V> extends Parser<V> {

  final ReconParser<I, V> recon;
  final Builder<I, V> builder;
  final Parser<V> valueParser;
  final int step;

  LiteralParser(ReconParser<I, V> recon, Builder<I, V> builder, Parser<V> valueParser, int step) {
    this.recon = recon;
    this.builder = builder;
    this.valueParser = valueParser;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return LiteralParser.parse(input, this.recon, this.builder, this.valueParser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder,
                                Parser<V> valueParser, int step) {
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
          step = 4;
        } else if (c == '{') {
          if (builder == null) {
            builder = recon.recordBuilder();
          }
          valueParser = recon.parseRecord(input, builder);
          step = 3;
        } else if (c == '[') {
          if (builder == null) {
            builder = recon.recordBuilder();
          }
          valueParser = recon.parseMarkup(input, builder);
          step = 3;
        } else if (Recon.isIdentStartChar(c)) {
          valueParser = recon.parseIdent(input);
          step = 2;
        } else if (c == '"' || c == '\'') {
          valueParser = recon.parseString(input);
          step = 2;
        } else if (c == '`') {
          valueParser = recon.parseRawString(input);
          step = 2;
        } else if (c == '-' || c >= '0' && c <= '9') {
          valueParser = recon.parseNumber(input);
          step = 2;
        } else if (c == '%') {
          valueParser = recon.parseData(input);
          step = 2;
        } else if (c == '$') {
          valueParser = recon.parseSelector(input);
          step = 2;
        } else if (builder == null) {
          return Parser.done(recon.extant());
        } else {
          return Parser.done(builder.bind());
        }
      } else if (input.isDone()) {
        if (builder == null) {
          return Parser.done(recon.extant());
        } else {
          return Parser.done(builder.bind());
        }
      }
    }
    if (step == 2) {
      while (valueParser.isCont() && !input.isEmpty()) {
        valueParser = valueParser.feed(input);
      }
      if (valueParser.isDone()) {
        if (builder == null) {
          builder = recon.valueBuilder();
        }
        builder.add(recon.item(valueParser.bind()));
        return Parser.done(builder.bind());
      } else if (valueParser.isError()) {
        return valueParser.asError();
      }
    }
    if (step == 3) {
      while (valueParser.isCont() && !input.isEmpty()) {
        valueParser = valueParser.feed(input);
      }
      if (valueParser.isDone()) {
        return Parser.done(builder.bind());
      } else if (valueParser.isError()) {
        return valueParser.asError();
      }
    }
    if (step == 4) {
      if (valueParser == null) {
        valueParser = recon.parseBlockExpression(input);
      }
      while (valueParser.isCont() && !input.isEmpty()) {
        valueParser = valueParser.feed(input);
      }
      if (valueParser.isDone()) {
        step = 5;
      } else if (valueParser.isError()) {
        return valueParser.asError();
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
          if (builder == null) {
            builder = recon.valueBuilder();
          }
          builder.add(recon.item(valueParser.bind()));
          return Parser.done(builder.bind());
        } else {
          return Parser.error(Diagnostic.expected(')', input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected(')', input));
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new LiteralParser<I, V>(recon, builder, valueParser, step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder) {
    return LiteralParser.parse(input, recon, builder, null, 1);
  }

}
