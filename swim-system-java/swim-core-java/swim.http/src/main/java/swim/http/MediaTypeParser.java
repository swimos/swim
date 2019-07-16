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

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.HashTrieMap;

final class MediaTypeParser extends Parser<MediaType> {
  final HttpParser http;
  final StringBuilder type;
  final StringBuilder subtype;
  final Parser<HashTrieMap<String, String>> params;
  final int step;

  MediaTypeParser(HttpParser http, StringBuilder type, StringBuilder subtype,
                  Parser<HashTrieMap<String, String>> params, int step) {
    this.http = http;
    this.type = type;
    this.subtype = subtype;
    this.params = params;
    this.step = step;
  }

  MediaTypeParser(HttpParser http) {
    this(http, null, null, null, 1);
  }

  @Override
  public Parser<MediaType> feed(Input input) {
    return parse(input, this.http, this.type, this.subtype, this.params, this.step);
  }

  static Parser<MediaType> parse(Input input, HttpParser http, StringBuilder type, StringBuilder subtype,
                                 Parser<HashTrieMap<String, String>> params, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (type == null) {
            type = new StringBuilder();
          }
          type.appendCodePoint(c);
          step = 2;
        } else {
          return error(Diagnostic.expected("media type", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("media type", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          type.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isCont() && c == '/') {
        input = input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected('/', input));
      }
    }
    if (step == 3) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (subtype == null) {
            subtype = new StringBuilder();
          }
          subtype.appendCodePoint(c);
          step = 4;
        } else {
          return error(Diagnostic.expected("media subtype", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("media subtype", input));
      }
    }
    if (step == 4) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          subtype.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        step = 5;
      }
    }
    if (step == 5) {
      if (params == null) {
        params = http.parseParamMap(input);
      } else {
        params = params.feed(input);
      }
      if (params.isDone()) {
        return done(http.mediaType(type.toString(), subtype.toString(), params.bind()));
      } else if (params.isError()) {
        return params.asError();
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new MediaTypeParser(http, type, subtype, params, step);
  }

  static Parser<MediaType> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, null, 1);
  }
}
