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

package swim.json;

import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;

final class StringParser<I, V> extends Parser<V> {
  final JsonParser<I, V> json;
  final Output<V> output;
  final int quote;
  final int code;
  final int step;

  StringParser(JsonParser<I, V> json, Output<V> output, int quote, int code, int step) {
    this.json = json;
    this.output = output;
    this.quote = quote;
    this.code = code;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.json, this.output, this.quote, this.code, this.step);
  }

  static <I, V> Parser<V> parse(Input input, JsonParser<I, V> json, Output<V> output,
                                int quote, int code, int step) {
    int c = 0;
    if (step == 1) {
      while (input.isCont()) {
        c = input.head();
        if (Json.isWhitespace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if ((c == '"' || c == '\'') && (quote == c || quote == 0)) {
          input = input.step();
          if (output == null) {
            output = json.textOutput();
          }
          quote = c;
          step = 2;
        } else {
          return error(Diagnostic.expected("string", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("string", input));
      }
    }
    string: do {
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (c >= 0x20 && c != quote && c != '\\') {
            input = input.step();
            output = output.write(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == quote) {
            input = input.step();
            return done(output.bind());
          } else if (c == '\\') {
            input = input.step();
            step = 3;
          } else {
            return error(Diagnostic.expected(quote, input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected(quote, input));
        }
      }
      if (step == 3) {
        if (input.isCont()) {
          c = input.head();
          if (c == '"' || c == '$' || c == '\'' || c == '/' || c == '@' || c == '[' || c == '\\' || c == ']' || c == '{' || c == '}') {
            input = input.step();
            output = output.write(c);
            step = 2;
            continue;
          } else if (c == 'b') {
            input = input.step();
            output = output.write('\b');
            step = 2;
            continue;
          } else if (c == 'f') {
            input = input.step();
            output = output.write('\f');
            step = 2;
            continue;
          } else if (c == 'n') {
            input = input.step();
            output = output.write('\n');
            step = 2;
            continue;
          } else if (c == 'r') {
            input = input.step();
            output = output.write('\r');
            step = 2;
            continue;
          } else if (c == 't') {
            input = input.step();
            output = output.write('\t');
            step = 2;
            continue;
          } else if (c == 'u') {
            input = input.step();
            step = 4;
          } else {
            return error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("escape character", input));
        }
      }
      if (step >= 4) {
        do {
          if (input.isCont()) {
            c = input.head();
            if (Base16.isDigit(c)) {
              input = input.step();
              code = 16 * code + Base16.decodeDigit(c);
              if (step <= 6) {
                step += 1;
                continue;
              } else {
                output = output.write(code);
                code = 0;
                step = 2;
                continue string;
              }
            } else {
              return error(Diagnostic.expected("hex digit", input));
            }
          } else if (input.isDone()) {
            return error(Diagnostic.expected("hex digit", input));
          }
          break;
        } while (true);
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new StringParser<I, V>(json, output, quote, code, step);
  }

  static <I, V> Parser<V> parse(Input input, JsonParser<I, V> json) {
    return parse(input, json, null, 0, 0, 1);
  }

  static <I, V> Parser<V> parse(Input input, JsonParser<I, V> json, Output<V> output) {
    return parse(input, json, output, 0, 0, 1);
  }
}
