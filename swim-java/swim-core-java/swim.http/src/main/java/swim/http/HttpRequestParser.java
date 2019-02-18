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
import swim.codec.ParserException;
import swim.collections.FingerTrieSeq;
import swim.uri.Uri;
import swim.util.Builder;

final class HttpRequestParser<T> extends Parser<HttpRequest<T>> {
  final HttpParser http;
  final Parser<HttpMethod> method;
  final StringBuilder uri;
  final Parser<HttpVersion> version;
  final Parser<? extends HttpHeader> header;
  final Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers;
  final int step;

  HttpRequestParser(HttpParser http, Parser<HttpMethod> method, StringBuilder uri,
                    Parser<HttpVersion> version, Parser<? extends HttpHeader> header,
                    Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers, int step) {
    this.http = http;
    this.method = method;
    this.uri = uri;
    this.version = version;
    this.header = header;
    this.headers = headers;
    this.step = step;
  }

  HttpRequestParser(HttpParser http) {
    this(http, null, null, null, null, null, 1);
  }

  @Override
  public Parser<HttpRequest<T>> feed(Input input) {
    return parse(input, this.http, this.method, this.uri, this.version,
                 this.header, this.headers, this.step);
  }

  static <T> Parser<HttpRequest<T>> parse(Input input, HttpParser http, Parser<HttpMethod> method,
                                          StringBuilder uri, Parser<HttpVersion> version,
                                          Parser<? extends HttpHeader> header,
                                          Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers, int step) {
    int c = 0;
    if (step == 1) {
      if (method == null) {
        if (input.isDone()) {
          return done();
        }
        method = http.parseMethod(input);
      } else {
        method = method.feed(input);
      }
      if (method.isDone()) {
        step = 2;
      } else if (method.isError()) {
        return method.asError();
      }
    }
    if (step == 2) {
      if (input.isCont() && input.head() == ' ') {
        input = input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected("space", input));
      }
    }
    if (step == 3) {
      if (uri == null) {
        uri = new StringBuilder();
      }
      while (input.isCont()) {
        c = input.head();
        if (c != ' ') {
          input = input.step();
          uri.appendCodePoint(c);
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
        return error(Diagnostic.expected("space", input));
      }
    }
    if (step == 5) {
      if (version == null) {
        version = http.parseVersion(input);
      } else {
        version = version.feed(input);
      }
      if (version.isDone()) {
        step = 6;
      } else if (version.isError()) {
        return version.asError();
      }
    }
    if (step == 6) {
      if (input.isCont() && input.head() == '\r') {
        input = input.step();
        step = 7;
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected("carriage return", input));
      }
    }
    if (step == 7) {
      if (input.isCont() && input.head() == '\n') {
        input = input.step();
        step = 8;
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected("line feed", input));
      }
    }
    do {
      if (step == 8) {
        if (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            step = 9;
          } else if (Http.isSpace(c)) {
            return error(Diagnostic.message("unsupported header line extension", input));
          } else if (c == '\r') {
            input = input.step();
            step = 12;
            break;
          } else {
            return error(Diagnostic.expected("HTTP header", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("HTTP header", input));
        }
      }
      if (step == 9) {
        if (header == null) {
          header = http.parseHeader(input);
        } else {
          header = header.feed(input);
        }
        if (header.isDone()) {
          step = 10;
        } else if (header.isError()) {
          return header.asError();
        }
      }
      if (step == 10) {
        if (input.isCont() && input.head() == '\r') {
          input = input.step();
          step = 11;
        } else if (!input.isEmpty()) {
          return error(Diagnostic.expected("carriage return", input));
        }
      }
      if (step == 11) {
        if (input.isCont() && input.head() == '\n') {
          if (headers == null) {
            headers = FingerTrieSeq.builder();
          }
          headers.add(header.bind());
          header = null;
          input = input.step();
          step = 8;
          continue;
        } else if (!input.isEmpty()) {
          return error(Diagnostic.expected("line feed", input));
        }
      }
      break;
    } while (true);
    if (step == 12) {
      if (input.isCont() && input.head() == '\n') {
        input = input.step();
        final Uri requestUri;
        try {
          requestUri = Uri.parse(uri.toString());
        } catch (ParserException cause) {
          return error(cause);
        }
        if (headers == null) {
          final HttpRequest<T> request = http.request(method.bind(), requestUri, version.bind(),
              FingerTrieSeq.<HttpHeader>empty());
          return done(request);
        } else {
          final HttpRequest<T> request = http.request(method.bind(), requestUri, version.bind(), headers.bind());
          return done(request);
        }
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected("line feed", input));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new HttpRequestParser<T>(http, method, uri, version, header, headers, step);
  }

  static <T> Parser<HttpRequest<T>> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, null, null, null, 1);
  }
}
