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

package swim.http;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class WebSocketParamParser extends Parser<WebSocketParam> {
  final HttpParser http;
  final StringBuilder key;
  final StringBuilder value;
  final int step;

  WebSocketParamParser(HttpParser http, StringBuilder key, StringBuilder value, int step) {
    this.http = http;
    this.key = key;
    this.value = value;
    this.step = step;
  }

  WebSocketParamParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<WebSocketParam> feed(Input input) {
    return parse(input, this.http, this.key, this.value, this.step);
  }

  static Parser<WebSocketParam> parse(Input input, HttpParser http, StringBuilder key,
                                      StringBuilder value, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (key == null) {
            key = new StringBuilder();
          }
          key.appendCodePoint(c);
          step = 2;
        } else {
          return error(Diagnostic.expected("param name", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("param name", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          key.appendCodePoint(c);
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
        return done(http.webSocketParam(key.toString(), ""));
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
        if (value == null) {
          value = new StringBuilder();
        }
        if (c == '"') {
          input = input.step();
          step = 7;
        } else {
          step = 5;
        }
      } else if (input.isDone()) {
        return error(Diagnostic.unexpected(input));
      }
    }
    if (step == 5) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          value.appendCodePoint(c);
          step = 6;
        } else {
          return error(Diagnostic.expected("param value", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("param value", input));
      }
    }
    if (step == 6) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          value.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        return done(http.webSocketParam(key.toString(), value.toString()));
      }
    }
    do {
      if (step == 7) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isQuotedChar(c)) {
            input = input.step();
            value.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '"') {
            input = input.step();
            return done(http.webSocketParam(key.toString(), value.toString()));
          } else if (c == '\\') {
            input = input.step();
            step = 8;
          } else {
            return error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 8) {
        if (input.isCont()) {
          c = input.head();
          if (Http.isEscapeChar(c)) {
            input = input.step();
            value.appendCodePoint(c);
            step = 7;
            continue;
          } else {
            return error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("escape character", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new WebSocketParamParser(http, key, value, step);
  }

  static Parser<WebSocketParam> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, 1);
  }
}
