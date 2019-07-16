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

final class HttpChunkTrailerParser extends Parser<HttpChunkTrailer> {
  final HttpParser http;
  final Parser<? extends HttpHeader> header;
  final Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers;
  final int step;

  HttpChunkTrailerParser(HttpParser http, Parser<? extends HttpHeader> header,
                         Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers, int step) {
    this.http = http;
    this.header = header;
    this.headers = headers;
    this.step = step;
  }

  HttpChunkTrailerParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<HttpChunkTrailer> feed(Input input) {
    return parse(input, this.http, this.header, this.headers, this.step);
  }

  static Parser<HttpChunkTrailer> parse(Input input, HttpParser http, Parser<? extends HttpHeader> header,
                                        Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers, int step) {
    int c = 0;
    do {
      if (step == 1) {
        if (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            step = 2;
          } else if (Http.isSpace(c)) {
            return error(Diagnostic.message("unsupported header line extension", input));
          } else if (c == '\r') {
            input = input.step();
            step = 5;
          } else {
            return error(Diagnostic.expected("chunk trailer", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("chunk trailer", input));
        }
      }
      if (step == 2) {
        if (header == null) {
          header = http.parseHeader(input);
        } else {
          header = header.feed(input);
        }
        if (header.isDone()) {
          step = 3;
        } else if (header.isError()) {
          return header.asError();
        }
      }
      if (step == 3) {
        if (input.isCont()) {
          c = input.head();
          if (c == '\r') {
            input = input.step();
            step = 4;
          } else {
            return error(Diagnostic.expected("carriage return", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("carriage return", input));
        }
      }
      if (step == 4) {
        if (input.isCont()) {
          c = input.head();
          if (c == '\n') {
            input = input.step();
            if (headers == null) {
              headers = FingerTrieSeq.builder();
            }
            headers.add(header.bind());
            header = null;
            step = 1;
            continue;
          } else {
            return error(Diagnostic.expected("line feed", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("line feed", input));
        }
      }
      break;
    } while (true);
    if (step == 5) {
      if (input.isCont()) {
        c = input.head();
        if (c == '\n') {
          input = input.step();
          if (headers == null) {
            return done(http.chunkTrailer(FingerTrieSeq.<HttpHeader>empty()));
          } else {
            return done(http.chunkTrailer(headers.bind()));
          }
        } else {
          return error(Diagnostic.expected("line feed", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("line feed", input));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new HttpChunkTrailerParser(http, header, headers, step);
  }

  static Parser<HttpChunkTrailer> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, 1);
  }
}
