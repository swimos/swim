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

final class ChunkExtensionParser extends Parser<ChunkExtension> {

  final HttpParser http;
  final StringBuilder nameBuilder;
  final StringBuilder valueBuilder;
  final int step;

  ChunkExtensionParser(HttpParser http, StringBuilder nameBuilder,
                       StringBuilder valueBuilder, int step) {
    this.http = http;
    this.nameBuilder = nameBuilder;
    this.valueBuilder = valueBuilder;
    this.step = step;
  }

  ChunkExtensionParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<ChunkExtension> feed(Input input) {
    return ChunkExtensionParser.parse(input, this.http, this.nameBuilder,
                                      this.valueBuilder, this.step);
  }

  static Parser<ChunkExtension> parse(Input input, HttpParser http, StringBuilder nameBuilder,
                                      StringBuilder valueBuilder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (c == ';') {
          input = input.step();
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("chunk extension", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("chunk extension", input));
      }
    }
    if (step == 2) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (nameBuilder == null) {
            nameBuilder = new StringBuilder();
          }
          nameBuilder.appendCodePoint(c);
          step = 3;
        } else {
          return Parser.error(Diagnostic.expected("chunk extension name", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("chunk extension name", input));
      }
    }
    if (step == 3) {
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
        step = 4;
      }
    }
    if (step == 4) {
      if (input.isCont() && input.head() == '=') {
        input = input.step();
        step = 5;
      } else if (!input.isEmpty()) {
        return Parser.done(http.chunkExtension(nameBuilder.toString(), ""));
      }
    }
    if (step == 5) {
      if (input.isCont()) {
        if (valueBuilder == null) {
          valueBuilder = new StringBuilder();
        }
        if (input.head() == '"') {
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
          return Parser.error(Diagnostic.expected("chunk extension value", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("chunk extension value", input));
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
        return Parser.done(http.chunkExtension(nameBuilder.toString(), valueBuilder.toString()));
      }
    }
    do {
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
            return Parser.done(http.chunkExtension(nameBuilder.toString(), valueBuilder.toString()));
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
    return new ChunkExtensionParser(http, nameBuilder, valueBuilder, step);
  }

  static Parser<ChunkExtension> parse(Input input, HttpParser http) {
    return ChunkExtensionParser.parse(input, http, null, null, 1);
  }

}
