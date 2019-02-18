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

final class Base64Parser<O> extends Parser<O> {
  final Output<O> output;
  final Base64 base64;
  final int p;
  final int q;
  final int r;
  final int step;

  Base64Parser(Output<O> output, Base64 base64, int p, int q, int r, int step) {
    this.output = output;
    this.base64 = base64;
    this.p = p;
    this.q = q;
    this.r = r;
    this.step = step;
  }

  Base64Parser(Output<O> output, Base64 base64) {
    this(output, base64, 0, 0, 0, 1);
  }

  @Override
  public Parser<O> feed(Input input) {
    return parse(input, this.output.clone(), this.base64, this.p, this.q, this.r, this.step);
  }

  static <O> Parser<O> parse(Input input, Output<O> output, Base64 base64, int p, int q, int r, int step) {
    int c = 0;
    while (!input.isEmpty()) {
      if (step == 1) {
        if (input.isCont()) {
          c = input.head();
          if (base64.isDigit(c)) {
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
          if (base64.isDigit(c)) {
            input = input.step();
            q = c;
            step = 3;
          } else {
            return error(Diagnostic.expected("base64 digit", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("base64 digit", input));
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
            base64.writeQuantum(p, q, '=', '=', output);
            return done(output.bind());
          } else {
            return error(Diagnostic.expected("base64 digit", input));
          }
        } else if (input.isDone()) {
          if (!base64.isPadded()) {
            base64.writeQuantum(p, q, '=', '=', output);
            return done(output.bind());
          } else {
            return error(Diagnostic.expected("base64 digit", input));
          }
        }
      }
      if (step == 4) {
        if (input.isCont()) {
          c = input.head();
          if (base64.isDigit(c) || c == '=') {
            input = input.step();
            base64.writeQuantum(p, q, r, c, output);
            r = 0;
            q = 0;
            p = 0;
            if (c != '=') {
              step = 1;
            } else {
              return done(output.bind());
            }
          } else if (!base64.isPadded()) {
            base64.writeQuantum(p, q, r, '=', output);
            return done(output.bind());
          } else {
            return error(Diagnostic.expected("base64 digit", input));
          }
        } else if (input.isDone()) {
          if (!base64.isPadded()) {
            base64.writeQuantum(p, q, r, '=', output);
            return done(output.bind());
          } else {
            return error(Diagnostic.expected("base64 digit", input));
          }
        }
      } else if (step == 5) {
        if (input.isCont()) {
          c = input.head();
          if (c == '=') {
            input = input.step();
            base64.writeQuantum(p, q, r, c, output);
            r = 0;
            q = 0;
            p = 0;
            return done(output.bind());
          } else {
            return error(Diagnostic.expected('=', input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected('=', input));
        }
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new Base64Parser<O>(output, base64, p, q, r, step);
  }

  static <O> Parser<O> parse(Input input, Output<O> output, Base64 base64) {
    return parse(input, output, base64, 0, 0, 0, 1);
  }
}
