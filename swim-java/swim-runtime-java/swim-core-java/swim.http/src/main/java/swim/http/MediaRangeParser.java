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

package swim.http;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.HashTrieMap;

final class MediaRangeParser extends Parser<MediaRange> {

  final HttpParser http;
  final StringBuilder typeBuilder;
  final StringBuilder subtypeBuilder;
  final Parser<Float> weightParser;
  final Parser<HashTrieMap<String, String>> paramsParser;
  final int step;

  MediaRangeParser(HttpParser http, StringBuilder typeBuilder,
                   StringBuilder subtypeBuilder, Parser<Float> weightParser,
                   Parser<HashTrieMap<String, String>> paramsParser, int step) {
    this.http = http;
    this.typeBuilder = typeBuilder;
    this.subtypeBuilder = subtypeBuilder;
    this.weightParser = weightParser;
    this.paramsParser = paramsParser;
    this.step = step;
  }

  MediaRangeParser(HttpParser http) {
    this(http, null, null, null, null, 1);
  }

  @Override
  public Parser<MediaRange> feed(Input input) {
    return MediaRangeParser.parse(input, this.http, this.typeBuilder, this.subtypeBuilder,
                                  this.weightParser, this.paramsParser, this.step);
  }

  static Parser<MediaRange> parse(Input input, HttpParser http, StringBuilder typeBuilder,
                                  StringBuilder subtypeBuilder, Parser<Float> weightParser,
                                  Parser<HashTrieMap<String, String>> paramsParser, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (typeBuilder == null) {
            typeBuilder = new StringBuilder();
          }
          typeBuilder.appendCodePoint(c);
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("media type", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("media type", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          typeBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isCont() && c == '/') {
        input = input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected('/', input));
      }
    }
    if (step == 3) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (subtypeBuilder == null) {
            subtypeBuilder = new StringBuilder();
          }
          subtypeBuilder.appendCodePoint(c);
          step = 4;
        } else {
          return Parser.error(Diagnostic.expected("media subtype", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("media subtype", input));
      }
    }
    if (step == 4) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          subtypeBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        step = 5;
      }
    }
    if (step == 5) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isSpace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont() && c == ';') {
        input = input.step();
        step = 6;
      } else if (!input.isEmpty()) {
        return Parser.done(http.mediaRange(typeBuilder.toString(), subtypeBuilder.toString(),
                                           1f, HashTrieMap.<String, String>empty()));
      }
    }
    if (step == 6) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isSpace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == 'q') {
          input = input.step();
          step = 7;
        } else {
          paramsParser = http.parseParamMapRest(input);
          step = 9;
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step == 7) {
      if (input.isCont()) {
        c = input.head();
        if (c == '=') {
          weightParser = http.parseQValueRest(input);
          step = 8;
        } else {
          paramsParser = http.parseParamMapRest(input, new StringBuilder().append('q'));
          step = 9;
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step == 8) {
      weightParser = weightParser.feed(input);
      if (weightParser.isDone()) {
        step = 9;
      } else if (weightParser.isError()) {
        return weightParser.asError();
      }
    }
    if (step == 9) {
      if (paramsParser == null) {
        paramsParser = http.parseParamMap(input);
      } else {
        paramsParser = paramsParser.feed(input);
      }
      if (paramsParser.isDone()) {
        final Float qvalue = weightParser != null ? weightParser.bind() : null;
        final float q = qvalue != null ? (float) qvalue : 1f;
        return Parser.done(http.mediaRange(typeBuilder.toString(),
                           subtypeBuilder.toString(), q, paramsParser.bind()));
      } else if (paramsParser.isError()) {
        return paramsParser.asError();
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new MediaRangeParser(http, typeBuilder, subtypeBuilder,
                                weightParser, paramsParser, step);
  }

  static Parser<MediaRange> parse(Input input, HttpParser http) {
    return MediaRangeParser.parse(input, http, null, null, null, null, 1);
  }

}
