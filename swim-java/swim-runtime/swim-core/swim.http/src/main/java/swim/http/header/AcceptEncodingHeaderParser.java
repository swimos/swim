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

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.FingerTrieSeq;
import swim.http.ContentCoding;
import swim.http.Http;
import swim.http.HttpParser;
import swim.util.Builder;

final class AcceptEncodingHeaderParser extends Parser<AcceptEncodingHeader> {

  final HttpParser http;
  final Parser<ContentCoding> codingParser;
  final Builder<ContentCoding, FingerTrieSeq<ContentCoding>> codings;
  final int step;

  AcceptEncodingHeaderParser(HttpParser http, Parser<ContentCoding> codingParser,
                             Builder<ContentCoding, FingerTrieSeq<ContentCoding>> codings, int step) {
    this.http = http;
    this.codingParser = codingParser;
    this.codings = codings;
    this.step = step;
  }

  AcceptEncodingHeaderParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<AcceptEncodingHeader> feed(Input input) {
    return AcceptEncodingHeaderParser.parse(input, this.http, this.codingParser, this.codings, this.step);
  }

  static Parser<AcceptEncodingHeader> parse(Input input, HttpParser http, Parser<ContentCoding> codingParser,
                                            Builder<ContentCoding, FingerTrieSeq<ContentCoding>> codings, int step) {
    int c = 0;
    if (step == 1) {
      if (codingParser == null) {
        codingParser = http.parseContentCoding(input);
      } else {
        codingParser = codingParser.feed(input);
      }
      if (codingParser.isDone()) {
        if (codings == null) {
          codings = FingerTrieSeq.builder();
        }
        codings.add(codingParser.bind());
        codingParser = null;
        step = 2;
      } else if (codingParser.isError()) {
        return codingParser.asError();
      }
    }
    do {
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && c == ',') {
          input = input.step();
          step = 3;
        } else if (!input.isEmpty()) {
          return Parser.done(AcceptEncodingHeader.create(codings.bind()));
        }
      }
      if (step == 3) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          step = 4;
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 4) {
        if (codingParser == null) {
          codingParser = http.parseContentCoding(input);
        } else {
          codingParser = codingParser.feed(input);
        }
        if (codingParser.isDone()) {
          codings.add(codingParser.bind());
          codingParser = null;
          step = 2;
          continue;
        } else if (codingParser.isError()) {
          return codingParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new AcceptEncodingHeaderParser(http, codingParser, codings, step);
  }

  static Parser<AcceptEncodingHeader> parse(Input input, HttpParser http) {
    return AcceptEncodingHeaderParser.parse(input, http, null, null, 1);
  }

}
