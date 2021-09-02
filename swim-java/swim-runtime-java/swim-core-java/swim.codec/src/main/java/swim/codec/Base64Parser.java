// Copyright 2015-2021 Swim Inc.
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

final class Base64Parser<O> extends Parser<O> {

  final Base64 base64;
  final Output<O> output;
  final int p;
  final int q;
  final int r;
  final int step;

  Base64Parser(Base64 base64, Output<O> output, int p, int q, int r, int step) {
    this.base64 = base64;
    this.output = output;
    this.p = p;
    this.q = q;
    this.r = r;
    this.step = step;
  }

  Base64Parser(Base64 base64, Output<O> output) {
    this(base64, output, 0, 0, 0, 1);
  }

  @Override
  public Parser<O> feed(Input input) {
    return Base64Parser.parse(input, this.base64, this.output.clone(),
                              this.p, this.q, this.r, this.step);
  }

  static <O> Parser<O> parse(Input input, Base64 base64, Output<O> output,
                             int p, int q, int r, int step) {
    int c = 0;
    while (!input.isError() && !input.isEmpty()) {
      if (step == 1) {
        if (input.isCont()) {
          c = input.head();
          if (base64.isDigit(c)) {
            input = input.step();
            p = c;
            step = 2;
          } else {
            return Parser.done(output.bind());
          }
        } else if (input.isDone()) {
          return Parser.done(output.bind());
        }
      }
      if (step == 2) {
        if (input.isCont()) {
          c = input.head();
          if (base64.isDigit(c)) {
            input = input.step();
            q = c;
            step = 3;
          } else {
            return Parser.error(Diagnostic.expected("base64 digit", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("base64 digit", input));
        }
      }
      if (step == 3) {
        if (input.isCont()) {
          c = input.head();
          if (base64.isDigit(c) || c == '=') {
            input = input.step();
            r = c;
            if (c != '=') {
              step = 4;
            } else {
              step = 5;
            }
          } else if (!base64.isPadded()) {
            output = base64.writeQuantum(output, p, q, '=', '=');
            return Parser.done(output.bind());
          } else {
            return Parser.error(Diagnostic.expected("base64 digit", input));
          }
        } else if (input.isDone()) {
          if (!base64.isPadded()) {
            output = base64.writeQuantum(output, p, q, '=', '=');
            return Parser.done(output.bind());
          } else {
            return Parser.error(Diagnostic.expected("base64 digit", input));
          }
        }
      }
      if (step == 4) {
        if (input.isCont()) {
          c = input.head();
          if (base64.isDigit(c) || c == '=') {
            input = input.step();
            output = base64.writeQuantum(output, p, q, r, c);
            r = 0;
            q = 0;
            p = 0;
            if (c != '=') {
              step = 1;
            } else {
              return Parser.done(output.bind());
            }
          } else if (!base64.isPadded()) {
            output = base64.writeQuantum(output, p, q, r, '=');
            return Parser.done(output.bind());
          } else {
            return Parser.error(Diagnostic.expected("base64 digit", input));
          }
        } else if (input.isDone()) {
          if (!base64.isPadded()) {
            output = base64.writeQuantum(output, p, q, r, '=');
            return Parser.done(output.bind());
          } else {
            return Parser.error(Diagnostic.expected("base64 digit", input));
          }
        }
      } else if (step == 5) {
        if (input.isCont()) {
          c = input.head();
          if (c == '=') {
            input = input.step();
            output = base64.writeQuantum(output, p, q, r, c);
            r = 0;
            q = 0;
            p = 0;
            return Parser.done(output.bind());
          } else {
            return Parser.error(Diagnostic.expected('=', input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected('=', input));
        }
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new Base64Parser<O>(base64, output, p, q, r, step);
  }

  static <O> Parser<O> parse(Input input, Base64 base64, Output<O> output) {
    return Base64Parser.parse(input, base64, output, 0, 0, 0, 1);
  }

}
