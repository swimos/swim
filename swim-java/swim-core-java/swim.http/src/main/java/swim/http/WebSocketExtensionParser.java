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
import swim.collections.FingerTrieSeq;
import swim.util.Builder;

final class WebSocketExtensionParser extends Parser<WebSocketExtension> {
  final HttpParser http;
  final StringBuilder name;
  final Parser<WebSocketParam> param;
  final Builder<WebSocketParam, FingerTrieSeq<WebSocketParam>> params;
  final int step;

  WebSocketExtensionParser(HttpParser http, StringBuilder name, Parser<WebSocketParam> param,
                           Builder<WebSocketParam, FingerTrieSeq<WebSocketParam>> params, int step) {
    this.http = http;
    this.name = name;
    this.param = param;
    this.params = params;
    this.step = step;
  }

  WebSocketExtensionParser(HttpParser http) {
    this(http, null, null, null, 1);
  }

  @Override
  public Parser<WebSocketExtension> feed(Input input) {
    return parse(input, this.http, this.name, this.param, this.params, this.step);
  }

  static Parser<WebSocketExtension> parse(Input input, HttpParser http, StringBuilder name, Parser<WebSocketParam> param,
                                          Builder<WebSocketParam, FingerTrieSeq<WebSocketParam>> params, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (name == null) {
            name = new StringBuilder();
          }
          name.appendCodePoint(c);
          step = 2;
        } else {
          return error(Diagnostic.expected("websocket extension", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("websocket extension", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          name.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        step = 3;
      }
    }
    do {
      if (step == 3) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && c == ';') {
          if (params == null) {
            params = FingerTrieSeq.builder();
          }
          input = input.step();
          step = 4;
        } else if (!input.isEmpty()) {
          return done(http.webSocketExtension(name.toString(), params != null ? params.bind() : FingerTrieSeq.<WebSocketParam>empty()));
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
        if (!input.isEmpty()) {
          step = 5;
        }
      }
      if (step == 5) {
        if (param == null) {
          param = http.parseWebSocketParam(input);
        } else {
          param = param.feed(input);
        }
        if (param.isDone()) {
          params.add(param.bind());
          param = null;
          step = 3;
          continue;
        } else if (param.isError()) {
          return param.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new WebSocketExtensionParser(http, name, param, params, step);
  }

  static Parser<WebSocketExtension> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, null, 1);
  }
}
