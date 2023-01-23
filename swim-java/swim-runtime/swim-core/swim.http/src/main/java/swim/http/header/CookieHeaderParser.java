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

package swim.http.header;

import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.HashTrieMap;
import swim.http.Cookie;
import swim.http.Http;
import swim.http.HttpParser;

public class CookieHeaderParser extends Parser<CookieHeader> {

  final HttpParser http;
  final Parser<Cookie> cookiesParser;
  final HashTrieMap<String, Cookie> cookies;
  final int step;

  CookieHeaderParser(HttpParser http, Parser<Cookie> cookiesParser,
                     HashTrieMap<String, Cookie> cookies, int step) {
    this.http = http;
    this.cookiesParser = cookiesParser;
    this.cookies = cookies;
    this.step = step;
  }

  CookieHeaderParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<CookieHeader> feed(Input input) {
    return CookieHeaderParser.parse(input, this.http, this.cookiesParser, this.cookies, this.step);
  }

  static Parser<CookieHeader> parse(Input input, HttpParser http, Parser<Cookie> cookieParser,
                                    HashTrieMap<String, Cookie> cookies, int step) {


    int c = 0;
    if (step == 1) {
      if (cookieParser == null) {
        cookieParser = http.parseCookie(input);
      } else {
        cookieParser = cookieParser.feed(input);
      }
      if (cookieParser.isDone()) {
        if (cookies == null) {
          cookies = HashTrieMap.empty();
        }
        final Cookie cookie = cookieParser.bind();
        cookies = cookies.updated(cookie.getName(), cookie);
        cookieParser = null;
        step = 2;
      } else if (cookieParser.isError()) {
        return cookieParser.asError();
      }
    }
    do {
      if (step == 2) {
        if (input.isCont()) {
          c = input.head();
          if (c == ';') {
            input = input.step();
          }
        }
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && Http.isVisibleChar(c)) {
          step = 3;
        } else if (!input.isEmpty()) {
          return Parser.done(CookieHeader.create(cookies));
        }
      }
      if (step == 3) {
        if (cookieParser == null) {
          cookieParser = http.parseCookie(input);
        } else {
          cookieParser = cookieParser.feed(input);
        }
        if (cookieParser.isDone()) {
          final Cookie cookie = cookieParser.bind();
          cookies = cookies.updated(cookie.getName(), cookie);
          cookieParser = null;
          step = 2;
          continue;
        } else if (cookieParser.isError()) {
          return cookieParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new CookieHeaderParser(http, cookieParser, cookies, step);
  }

  static Parser<CookieHeader> parse(Input input, HttpParser http) {
    return CookieHeaderParser.parse(input, http, null, null, 1);
  }

}
