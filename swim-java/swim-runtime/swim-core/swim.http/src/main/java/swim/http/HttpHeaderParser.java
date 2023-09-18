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

final class HttpHeaderParser extends Parser<HttpHeader> {

  final HttpParser http;
  final StringBuilder nameBuilder;
  final Parser<? extends HttpHeader> valueParser;
  final int step;

  HttpHeaderParser(HttpParser http, StringBuilder nameBuilder,
                   Parser<? extends HttpHeader> valueParser, int step) {
    this.http = http;
    this.nameBuilder = nameBuilder;
    this.valueParser = valueParser;
    this.step = step;
  }

  HttpHeaderParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<HttpHeader> feed(Input input) {
    return HttpHeaderParser.parse(input, this.http, this.nameBuilder,
                                  this.valueParser, this.step);
  }

  @SuppressWarnings("unchecked")
  static Parser<HttpHeader> parse(Input input, HttpParser http, StringBuilder nameBuilder,
                                  Parser<? extends HttpHeader> valueParser, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (nameBuilder == null) {
            nameBuilder = new StringBuilder();
          }
          nameBuilder.appendCodePoint(c);
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("HTTP header name", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("HTTP header name", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          nameBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isCont()) {
        step = 3;
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step == 3) {
      if (input.isCont() && input.head() == ':') {
        input = input.step();
        step = 4;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(':', input));
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
      if (valueParser == null) {
        valueParser = http.parseHeaderValue(input, nameBuilder.toString());
      } else {
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
        if (Http.isSpace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        return (Parser<HttpHeader>) valueParser;
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new HttpHeaderParser(http, nameBuilder, valueParser, step);
  }

  static Parser<HttpHeader> parse(Input input, HttpParser http) {
    return HttpHeaderParser.parse(input, http, null, null, 1);
  }

}
