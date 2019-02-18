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

package swim.http.header;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.FingerTrieSeq;
import swim.http.Http;
import swim.http.HttpCharset;
import swim.http.HttpParser;
import swim.util.Builder;

final class AcceptCharsetParser extends Parser<AcceptCharset> {
  final HttpParser http;
  final Parser<HttpCharset> charset;
  final Builder<HttpCharset, FingerTrieSeq<HttpCharset>> charsets;
  final int step;

  AcceptCharsetParser(HttpParser http, Parser<HttpCharset> charset,
                      Builder<HttpCharset, FingerTrieSeq<HttpCharset>> charsets, int step) {
    this.http = http;
    this.charset = charset;
    this.charsets = charsets;
    this.step = step;
  }

  AcceptCharsetParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<AcceptCharset> feed(Input input) {
    return parse(input, this.http, this.charset, this.charsets, this.step);
  }

  static Parser<AcceptCharset> parse(Input input, HttpParser http, Parser<HttpCharset> charset,
                                     Builder<HttpCharset, FingerTrieSeq<HttpCharset>> charsets, int step) {
    int c = 0;
    if (step == 1) {
      if (charset == null) {
        charset = http.parseCharset(input);
      } else {
        charset = charset.feed(input);
      }
      if (charset.isDone()) {
        if (charsets == null) {
          charsets = FingerTrieSeq.builder();
        }
        charsets.add(charset.bind());
        charset = null;
        step = 2;
      } else if (charset.isError()) {
        return charset.asError();
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
          return done(AcceptCharset.from(charsets.bind()));
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
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 4) {
        if (charset == null) {
          charset = http.parseCharset(input);
        } else {
          charset = charset.feed(input);
        }
        if (charset.isDone()) {
          charsets.add(charset.bind());
          charset = null;
          step = 2;
          continue;
        } else if (charset.isError()) {
          return charset.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new AcceptCharsetParser(http, charset, charsets, step);
  }

  static Parser<AcceptCharset> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, 1);
  }
}
