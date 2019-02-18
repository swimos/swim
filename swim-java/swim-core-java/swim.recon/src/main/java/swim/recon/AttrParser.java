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

final class AttrParser<I, V> extends Parser<I> {
  final ReconParser<I, V> recon;
  final Parser<V> keyParser;
  final Parser<V> valueParser;
  final int step;

  AttrParser(ReconParser<I, V> recon, Parser<V> keyParser, Parser<V> valueParser, int step) {
    this.recon = recon;
    this.keyParser = keyParser;
    this.valueParser = valueParser;
    this.step = step;
  }

  @Override
  public Parser<I> feed(Input input) {
    return parse(input, this.recon, this.keyParser, this.valueParser, this.step);
  }

  static <I, V> Parser<I> parse(Input input, ReconParser<I, V> recon, Parser<V> keyParser,
                                Parser<V> valueParser, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (c == '@') {
          input = input.step();
          step = 2;
        } else {
          return error(Diagnostic.expected('@', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected('@', input));
      }
    }
    if (step == 2) {
      if (keyParser == null) {
        if (input.isCont()) {
          c = input.head();
          if (c == '"' || c == '\'') {
            keyParser = recon.parseString(input);
          } else if (Recon.isIdentStartChar(c)) {
            keyParser = recon.parseIdent(input);
          } else {
            return error(Diagnostic.expected("attribute name", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("attribute name", input));
        }
      } else {
        keyParser = keyParser.feed(input);
      }
      if (keyParser != null) {
        if (keyParser.isDone()) {
          step = 3;
        } else if (keyParser.isError()) {
          return keyParser.asError();
        }
      }
    }
    if (step == 3) {
      if (input.isCont() && input.head() == '(') {
        input = input.step();
        step = 4;
      } else if (!input.isEmpty()) {
        return done(recon.attr(keyParser.bind()));
      }
    }
    if (step == 4) {
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
          return done(recon.attr(keyParser.bind()));
        } else {
          step = 5;
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected(')', input));
      }
    }
    if (step == 5) {
      if (valueParser == null) {
        valueParser = recon.parseBlock(input);
      }
      while (valueParser.isCont() && !input.isEmpty()) {
        valueParser = valueParser.feed(input);
      }
      if (valueParser.isDone()) {
        step = 6;
      } else if (valueParser.isError()) {
        return valueParser.asError();
      }
    }
    if (step == 6) {
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
          return done(recon.attr(keyParser.bind(), valueParser.bind()));
        } else {
          return error(Diagnostic.expected(')', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected(')', input));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new AttrParser<I, V>(recon, keyParser, valueParser, step);
  }

  static <I, V> Parser<I> parse(Input input, ReconParser<I, V> recon) {
    return parse(input, recon, null, null, 1);
  }
}
