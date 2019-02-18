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

import swim.codec.Base10;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class QValueParser extends Parser<Float> {
  final int significand;
  final int exponent;
  final int step;

  QValueParser(int significand, int exponent, int step) {
    this.significand = significand;
    this.exponent = exponent;
    this.step = step;
  }

  @Override
  public Parser<Float> feed(Input input) {
    return parse(input, this.significand, this.exponent, this.step);
  }

  static Parser<Float> parse(Input input, int significand, int exponent, int step) {
    int c = 0;
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
        return done();
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
        if (c == 'q') {
          input = input.step();
          step = 3;
        } else {
          return error(Diagnostic.expected("qvalue", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("qvalue", input));
      }
    }
    if (step == 3) {
      if (input.isCont()) {
        c = input.head();
        if (c == '=') {
          input = input.step();
          step = 4;
        } else {
          return error(Diagnostic.expected('=', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected('=', input));
      }
    }
    if (step == 4) {
      if (input.isCont()) {
        c = input.head();
        if (c == '0') {
          input = input.step();
          significand = 0;
          exponent = 0;
          step = 5;
        } else if (c == '1') {
          input = input.step();
          significand = 1;
          exponent = 0;
          step = 5;
        } else {
          return error(Diagnostic.expected("0 or 1", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("0 or 1", input));
      }
    }
    if (step == 5) {
      if (input.isCont()) {
        c = input.head();
        if (c == '.') {
          input = input.step();
          step = 6;
        } else {
          step = 9;
        }
      } else if (input.isDone()) {
        step = 9;
      }
    }
    while (step >= 6 && step <= 8) {
      if (input.isCont()) {
        c = input.head();
        if (Base10.isDigit(c)) {
          input = input.step();
          significand = 10 * significand + Base10.decodeDigit(c);
          exponent += 1;
          step += 1;
          continue;
        } else {
          step = 9;
        }
      } else if (input.isDone()) {
        step = 9;
      }
      break;
    }
    if (step == 9) {
      float weight = (float) significand;
      while (exponent > 0) {
        weight /= 10f;
        exponent -= 1;
      }
      if (weight <= 1f) {
        return done(weight);
      } else {
        return error(Diagnostic.message("invalid qvalue: " + weight, input));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new QValueParser(significand, exponent, step);
  }

  public static Parser<Float> parse(Input input) {
    return parse(input, 0, 0, 1);
  }

  public static Parser<Float> parseRest(Input input) {
    return parse(input, 0, 0, 3);
  }
}
