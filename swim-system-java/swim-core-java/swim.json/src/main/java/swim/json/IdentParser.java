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

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;

final class IdentParser<I, V> extends Parser<V> {
  final JsonParser<I, V> json;
  final Output<V> output;
  final int step;

  IdentParser(JsonParser<I, V> json, Output<V> output, int step) {
    this.json = json;
    this.output = output;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.json, this.output, this.step);
  }

  static <I, V> Parser<V> parse(Input input, JsonParser<I, V> json, Output<V> output, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Json.isIdentStartChar(c)) {
          input = input.step();
          if (output == null) {
            output = json.textOutput();
          }
          output = output.write(c);
          step = 2;
        } else {
          return error(Diagnostic.expected("identifier", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("identifier", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Json.isIdentChar(c)) {
          input = input.step();
          output = output.write(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        return done(json.ident(output.bind()));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new IdentParser<I, V>(json, output, step);
  }

  static <I, V> Parser<V> parse(Input input, JsonParser<I, V> json, Output<V> output) {
    return parse(input, json, output, 1);
  }

  static <I, V> Parser<V> parse(Input input, JsonParser<I, V> json) {
    return parse(input, json, null, 1);
  }
}
