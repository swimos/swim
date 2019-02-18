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

package swim.codec;

final class Base16Parser<O> extends Parser<O> {
  final Output<O> output;
  final int p;
  final int step;

  Base16Parser(Output<O> output, int p, int step) {
    this.output = output;
    this.p = p;
    this.step = step;
  }

  Base16Parser(Output<O> output) {
    this(output, 0, 1);
  }

  @Override
  public Parser<O> feed(Input input) {
    return parse(input, this.output.clone(), this.p, this.step);
  }

  static <O> Parser<O> parse(Input input, Output<O> output, int p, int step) {
    int c = 0;
    while (!input.isEmpty()) {
      if (step == 1) {
        if (input.isCont()) {
          c = input.head();
          if (Base16.isDigit(c)) {
            input = input.step();
            p = c;
            step = 2;
          } else {
            return done(output.bind());
          }
        } else if (input.isDone()) {
          return done(output.bind());
        }
      }
      if (step == 2) {
        if (input.isCont()) {
          c = input.head();
          if (Base16.isDigit(c)) {
            input = input.step();
            Base16.writeQuantum(p, c, output);
            p = 0;
            step = 1;
          } else {
            return error(Diagnostic.expected("base16 digit", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("base16 digit", input));
        }
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new Base16Parser<O>(output, p, step);
  }

  static <O> Parser<O> parse(Input input, Output<O> output) {
    return parse(input, output, 0, 1);
  }
}
