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

final class SelectorParser<I, V> extends Parser<V> {
  final ReconParser<I, V> recon;
  final Builder<I, V> builder;
  final V selector;
  final Parser<V> valueParser;
  final int step;

  SelectorParser(ReconParser<I, V> recon, Builder<I, V> builder, V selector,
                 Parser<V> valueParser, int step) {
    this.recon = recon;
    this.builder = builder;
    this.selector = selector;
    this.valueParser = valueParser;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.recon, this.builder, this.selector, this.valueParser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder,
                                  V selector, Parser<V> valueParser, int step) {
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
      if (input.isCont() && c == '$') {
        input = input.step();
        if (selector == null) {
          selector = recon.selector();
        }
        step = 2;
      } else if (input.isDone()) {
        return error(Diagnostic.expected('$', input));
      }
    }
    if (step == 2) {
      if (input.isCont()) {
        c = input.head();
        if (c == '[') {
          input = input.step();
          step = 8;
        } else if (c == '@') {
          input = input.step();
          step = 7;
        } else if (c == ':') {
          input = input.step();
          step = 6;
        } else if (c == '*') {
          input = input.step();
          step = 5;
        } else if (c == '#') {
          input = input.step();
          step = 4;
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        return error(Diagnostic.unexpected(input));
      }
    }
    do {
      if (step == 3) {
        if (valueParser == null) {
          valueParser = recon.parseLiteral(input, recon.valueBuilder());
        }
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          selector = recon.get(selector, valueParser.bind());
          valueParser = null;
          step = 10;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      if (step == 4) {
        if (valueParser == null) {
          valueParser = recon.parseInteger(input);
        }
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          selector = recon.value(recon.getItem(selector, valueParser.bind()));
          valueParser = null;
          step = 10;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      if (step == 5) {
        if (input.isCont()) {
          c = input.head();
          if (c == ':') {
            input = input.step();
            selector = recon.keys(selector);
            step = 10;
          } else if (c == '*') {
            input = input.step();
            selector = recon.descendants(selector);
            step = 10;
          } else {
            selector = recon.children(selector);
            step = 10;
          }
        } else if (input.isDone()) {
          selector = recon.children(selector);
          step = 10;
        }
      }
      if (step == 6) {
        if (input.isCont()) {
          c = input.head();
          if (c == '*') {
            input = input.step();
            selector = recon.values(selector);
            step = 10;
          } else {
            return error(Diagnostic.expected('*', input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected('*', input));
        }
      }
      if (step == 7) {
        if (valueParser == null) {
          valueParser = recon.parseIdent(input);
        }
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          selector = recon.getAttr(selector, valueParser.bind());
          valueParser = null;
          step = 10;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      if (step == 8) {
        if (valueParser == null) {
          valueParser = recon.parseBlockExpression(input);
        }
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          step = 9;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      if (step == 9) {
        while (input.isCont()) {
          c = input.head();
          if (Recon.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == ']') {
            input = input.step();
            selector = recon.filter(selector, valueParser.bind());
            valueParser = null;
            step = 10;
          } else {
            return error(Diagnostic.expected(']', input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected(']', input));
        }
      }
      if (step == 10) {
        if (input.isCont()) {
          c = input.head();
          if (c == '[') {
            input = input.step();
            step = 8;
            continue;
          } else if (c == '#') {
            input = input.step();
            step = 4;
            continue;
          } else if (c == '.') {
            input = input.step();
            step = 11;
          } else if (builder != null) {
            builder.add(recon.item(selector));
            return done(builder.bind());
          } else {
            return done(selector);
          }
        } else if (input.isDone()) {
          if (builder != null) {
            builder.add(recon.item(selector));
            return done(builder.bind());
          } else {
            return done(selector);
          }
        }
      }
      if (step == 11) {
        if (input.isCont()) {
          c = input.head();
          if (c == '@') {
            input = input.step();
            step = 7;
            continue;
          } else if (c == ':') {
            input = input.step();
            step = 6;
            continue;
          } else if (c == '*') {
            input = input.step();
            step = 5;
            continue;
          } else {
            step = 3;
            continue;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new SelectorParser<I, V>(recon, builder, selector, valueParser, step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder) {
    return parse(input, recon, builder, null, null, 1);
  }
}
