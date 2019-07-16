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

final class ChunkExtensionParser extends Parser<ChunkExtension> {
  final HttpParser http;
  final StringBuilder name;
  final StringBuilder value;
  final int step;

  ChunkExtensionParser(HttpParser http, StringBuilder name, StringBuilder value, int step) {
    this.http = http;
    this.name = name;
    this.value = value;
    this.step = step;
  }

  ChunkExtensionParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<ChunkExtension> feed(Input input) {
    return parse(input, this.http, this.name, this.value, this.step);
  }

  static Parser<ChunkExtension> parse(Input input, HttpParser http, StringBuilder name,
                                      StringBuilder value, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (c == ';') {
          input = input.step();
          step = 2;
        } else {
          return error(Diagnostic.expected("chunk extension", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("chunk extension", input));
      }
    }
    if (step == 2) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (name == null) {
            name = new StringBuilder();
          }
          name.appendCodePoint(c);
          step = 3;
        } else {
          return error(Diagnostic.expected("chunk extension name", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("chunk extension name", input));
      }
    }
    if (step == 3) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          name.appendCodePoint(c);
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
        return done(http.chunkExtension(name.toString(), ""));
      }
    }
    if (step == 5) {
      if (input.isCont()) {
        if (value == null) {
          value = new StringBuilder();
        }
        if (input.head() == '"') {
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
          return error(Diagnostic.expected("chunk extension value", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("chunk extension value", input));
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
        return done(http.chunkExtension(name.toString(), value.toString()));
      }
    }
    do {
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
            return done(http.chunkExtension(name.toString(), value.toString()));
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
    return new ChunkExtensionParser(http, name, value, step);
  }

  static Parser<ChunkExtension> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, 1);
  }
}
