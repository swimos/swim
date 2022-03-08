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

package swim.http;

import swim.codec.Base10;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class LanguageRangeParser extends Parser<LanguageRange> {

  final HttpParser http;
  final StringBuilder tagBuilder;
  final StringBuilder subtagBuilder;
  final Parser<Float> weightParser;
  final int step;

  LanguageRangeParser(HttpParser http, StringBuilder tagBuilder,
                      StringBuilder subtagBuilder, Parser<Float> weightParser, int step) {
    this.http = http;
    this.tagBuilder = tagBuilder;
    this.subtagBuilder = subtagBuilder;
    this.weightParser = weightParser;
    this.step = step;
  }

  LanguageRangeParser(HttpParser http) {
    this(http, null, null, null, 1);
  }

  @Override
  public Parser<LanguageRange> feed(Input input) {
    return LanguageRangeParser.parse(input, this.http, this.tagBuilder, this.subtagBuilder, this.weightParser, this.step);
  }

  static Parser<LanguageRange> parse(Input input, HttpParser http, StringBuilder tagBuilder,
                                     StringBuilder subtagBuilder, Parser<Float> weightParser, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isAlpha(c)) {
          input = input.step();
          if (tagBuilder == null) {
            tagBuilder = new StringBuilder();
          }
          tagBuilder.appendCodePoint(c);
          step = 2;
        } else if (c == '*') {
          input = input.step();
          tagBuilder = new StringBuilder("*");
          step = 18;
        } else {
          return Parser.error(Diagnostic.expected("language tag", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("language tag", input));
      }
    }
    while (step >= 2 && step <= 8) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isAlpha(c)) {
          input = input.step();
          tagBuilder.appendCodePoint(c);
          step += 1;
          continue;
        } else if (c == '-') {
          input = input.step();
          step = 9;
          break;
        } else {
          step = 18;
          break;
        }
      } else if (input.isDone()) {
        step = 18;
        break;
      }
      break;
    }
    if (step == 9) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isAlpha(c) || Base10.isDigit(c)) {
          input = input.step();
          if (subtagBuilder == null) {
            subtagBuilder = new StringBuilder();
          }
          subtagBuilder.appendCodePoint(c);
          step = 10;
        } else {
          return Parser.error(Diagnostic.expected("language subtag", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("language subtag", input));
      }
    }
    while (step >= 10 && step <= 17) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isAlpha(c) || Base10.isDigit(c)) {
          input = input.step();
          subtagBuilder.appendCodePoint(c);
          step += 1;
          continue;
        } else {
          step = 18;
          break;
        }
      } else if (input.isDone()) {
        step = 18;
        break;
      }
      break;
    }
    if (step == 18) {
      if (weightParser == null) {
        weightParser = http.parseQValue(input);
      } else {
        weightParser = weightParser.feed(input);
      }
      if (weightParser.isDone()) {
        final Float qvalue = weightParser.bind();
        final float q = qvalue != null ? (float) qvalue : 1f;
        return Parser.done(http.languageRange(tagBuilder.toString(), subtagBuilder != null ? subtagBuilder.toString() : null, q));
      } else if (weightParser.isError()) {
        return weightParser.asError();
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new LanguageRangeParser(http, tagBuilder, subtagBuilder, weightParser, step);
  }

  static Parser<LanguageRange> parse(Input input, HttpParser http) {
    return LanguageRangeParser.parse(input, http, null, null, null, 1);
  }

}
