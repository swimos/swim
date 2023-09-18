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
import swim.codec.ParserException;
import swim.collections.FingerTrieSeq;
import swim.uri.Uri;
import swim.util.Builder;

final class HttpRequestParser<T> extends Parser<HttpRequest<T>> {

  final HttpParser http;
  final Parser<HttpMethod> methodParser;
  final StringBuilder uriBuilder;
  final Parser<HttpVersion> versionParser;
  final Parser<? extends HttpHeader> headerParser;
  final Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers;
  final int step;

  HttpRequestParser(HttpParser http, Parser<HttpMethod> methodParser, StringBuilder uriBuilder,
                    Parser<HttpVersion> versionParser, Parser<? extends HttpHeader> headerParser,
                    Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers, int step) {
    this.http = http;
    this.methodParser = methodParser;
    this.uriBuilder = uriBuilder;
    this.versionParser = versionParser;
    this.headerParser = headerParser;
    this.headers = headers;
    this.step = step;
  }

  HttpRequestParser(HttpParser http) {
    this(http, null, null, null, null, null, 1);
  }

  @Override
  public Parser<HttpRequest<T>> feed(Input input) {
    return HttpRequestParser.parse(input, this.http, this.methodParser, this.uriBuilder,
                                   this.versionParser, this.headerParser, this.headers, this.step);
  }

  static <T> Parser<HttpRequest<T>> parse(Input input, HttpParser http, Parser<HttpMethod> methodParser,
                                          StringBuilder uriBuilder, Parser<HttpVersion> versionParser,
                                          Parser<? extends HttpHeader> headerParser,
                                          Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers, int step) {
    int c = 0;
    if (step == 1) {
      if (methodParser == null) {
        if (input.isDone()) {
          return done();
        }
        methodParser = http.parseMethod(input);
      } else {
        methodParser = methodParser.feed(input);
      }
      if (methodParser.isDone()) {
        step = 2;
      } else if (methodParser.isError()) {
        return methodParser.asError();
      }
    }
    if (step == 2) {
      if (input.isCont() && input.head() == ' ') {
        input = input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("space", input));
      }
    }
    if (step == 3) {
      if (uriBuilder == null) {
        uriBuilder = new StringBuilder();
      }
      while (input.isCont()) {
        c = input.head();
        if (c != ' ') {
          input = input.step();
          uriBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        step = 4;
      }
    }
    if (step == 4) {
      if (input.isCont() && input.head() == ' ') {
        input = input.step();
        step = 5;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("space", input));
      }
    }
    if (step == 5) {
      if (versionParser == null) {
        versionParser = http.parseVersion(input);
      } else {
        versionParser = versionParser.feed(input);
      }
      if (versionParser.isDone()) {
        step = 6;
      } else if (versionParser.isError()) {
        return versionParser.asError();
      }
    }
    if (step == 6) {
      if (input.isCont() && input.head() == '\r') {
        input = input.step();
        step = 7;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("carriage return", input));
      }
    }
    if (step == 7) {
      if (input.isCont() && input.head() == '\n') {
        input = input.step();
        step = 8;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("line feed", input));
      }
    }
    do {
      if (step == 8) {
        if (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            step = 9;
          } else if (Http.isSpace(c)) {
            return Parser.error(Diagnostic.message("unsupported header line extension", input));
          } else if (c == '\r') {
            input = input.step();
            step = 12;
            break;
          } else {
            return Parser.error(Diagnostic.expected("HTTP header", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("HTTP header", input));
        }
      }
      if (step == 9) {
        if (headerParser == null) {
          headerParser = http.parseHeader(input);
        } else {
          headerParser = headerParser.feed(input);
        }
        if (headerParser.isDone()) {
          step = 10;
        } else if (headerParser.isError()) {
          return headerParser.asError();
        }
      }
      if (step == 10) {
        if (input.isCont() && input.head() == '\r') {
          input = input.step();
          step = 11;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("carriage return", input));
        }
      }
      if (step == 11) {
        if (input.isCont() && input.head() == '\n') {
          if (headers == null) {
            headers = FingerTrieSeq.builder();
          }
          headers.add(headerParser.bind());
          headerParser = null;
          input = input.step();
          step = 8;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("line feed", input));
        }
      }
      break;
    } while (true);
    if (step == 12) {
      if (input.isCont() && input.head() == '\n') {
        input = input.step();
        final Uri requestUri;
        try {
          requestUri = Uri.parse(uriBuilder.toString());
        } catch (ParserException cause) {
          return Parser.error(cause);
        }
        if (headers == null) {
          final HttpRequest<T> request = http.request(methodParser.bind(), requestUri,
                                                      versionParser.bind(),
                                                      FingerTrieSeq.<HttpHeader>empty());
          return Parser.done(request);
        } else {
          final HttpRequest<T> request = http.request(methodParser.bind(), requestUri,
                                                      versionParser.bind(), headers.bind());
          return Parser.done(request);
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("line feed", input));
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new HttpRequestParser<T>(http, methodParser, uriBuilder, versionParser,
                                    headerParser, headers, step);
  }

  static <T> Parser<HttpRequest<T>> parse(Input input, HttpParser http) {
    return HttpRequestParser.parse(input, http, null, null, null, null, null, 1);
  }

}
