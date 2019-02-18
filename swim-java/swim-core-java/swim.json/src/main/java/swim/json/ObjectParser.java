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

package swim.json;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.util.Builder;

final class ObjectParser<I, V> extends Parser<V> {
  final JsonParser<I, V> json;
  final Builder<I, V> builder;
  final Parser<V> keyParser;
  final Parser<V> valueParser;
  final int step;

  ObjectParser(JsonParser<I, V> json, Builder<I, V> builder, Parser<V> keyParser,
               Parser<V> valueParser, int step) {
    this.json = json;
    this.builder = builder;
    this.keyParser = keyParser;
    this.valueParser = valueParser;
    this.step = step;
  }

  ObjectParser(JsonParser<I, V> json) {
    this(json, null, null, null, 1);
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.json, this.builder, this.keyParser, this.valueParser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, JsonParser<I, V> json, Builder<I, V> builder,
                                Parser<V> keyParser, Parser<V> valueParser, int step) {
    int c = 0;
    if (step == 1) {
      while (input.isCont()) {
        c = input.head();
        if (Json.isWhitespace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == '{') {
          input = input.step();
          step = 2;
        } else {
          return error(Diagnostic.expected('{', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected('{', input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Json.isWhitespace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (builder == null) {
          builder = json.objectBuilder();
        }
        if (c == '}') {
          input = input.step();
          return done(builder.bind());
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected('}', input));
      }
    }
    while (step >= 3 && !input.isEmpty()) {
      if (step == 3) {
        if (keyParser == null) {
          keyParser = json.parseString(input);
        }
        while (keyParser.isCont() && !input.isEmpty()) {
          keyParser = keyParser.feed(input);
        }
        if (keyParser.isDone()) {
          step = 4;
        } else if (keyParser.isError()) {
          return keyParser;
        } else {
          break;
        }
      }
      if (step == 4) {
        while (input.isCont()) {
          c = input.head();
          if (Json.isWhitespace(c)) {
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
        } else {
          break;
        }
      }
      if (step == 5) {
        while (input.isCont() && Json.isWhitespace(input.head())) {
          input = input.step();
        }
        if (input.isCont()) {
          step = 6;
        } else if (input.isDone()) {
          return error(Diagnostic.expected("value", input));
        } else {
          break;
        }
      }
      if (step == 6) {
        if (valueParser == null) {
          valueParser = json.parseValue(input);
        }
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          builder.add(json.field(keyParser.bind(), valueParser.bind()));
          keyParser = null;
          valueParser = null;
          step = 7;
        } else if (valueParser.isError()) {
          return valueParser;
        } else {
          break;
        }
      }
      if (step == 7) {
        while (input.isCont()) {
          c = input.head();
          if (Json.isWhitespace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == ',') {
            input = input.step();
            step = 3;
          } else if (c == '}') {
            input = input.step();
            return done(builder.bind());
          } else {
            return error(Diagnostic.expected("',' or '}'", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected('}', input));
        } else {
          break;
        }
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new ObjectParser<I, V>(json, builder, keyParser, valueParser, step);
  }

  static <I, V> Parser<V> parse(Input input, JsonParser<I, V> json) {
    return parse(input, json, null, null, null, 1);
  }
}
