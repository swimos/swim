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
import swim.collections.HashTrieMap;

final class MediaTypeParser extends Parser<MediaType> {

  final HttpParser http;
  final StringBuilder typeBuilder;
  final StringBuilder subtypeBuilder;
  final Parser<HashTrieMap<String, String>> paramsParser;
  final int step;

  MediaTypeParser(HttpParser http, StringBuilder typeBuilder, StringBuilder subtypeBuilder,
                  Parser<HashTrieMap<String, String>> paramsParser, int step) {
    this.http = http;
    this.typeBuilder = typeBuilder;
    this.subtypeBuilder = subtypeBuilder;
    this.paramsParser = paramsParser;
    this.step = step;
  }

  MediaTypeParser(HttpParser http) {
    this(http, null, null, null, 1);
  }

  @Override
  public Parser<MediaType> feed(Input input) {
    return MediaTypeParser.parse(input, this.http, this.typeBuilder, this.subtypeBuilder,
                                 this.paramsParser, this.step);
  }

  static Parser<MediaType> parse(Input input, HttpParser http,
                                 StringBuilder typeBuilder, StringBuilder subtypeBuilder,
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
      if (paramsParser == null) {
        paramsParser = http.parseParamMap(input);
      } else {
        paramsParser = paramsParser.feed(input);
      }
      if (paramsParser.isDone()) {
        return Parser.done(http.mediaType(typeBuilder.toString(), subtypeBuilder.toString(),
                                          paramsParser.bind()));
      } else if (paramsParser.isError()) {
        return paramsParser.asError();
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new MediaTypeParser(http, typeBuilder, subtypeBuilder, paramsParser, step);
  }

  static Parser<MediaType> parse(Input input, HttpParser http) {
    return MediaTypeParser.parse(input, http, null, null, null, 1);
  }

}
