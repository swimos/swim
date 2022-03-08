// Copyright 2015-2022 Swim.inc
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
import swim.http.HttpParser;
import swim.http.LanguageRange;
import swim.util.Builder;

final class AcceptLanguageHeaderParser extends Parser<AcceptLanguageHeader> {

  final HttpParser http;
  final Parser<LanguageRange> languageParser;
  final Builder<LanguageRange, FingerTrieSeq<LanguageRange>> languages;
  final int step;

  AcceptLanguageHeaderParser(HttpParser http, Parser<LanguageRange> languageParser,
                             Builder<LanguageRange, FingerTrieSeq<LanguageRange>> languages, int step) {
    this.http = http;
    this.languageParser = languageParser;
    this.languages = languages;
    this.step = step;
  }

  AcceptLanguageHeaderParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<AcceptLanguageHeader> feed(Input input) {
    return AcceptLanguageHeaderParser.parse(input, this.http, this.languageParser, this.languages, this.step);
  }

  static Parser<AcceptLanguageHeader> parse(Input input, HttpParser http, Parser<LanguageRange> languageParser,
                                            Builder<LanguageRange, FingerTrieSeq<LanguageRange>> languages, int step) {
    int c = 0;
    if (step == 1) {
      if (languageParser == null) {
        languageParser = http.parseLanguageRange(input);
      } else {
        languageParser = languageParser.feed(input);
      }
      if (languageParser.isDone()) {
        if (languages == null) {
          languages = FingerTrieSeq.builder();
        }
        languages.add(languageParser.bind());
        languageParser = null;
        step = 2;
      } else if (languageParser.isError()) {
        return languageParser.asError();
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
          return Parser.done(AcceptLanguageHeader.create(languages.bind()));
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
        if (languageParser == null) {
          languageParser = http.parseLanguageRange(input);
        } else {
          languageParser = languageParser.feed(input);
        }
        if (languageParser.isDone()) {
          languages.add(languageParser.bind());
          languageParser = null;
          step = 2;
          continue;
        } else if (languageParser.isError()) {
          return languageParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new AcceptLanguageHeaderParser(http, languageParser, languages, step);
  }

  static Parser<AcceptLanguageHeader> parse(Input input, HttpParser http) {
    return AcceptLanguageHeaderParser.parse(input, http, null, null, 1);
  }

}
