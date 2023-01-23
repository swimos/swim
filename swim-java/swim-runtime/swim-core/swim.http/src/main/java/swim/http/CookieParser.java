// Copyright 2015-2023 Swim.inc
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

final class CookieParser extends Parser<Cookie> {

  final HttpParser http;
  final StringBuilder nameBuilder;
  final StringBuilder valueBuilder;
  final int step;

  CookieParser(HttpParser http, StringBuilder nameBuilder,
               StringBuilder valueBuilder, int step) {
    this.http = http;
    this.nameBuilder = nameBuilder;
    this.valueBuilder = valueBuilder;
    this.step = step;
  }

  CookieParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<Cookie> feed(Input input) {
    return CookieParser.parse(input, this.http, this.nameBuilder,
         this.valueBuilder, this.step);
  }

  static Parser<Cookie> parse(Input input, HttpParser http, StringBuilder nameBuilder,
                              StringBuilder valueBuilder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isVisibleChar(c) && c != '=' && c != ';') {
          input = input.step();
          if (nameBuilder == null) {
            nameBuilder = new StringBuilder();
          }
          nameBuilder.appendCodePoint(c);
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("cookie name", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("cookie name", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isVisibleChar(c) && c != '=' && c != ';') {
          input = input.step();
          nameBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        step = 3;
      } else if (input.isDone() || !Http.isVisibleChar(c)) {
        return Parser.done(http.cookie(nameBuilder.toString(), ""));
      }
    }
    if (step == 3) {
      if (input.isCont() && c == '=') {
        input = input.step();
        valueBuilder = new StringBuilder();
        step = 4;
      } else if (!input.isEmpty() || !Http.isVisibleChar(c)) {
        return Parser.done(http.cookie(nameBuilder.toString(), ""));
      }
    }
    if (step == 4) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isVisibleChar(c) && c != '=' && c != ';') {
          input = input.step();
          valueBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }

      if (input.isDone() || c == ';' || !Http.isVisibleChar(c)) {
        return Parser.done(http.cookie(nameBuilder.toString(), valueBuilder.toString()));
      }
    }

    return new CookieParser(http, nameBuilder, valueBuilder, step);
  }

  static Parser<Cookie> parse(Input input, HttpParser http) {
    return CookieParser.parse(input, http, null, null, 1);
  }

}
