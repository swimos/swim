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

final class HttpResponseParser<T> extends Parser<HttpResponse<T>> {
  final HttpParser http;
  final Parser<HttpVersion> version;
  final Parser<HttpStatus> status;
  final Parser<? extends HttpHeader> header;
  final Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers;
  final int step;

  HttpResponseParser(HttpParser http, Parser<HttpVersion> version,
                     Parser<HttpStatus> status, Parser<? extends HttpHeader> header,
                     Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers, int step) {
    this.http = http;
    this.version = version;
    this.status = status;
    this.header = header;
    this.headers = headers;
    this.step = step;
  }

  HttpResponseParser(HttpParser http) {
    this(http, null, null, null, null, 1);
  }

  @Override
  public Parser<HttpResponse<T>> feed(Input input) {
    return parse(input, this.http, this.version, this.status, this.header, this.headers, this.step);
  }

  static <T> Parser<HttpResponse<T>> parse(Input input, HttpParser http, Parser<HttpVersion> version,
                                           Parser<HttpStatus> status, Parser<? extends HttpHeader> header,
                                           Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers, int step) {
    int c = 0;
    if (step == 1) {
      if (version == null) {
        if (input.isDone()) {
          return done();
        }
        version = http.parseVersion(input);
      } else {
        version = version.feed(input);
      }
      if (version.isDone()) {
        step = 2;
      } else if (version.isError()) {
        return version.asError();
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
      if (status == null) {
        status = http.parseStatus(input);
      } else {
        status = status.feed(input);
      }
      if (status.isDone()) {
        step = 4;
      } else if (status.isError()) {
        return status.asError();
      }
    }
    if (step == 4) {
      if (input.isCont() && input.head() == '\r') {
        input = input.step();
        step = 5;
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected("carriage return", input));
      }
    }
    if (step == 5) {
      if (input.isCont() && input.head() == '\n') {
        input = input.step();
        step = 6;
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected("line feed", input));
      }
    }
    do {
      if (step == 6) {
        if (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            step = 7;
          } else if (Http.isSpace(c)) {
            return error(Diagnostic.message("unsupported header line extension", input));
          } else if (c == '\r') {
            input = input.step();
            step = 10;
          } else {
            return error(Diagnostic.expected("HTTP header", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("HTTP header", input));
        }
      }
      if (step == 7) {
        if (header == null) {
          header = http.parseHeader(input);
        } else {
          header = header.feed(input);
        }
        if (header.isDone()) {
          step = 8;
        } else if (header.isError()) {
          return header.asError();
        }
      }
      if (step == 8) {
        if (input.isCont() && input.head() == '\r') {
          input = input.step();
          step = 9;
        } else if (!input.isEmpty()) {
          return error(Diagnostic.expected("carriage return", input));
        }
      }
      if (step == 9) {
        if (input.isCont() && input.head() == '\n') {
          if (headers == null) {
            headers = FingerTrieSeq.builder();
          }
          headers.add(header.bind());
          header = null;
          input = input.step();
          step = 6;
          continue;
        } else if (!input.isEmpty()) {
          return error(Diagnostic.expected("line feed", input));
        }
      }
      break;
    } while (true);
    if (step == 10) {
      if (input.isCont() && input.head() == '\n') {
        input = input.step();
        if (headers == null) {
          final HttpResponse<T> response = http.response(version.bind(), status.bind(),
              FingerTrieSeq.<HttpHeader>empty());
          return done(response);
        } else {
          final HttpResponse<T> response = http.response(version.bind(), status.bind(), headers.bind());
          return done(response);
        }
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected("line feed", input));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new HttpResponseParser<T>(http, version, status, header, headers, step);
  }

  static <T> Parser<HttpResponse<T>> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, null, null, 1);
  }
}
