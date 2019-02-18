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

import swim.codec.Base10;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class LanguageRangeParser extends Parser<LanguageRange> {
  final HttpParser http;
  final StringBuilder tag;
  final StringBuilder subtag;
  final Parser<Float> weight;
  final int step;

  LanguageRangeParser(HttpParser http, StringBuilder tag,
                      StringBuilder subtag, Parser<Float> weight, int step) {
    this.http = http;
    this.tag = tag;
    this.subtag = subtag;
    this.weight = weight;
    this.step = step;
  }

  LanguageRangeParser(HttpParser http) {
    this(http, null, null, null, 1);
  }

  @Override
  public Parser<LanguageRange> feed(Input input) {
    return parse(input, this.http, this.tag, this.subtag, this.weight, this.step);
  }

  static Parser<LanguageRange> parse(Input input, HttpParser http, StringBuilder tag,
                                     StringBuilder subtag, Parser<Float> weight, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isAlpha(c)) {
          input = input.step();
          if (tag == null) {
            tag = new StringBuilder();
          }
          tag.appendCodePoint(c);
          step = 2;
        } else if (c == '*') {
          input = input.step();
          tag = new StringBuilder("*");
          step = 18;
        } else {
          return error(Diagnostic.expected("language tag", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("language tag", input));
      }
    }
    while (step >= 2 && step <= 8) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isAlpha(c)) {
          input = input.step();
          tag.appendCodePoint(c);
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
          if (subtag == null) {
            subtag = new StringBuilder();
          }
          subtag.appendCodePoint(c);
          step = 10;
        } else {
          return error(Diagnostic.expected("language subtag", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("language subtag", input));
      }
    }
    while (step >= 10 && step <= 17) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isAlpha(c) || Base10.isDigit(c)) {
          input = input.step();
          subtag.appendCodePoint(c);
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
      if (weight == null) {
        weight = http.parseQValue(input);
      } else {
        weight = weight.feed(input);
      }
      if (weight.isDone()) {
        final Float qvalue = weight.bind();
        final float q = qvalue != null ? (float) qvalue : 1f;
        return done(http.languageRange(tag.toString(), subtag != null ? subtag.toString() : null, q));
      } else if (weight.isError()) {
        return weight.asError();
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new LanguageRangeParser(http, tag, subtag, weight, step);
  }

  static Parser<LanguageRange> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, null, 1);
  }
}
