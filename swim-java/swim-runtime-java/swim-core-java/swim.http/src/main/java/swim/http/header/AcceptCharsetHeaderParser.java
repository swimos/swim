// Copyright 2015-2021 Swim Inc.
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
import swim.http.Http;
import swim.http.HttpCharset;
import swim.http.HttpParser;
import swim.util.Builder;

final class AcceptCharsetHeaderParser extends Parser<AcceptCharsetHeader> {

  final HttpParser http;
  final Parser<HttpCharset> charsetParser;
  final Builder<HttpCharset, FingerTrieSeq<HttpCharset>> charsets;
  final int step;

  AcceptCharsetHeaderParser(HttpParser http, Parser<HttpCharset> charsetParser,
                            Builder<HttpCharset, FingerTrieSeq<HttpCharset>> charsets, int step) {
    this.http = http;
    this.charsetParser = charsetParser;
    this.charsets = charsets;
    this.step = step;
  }

  AcceptCharsetHeaderParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<AcceptCharsetHeader> feed(Input input) {
    return AcceptCharsetHeaderParser.parse(input, this.http, this.charsetParser, this.charsets, this.step);
  }

  static Parser<AcceptCharsetHeader> parse(Input input, HttpParser http, Parser<HttpCharset> charsetParser,
                                           Builder<HttpCharset, FingerTrieSeq<HttpCharset>> charsets, int step) {
    int c = 0;
    if (step == 1) {
      if (charsetParser == null) {
        charsetParser = http.parseCharset(input);
      } else {
        charsetParser = charsetParser.feed(input);
      }
      if (charsetParser.isDone()) {
        if (charsets == null) {
          charsets = FingerTrieSeq.builder();
        }
        charsets.add(charsetParser.bind());
        charsetParser = null;
        step = 2;
      } else if (charsetParser.isError()) {
        return charsetParser.asError();
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
          return Parser.done(AcceptCharsetHeader.create(charsets.bind()));
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
        if (charsetParser == null) {
          charsetParser = http.parseCharset(input);
        } else {
          charsetParser = charsetParser.feed(input);
        }
        if (charsetParser.isDone()) {
          charsets.add(charsetParser.bind());
          charsetParser = null;
          step = 2;
          continue;
        } else if (charsetParser.isError()) {
          return charsetParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new AcceptCharsetHeaderParser(http, charsetParser, charsets, step);
  }

  static Parser<AcceptCharsetHeader> parse(Input input, HttpParser http) {
    return AcceptCharsetHeaderParser.parse(input, http, null, null, 1);
  }

}
