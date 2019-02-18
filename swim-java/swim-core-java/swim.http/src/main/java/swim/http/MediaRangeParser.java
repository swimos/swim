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

final class MediaRangeParser extends Parser<MediaRange> {
  final HttpParser http;
  final StringBuilder type;
  final StringBuilder subtype;
  final Parser<Float> weight;
  final Parser<HashTrieMap<String, String>> params;
  final int step;

  MediaRangeParser(HttpParser http, StringBuilder type, StringBuilder subtype,
                   Parser<Float> weight, Parser<HashTrieMap<String, String>> params, int step) {
    this.http = http;
    this.type = type;
    this.subtype = subtype;
    this.weight = weight;
    this.params = params;
    this.step = step;
  }

  MediaRangeParser(HttpParser http) {
    this(http, null, null, null, null, 1);
  }

  @Override
  public Parser<MediaRange> feed(Input input) {
    return parse(input, this.http, this.type, this.subtype, this.weight, this.params, this.step);
  }

  static Parser<MediaRange> parse(Input input, HttpParser http, StringBuilder type, StringBuilder subtype,
                                  Parser<Float> weight, Parser<HashTrieMap<String, String>> params, int step) {
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
        return done(http.mediaRange(type.toString(), subtype.toString(), 1f,
                                    HashTrieMap.<String, String>empty()));
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
          params = http.parseParamMapRest(input);
          step = 9;
        }
      } else if (input.isDone()) {
        return error(Diagnostic.unexpected(input));
      }
    }
    if (step == 7) {
      if (input.isCont()) {
        c = input.head();
        if (c == '=') {
          weight = http.parseQValueRest(input);
          step = 8;
        } else {
          params = http.parseParamMapRest(new StringBuilder().append('q'), input);
          step = 9;
        }
      } else if (input.isDone()) {
        return error(Diagnostic.unexpected(input));
      }
    }
    if (step == 8) {
      weight = weight.feed(input);
      if (weight.isDone()) {
        step = 9;
      } else if (weight.isError()) {
        return weight.asError();
      }
    }
    if (step == 9) {
      if (params == null) {
        params = http.parseParamMap(input);
      } else {
        params = params.feed(input);
      }
      if (params.isDone()) {
        final Float qvalue = weight != null ? weight.bind() : null;
        final float q = qvalue != null ? (float) qvalue : 1f;
        return done(http.mediaRange(type.toString(), subtype.toString(), q, params.bind()));
      } else if (params.isError()) {
        return params.asError();
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new MediaRangeParser(http, type, subtype, weight, params, step);
  }

  static Parser<MediaRange> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, null, null, 1);
  }
}
