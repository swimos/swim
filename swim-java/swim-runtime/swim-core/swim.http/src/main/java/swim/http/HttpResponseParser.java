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
import swim.collections.FingerTrieSeq;
import swim.util.Builder;

final class HttpResponseParser<T> extends Parser<HttpResponse<T>> {

  final HttpParser http;
  final Parser<HttpVersion> versionParser;
  final Parser<HttpStatus> statusParser;
  final Parser<? extends HttpHeader> headerParser;
  final Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers;
  final int step;

  HttpResponseParser(HttpParser http, Parser<HttpVersion> versionParser,
                     Parser<HttpStatus> statusParser, Parser<? extends HttpHeader> headerParser,
                     Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers, int step) {
    this.http = http;
    this.versionParser = versionParser;
    this.statusParser = statusParser;
    this.headerParser = headerParser;
    this.headers = headers;
    this.step = step;
  }

  HttpResponseParser(HttpParser http) {
    this(http, null, null, null, null, 1);
  }

  @Override
  public Parser<HttpResponse<T>> feed(Input input) {
    return HttpResponseParser.parse(input, this.http, this.versionParser, this.statusParser,
                                    this.headerParser, this.headers, this.step);
  }

  static <T> Parser<HttpResponse<T>> parse(Input input, HttpParser http, Parser<HttpVersion> versionParser,
                                           Parser<HttpStatus> statusParser, Parser<? extends HttpHeader> headerParser,
                                           Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers, int step) {
    int c = 0;
    if (step == 1) {
      if (versionParser == null) {
        if (input.isDone()) {
          return Parser.done();
        }
        versionParser = http.parseVersion(input);
      } else {
        versionParser = versionParser.feed(input);
      }
      if (versionParser.isDone()) {
        step = 2;
      } else if (versionParser.isError()) {
        return versionParser.asError();
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
      if (statusParser == null) {
        statusParser = http.parseStatus(input);
      } else {
        statusParser = statusParser.feed(input);
      }
      if (statusParser.isDone()) {
        step = 4;
      } else if (statusParser.isError()) {
        return statusParser.asError();
      }
    }
    if (step == 4) {
      if (input.isCont() && input.head() == '\r') {
        input = input.step();
        step = 5;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("carriage return", input));
      }
    }
    if (step == 5) {
      if (input.isCont() && input.head() == '\n') {
        input = input.step();
        step = 6;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("line feed", input));
      }
    }
    do {
      if (step == 6) {
        if (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            step = 7;
          } else if (Http.isSpace(c)) {
            return Parser.error(Diagnostic.message("unsupported header line extension", input));
          } else if (c == '\r') {
            input = input.step();
            step = 10;
          } else {
            return Parser.error(Diagnostic.expected("HTTP header", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("HTTP header", input));
        }
      }
      if (step == 7) {
        if (headerParser == null) {
          headerParser = http.parseHeader(input);
        } else {
          headerParser = headerParser.feed(input);
        }
        if (headerParser.isDone()) {
          step = 8;
        } else if (headerParser.isError()) {
          return headerParser.asError();
        }
      }
      if (step == 8) {
        if (input.isCont() && input.head() == '\r') {
          input = input.step();
          step = 9;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("carriage return", input));
        }
      }
      if (step == 9) {
        if (input.isCont() && input.head() == '\n') {
          if (headers == null) {
            headers = FingerTrieSeq.builder();
          }
          headers.add(headerParser.bind());
          headerParser = null;
          input = input.step();
          step = 6;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("line feed", input));
        }
      }
      break;
    } while (true);
    if (step == 10) {
      if (input.isCont() && input.head() == '\n') {
        input = input.step();
        if (headers == null) {
          final HttpResponse<T> response = http.response(versionParser.bind(), statusParser.bind(),
                                                         FingerTrieSeq.<HttpHeader>empty());
          return Parser.done(response);
        } else {
          final HttpResponse<T> response = http.response(versionParser.bind(), statusParser.bind(), headers.bind());
          return Parser.done(response);
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("line feed", input));
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new HttpResponseParser<T>(http, versionParser, statusParser, headerParser, headers, step);
  }

  static <T> Parser<HttpResponse<T>> parse(Input input, HttpParser http) {
    return HttpResponseParser.parse(input, http, null, null, null, null, 1);
  }

}
