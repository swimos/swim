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

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class ContentCodingParser extends Parser<ContentCoding> {

  final HttpParser http;
  final StringBuilder nameBuilder;
  final Parser<Float> weightParser;
  final int step;

  ContentCodingParser(HttpParser http, StringBuilder nameBuilder,
                      Parser<Float> weightParser, int step) {
    this.http = http;
    this.nameBuilder = nameBuilder;
    this.weightParser = weightParser;
    this.step = step;
  }

  ContentCodingParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<ContentCoding> feed(Input input) {
    return ContentCodingParser.parse(input, this.http, this.nameBuilder,
                                     this.weightParser, this.step);
  }

  static Parser<ContentCoding> parse(Input input, HttpParser http, StringBuilder nameBuilder,
                                     Parser<Float> weightParser, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (nameBuilder == null) {
            nameBuilder = new StringBuilder();
          }
          nameBuilder.appendCodePoint(c);
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("content coding", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("content coding", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          nameBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        step = 3;
      } else if (input.isDone()) {
        return Parser.done(http.contentCoding(nameBuilder.toString(), 1f));
      }
    }
    if (step == 3) {
      if (weightParser == null) {
        weightParser = http.parseQValue(input);
      } else {
        weightParser = weightParser.feed(input);
      }
      if (weightParser.isDone()) {
        final Float qvalue = weightParser.bind();
        final float q = qvalue != null ? (float) qvalue : 1f;
        return Parser.done(http.contentCoding(nameBuilder.toString(), q));
      } else if (weightParser.isError()) {
        return weightParser.asError();
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new ContentCodingParser(http, nameBuilder, weightParser, step);
  }

  static Parser<ContentCoding> parse(Input input, HttpParser http) {
    return ContentCodingParser.parse(input, http, null, null, 1);
  }

}
