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

final class BlockItemParser<I, V> extends Parser<V> {
  final ReconParser<I, V> recon;
  final Builder<I, V> builder;
  final Parser<I> fieldParser;
  final Parser<V> valueParser;
  final int step;

  BlockItemParser(ReconParser<I, V> recon, Builder<I, V> builder, Parser<I> fieldParser,
                  Parser<V> valueParser, int step) {
    this.recon = recon;
    this.builder = builder;
    this.fieldParser = fieldParser;
    this.valueParser = valueParser;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.recon, this.builder, this.fieldParser, this.valueParser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder,
                                Parser<I> fieldParser, Parser<V> valueParser, int step) {
    int c = 0;
    do {
      if (step == 1) {
        if (input.isCont()) {
          c = input.head();
          if (c == '@') {
            fieldParser = recon.parseAttr(input);
            step = 2;
          } else if (c == '{') {
            if (builder == null) {
              builder = recon.recordBuilder();
            }
            valueParser = recon.parseRecord(input, builder);
            step = 5;
          } else if (c == '[') {
            if (builder == null) {
              builder = recon.recordBuilder();
            }
            valueParser = recon.parseMarkup(input, builder);
            step = 5;
          } else if (Recon.isIdentStartChar(c)) {
            valueParser = recon.parseIdent(input);
            step = 4;
          } else if (c == '"' || c == '\'') {
            valueParser = recon.parseString(input);
            step = 4;
          } else if (c == '-' || c >= '0' && c <= '9') {
            valueParser = recon.parseNumber(input);
            step = 4;
          } else if (c == '%') {
            valueParser = recon.parseData(input);
            step = 4;
          } else if (c == '$') {
            valueParser = recon.parseSelector(input);
            step = 4;
          } else if (builder == null) {
            return done(recon.extant());
          } else {
            return done(builder.bind());
          }
        } else if (input.isDone()) {
          if (builder == null) {
            return done(recon.extant());
          } else {
            return done(builder.bind());
          }
        }
      }
      if (step == 2) {
        while (fieldParser.isCont() && !input.isEmpty()) {
          fieldParser = fieldParser.feed(input);
        }
        if (fieldParser.isDone()) {
          if (builder == null) {
            builder = recon.valueBuilder();
          }
          builder.add(fieldParser.bind());
          fieldParser = null;
          step = 3;
        } else if (fieldParser.isError()) {
          return fieldParser.asError();
        }
      }
      if (step == 3) {
        while (input.isCont() && Recon.isSpace(input.head())) {
          input = input.step();
        }
        if (input.isCont()) {
          step = 1;
          continue;
        } else if (input.isDone()) {
          return done(builder.bind());
        }
      }
      if (step == 4) {
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          if (builder == null) {
            builder = recon.valueBuilder();
          }
          builder.add(recon.item(valueParser.bind()));
          valueParser = null;
          step = 6;
        } else if (valueParser.isError()) {
          return valueParser;
        }
      }
      if (step == 5) {
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          valueParser = null;
          step = 6;
        } else if (valueParser.isError()) {
          return valueParser;
        }
      }
      if (step == 6) {
        while (input.isCont() && Recon.isSpace(input.head())) {
          input = input.step();
        }
        if (input.isCont()) {
          if (input.head() == '@') {
            step = 1;
          } else {
            return done(builder.bind());
          }
        } else if (input.isDone()) {
          return done(builder.bind());
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new BlockItemParser<I, V>(recon, builder, fieldParser, valueParser, step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon) {
    return parse(input, recon, null, null, null, 1);
  }
}
