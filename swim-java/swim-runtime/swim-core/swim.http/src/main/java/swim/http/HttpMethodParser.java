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

final class HttpMethodParser extends Parser<HttpMethod> {

  final HttpParser http;
  final StringBuilder nameBuilder;
  final int step;

  HttpMethodParser(HttpParser http, StringBuilder nameBuilder, int step) {
    this.http = http;
    this.nameBuilder = nameBuilder;
    this.step = step;
  }

  HttpMethodParser(HttpParser http) {
    this(http, null, 1);
  }

  @Override
  public Parser<HttpMethod> feed(Input input) {
    return HttpMethodParser.parse(input, this.http, this.nameBuilder, this.step);
  }

  static Parser<HttpMethod> parse(Input input, HttpParser http,
                                  StringBuilder nameBuilder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          nameBuilder = new StringBuilder();
          nameBuilder.appendCodePoint(c);
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("HTTP method", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("HTTP method", input));
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
      if (!input.isEmpty()) {
        return Parser.done(http.method(nameBuilder.toString()));
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new HttpMethodParser(http, nameBuilder, step);
  }

  static Parser<HttpMethod> parse(Input input, HttpParser http) {
    return HttpMethodParser.parse(input, http, null, 1);
  }

}
