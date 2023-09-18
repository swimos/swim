// Copyright 2015-2023 Nstream, inc.
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

  final StringBuilder keyBuilder;
  final StringBuilder valueBuilder;
  final HashTrieMap<String, String> params;
  final int step;

  ParamMapParser(StringBuilder keyBuilder, StringBuilder valueBuilder,
                 HashTrieMap<String, String> params, int step) {
    this.keyBuilder = keyBuilder;
    this.valueBuilder = valueBuilder;
    this.params = params;
    this.step = step;
  }

  @Override
  public Parser<HashTrieMap<String, String>> feed(Input input) {
    return ParamMapParser.parse(input, this.keyBuilder, this.valueBuilder,
                                this.params, this.step);
  }

  static Parser<HashTrieMap<String, String>> parse(Input input, StringBuilder keyBuilder,
                                                   StringBuilder valueBuilder,
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
          return Parser.done(params);
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
            keyBuilder = new StringBuilder();
            input = input.step();
            keyBuilder.appendCodePoint(c);
            step = 3;
          } else {
            return Parser.error(Diagnostic.expected("param name", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("param name", input));
        }
      }
      if (step == 3) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            input = input.step();
            keyBuilder.appendCodePoint(c);
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
          return Parser.error(Diagnostic.expected('=', input));
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
          if (valueBuilder == null) {
            valueBuilder = new StringBuilder();
          }
          if (c == '"') {
            input = input.step();
            step = 8;
          } else {
            step = 6;
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 6) {
        if (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            input = input.step();
            valueBuilder.appendCodePoint(c);
            step = 7;
          } else {
            return Parser.error(Diagnostic.expected("param value", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("param value", input));
        }
      }
      if (step == 7) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            input = input.step();
            valueBuilder.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (!input.isEmpty()) {
          if (params == null) {
            params = HashTrieMap.empty();
          }
          params = params.updated(keyBuilder.toString(), valueBuilder.toString());
          keyBuilder = null;
          valueBuilder = null;
          step = 1;
          continue;
        }
      }
      if (step == 8) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isQuotedChar(c)) {
            input = input.step();
            valueBuilder.appendCodePoint(c);
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
            params = params.updated(keyBuilder.toString(), valueBuilder.toString());
            keyBuilder = null;
            valueBuilder = null;
            step = 1;
            continue;
          } else if (c == '\\') {
            input = input.step();
            step = 9;
          } else {
            return Parser.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 9) {
        if (input.isCont()) {
          c = input.head();
          if (Http.isEscapeChar(c)) {
            input = input.step();
            valueBuilder.appendCodePoint(c);
            step = 8;
            continue;
          } else {
            return Parser.error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("escape character", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new ParamMapParser(keyBuilder, valueBuilder, params, step);
  }

  static Parser<HashTrieMap<String, String>> parse(Input input) {
    return ParamMapParser.parse(input, null, null, null, 1);
  }

  static Parser<HashTrieMap<String, String>> parseRest(Input input) {
    return ParamMapParser.parse(input, null, null, null, 2);
  }

  static Parser<HashTrieMap<String, String>> parseRest(Input input, StringBuilder keyBuilder) {
    return ParamMapParser.parse(input, keyBuilder, null, null, 3);
  }

}
