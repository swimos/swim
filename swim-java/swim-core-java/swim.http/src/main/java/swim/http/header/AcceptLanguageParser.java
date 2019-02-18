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
import swim.http.HttpParser;
import swim.http.LanguageRange;
import swim.util.Builder;

final class AcceptLanguageParser extends Parser<AcceptLanguage> {
  final HttpParser http;
  final Parser<LanguageRange> language;
  final Builder<LanguageRange, FingerTrieSeq<LanguageRange>> languages;
  final int step;

  AcceptLanguageParser(HttpParser http, Parser<LanguageRange> language,
                       Builder<LanguageRange, FingerTrieSeq<LanguageRange>> languages, int step) {
    this.http = http;
    this.language = language;
    this.languages = languages;
    this.step = step;
  }

  AcceptLanguageParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<AcceptLanguage> feed(Input input) {
    return parse(input, this.http, this.language, this.languages, this.step);
  }

  static Parser<AcceptLanguage> parse(Input input, HttpParser http, Parser<LanguageRange> language,
                                      Builder<LanguageRange, FingerTrieSeq<LanguageRange>> languages, int step) {
    int c = 0;
    if (step == 1) {
      if (language == null) {
        language = http.parseLanguageRange(input);
      } else {
        language = language.feed(input);
      }
      if (language.isDone()) {
        if (languages == null) {
          languages = FingerTrieSeq.builder();
        }
        languages.add(language.bind());
        language = null;
        step = 2;
      } else if (language.isError()) {
        return language.asError();
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
          return done(AcceptLanguage.from(languages.bind()));
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
        if (language == null) {
          language = http.parseLanguageRange(input);
        } else {
          language = language.feed(input);
        }
        if (language.isDone()) {
          languages.add(language.bind());
          language = null;
          step = 2;
          continue;
        } else if (language.isError()) {
          return language.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new AcceptLanguageParser(http, language, languages, step);
  }

  static Parser<AcceptLanguage> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, 1);
  }
}
