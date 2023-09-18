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

package swim.http;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class WebSocketParamParser extends Parser<WebSocketParam> {

  final HttpParser http;
  final StringBuilder keyBuilder;
  final StringBuilder valueBuilder;
  final int step;

  WebSocketParamParser(HttpParser http, StringBuilder keyBuilder,
                       StringBuilder valueBuilder, int step) {
    this.http = http;
    this.keyBuilder = keyBuilder;
    this.valueBuilder = valueBuilder;
    this.step = step;
  }

  WebSocketParamParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<WebSocketParam> feed(Input input) {
    return WebSocketParamParser.parse(input, this.http, this.keyBuilder,
                                      this.valueBuilder, this.step);
  }

  static Parser<WebSocketParam> parse(Input input, HttpParser http, StringBuilder keyBuilder,
                                      StringBuilder valueBuilder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (keyBuilder == null) {
            keyBuilder = new StringBuilder();
          }
          keyBuilder.appendCodePoint(c);
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("param name", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("param name", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          keyBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        step = 3;
      }
    }
    if (step == 3) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isSpace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont() && c == '=') {
        input = input.step();
        step = 4;
      } else if (!input.isEmpty()) {
        return Parser.done(http.webSocketParam(keyBuilder.toString(), ""));
      }
    }
    if (step == 4) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isSpace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (valueBuilder == null) {
          valueBuilder = new StringBuilder();
        }
        if (c == '"') {
          input = input.step();
          step = 7;
        } else {
          step = 5;
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step == 5) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          valueBuilder.appendCodePoint(c);
          step = 6;
        } else {
          return Parser.error(Diagnostic.expected("param value", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("param value", input));
      }
    }
    if (step == 6) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          valueBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        return Parser.done(http.webSocketParam(keyBuilder.toString(), valueBuilder.toString()));
      }
    }
    do {
      if (step == 7) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isQuotedChar(c)) {
            input = input.step();
            valueBuilder.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '"') {
            input = input.step();
            return done(http.webSocketParam(keyBuilder.toString(), valueBuilder.toString()));
          } else if (c == '\\') {
            input = input.step();
            step = 8;
          } else {
            return Parser.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 8) {
        if (input.isCont()) {
          c = input.head();
          if (Http.isEscapeChar(c)) {
            input = input.step();
            valueBuilder.appendCodePoint(c);
            step = 7;
            continue;
          } else {
            return Parser.error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("escape character", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new WebSocketParamParser(http, keyBuilder, valueBuilder, step);
  }

  static Parser<WebSocketParam> parse(Input input, HttpParser http) {
    return WebSocketParamParser.parse(input, http, null, null, 1);
  }

}
