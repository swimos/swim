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

final class ParamMapParser extends Parser<HashTrieMap<String, String>> {
  final StringBuilder key;
  final StringBuilder value;
  final HashTrieMap<String, String> params;
  final int step;

  ParamMapParser(StringBuilder key, StringBuilder value, HashTrieMap<String, String> params, int step) {
    this.key = key;
    this.value = value;
    this.params = params;
    this.step = step;
  }

  @Override
  public Parser<HashTrieMap<String, String>> feed(Input input) {
    return parse(input, this.key, this.value, this.params, this.step);
  }

  static Parser<HashTrieMap<String, String>> parse(Input input, StringBuilder key, StringBuilder value,
                                                   HashTrieMap<String, String> params, int step) {
    int c = 0;
    do {
      if (step == 1) {
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
          step = 2;
        } else if (!input.isEmpty()) {
          if (params == null) {
            params = HashTrieMap.empty();
          }
          return done(params);
        }
      }
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (Http.isTokenChar(c)) {
            key = new StringBuilder();
            input = input.step();
            key.appendCodePoint(c);
            step = 3;
          } else {
            return error(Diagnostic.expected("param name", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("param name", input));
        }
      }
      if (step == 3) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            input = input.step();
            key.appendCodePoint(c);
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
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && c == '=') {
          input = input.step();
          step = 5;
        } else if (!input.isEmpty()) {
          return error(Diagnostic.expected('=', input));
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
        if (input.isCont()) {
          if (value == null) {
            value = new StringBuilder();
          }
          if (c == '"') {
            input = input.step();
            step = 8;
          } else {
            step = 6;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 6) {
        if (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            input = input.step();
            value.appendCodePoint(c);
            step = 7;
          } else {
            return error(Diagnostic.expected("param value", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("param value", input));
        }
      }
      if (step == 7) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            input = input.step();
            value.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (!input.isEmpty()) {
          if (params == null) {
            params = HashTrieMap.empty();
          }
          params = params.updated(key.toString(), value.toString());
          key = null;
          value = null;
          step = 1;
          continue;
        }
      }
      if (step == 8) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isQuotedChar(c)) {
            input = input.step();
            value.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '"') {
            input = input.step();
            if (params == null) {
              params = HashTrieMap.empty();
            }
            params = params.updated(key.toString(), value.toString());
            key = null;
            value = null;
            step = 1;
            continue;
          } else if (c == '\\') {
            input = input.step();
            step = 9;
          } else {
            return error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 9) {
        if (input.isCont()) {
          c = input.head();
          if (Http.isEscapeChar(c)) {
            input = input.step();
            value.appendCodePoint(c);
            step = 8;
            continue;
          } else {
            return error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("escape character", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new ParamMapParser(key, value, params, step);
  }

  static Parser<HashTrieMap<String, String>> parse(Input input) {
    return parse(input, null, null, null, 1);
  }

  static Parser<HashTrieMap<String, String>> parseRest(Input input) {
    return parse(input, null, null, null, 2);
  }

  static Parser<HashTrieMap<String, String>> parseRest(Input input, StringBuilder key) {
    return parse(input, key, null, null, 3);
  }
}
