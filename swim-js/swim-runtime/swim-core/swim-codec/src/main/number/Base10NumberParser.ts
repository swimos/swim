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

import {Diagnostic} from "../source/Diagnostic";
import type {Input} from "../input/Input";
import type {Output} from "../output/Output";
import {Parser} from "../parser/Parser";
import {Unicode} from "../unicode/Unicode";

/** @internal */
export class Base10NumberParser extends Parser<number> {
  /** @internal */
  readonly sign: number;
  /** @internal */
  readonly value: number;
  /** @internal */
  readonly mode: number;
  /** @internal */
  readonly step: number;

  constructor(sign: number = 1, value: number = 0, mode: number = 2, step: number = 1) {
    super();
    this.sign = sign;
    this.value = value;
    this.mode = mode;
    this.step = step;
  }

  override feed(input: Input): Parser<number> {
    return Base10NumberParser.parse(input, this.sign, this.value, this.mode, this.step);
  }

  static parse(input: Input, sign: number = 1, value: number = 0,
               mode: number = 2, step: number = 1): Parser<number> {
    let c = 0;
    if (step === 1) {
      if (input.isCont()) {
        c = input.head();
        if (c === 45/*'-'*/) {
          input = input.step();
          sign = -1;
        } else if (c === 43/*'+'*/) {
          input = input.step();
          sign = 1;
        }
        step = 2;
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("number", input));
      }
    }
    if (step === 2) {
      if (input.isCont()) {
        c = input.head();
        if (c === 48/*'0'*/) {
          input = input.step();
          step = 4;
        } else if (c >= 49/*'1'*/ && c <= 57/*'9'*/) {
          input = input.step();
          value = sign * (c - 48/*'0'*/);
          step = 3;
        } else if (mode > 0 && c === 46/*'.'*/) {
          let output = Unicode.stringOutput();
          if (sign < 0) {
            output = output.write(45/*'-'*/);
          }
          return Base10DecimalParser.parse(input, output, mode);
        } else {
          return Parser.error(Diagnostic.expected("number", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("number", input));
      }
    }
    if (step === 3) {
      while (input.isCont()) {
        c = input.head();
        if (c >= 48/*'0'*/ && c <= 57/*'9'*/) {
          const newValue = 10 * value + sign * (c - 48/*'0'*/);
          if (-9007199254740991 <= newValue && newValue <= 9007199254740992) {
            value = newValue;
            input = input.step();
          } else {
            return Parser.error(Diagnostic.message("integer overflow", input));
          }
        } else {
          break;
        }
      }
      if (input.isCont()) {
        step = 4;
      } else if (input.isDone()) {
        return Parser.done(value);
      }
    }
    if (step === 4) {
      if (input.isCont()) {
        c = input.head();
        if (mode > 0 && c === 46/*'.'*/ || mode > 1 && (c === 69/*'E'*/ || c === 101/*'e'*/)) {
          let output = Unicode.stringOutput();
          if (sign < 0 && value === 0) {
            output = output.write(45/*'-'*/).write(48/*'0'*/);
          } else {
            output = output.write("" + value);
          }
          return Base10DecimalParser.parse(input, output, mode);
        } else {
          return Parser.done(value);
        }
      } else if (input.isDone()) {
        return Parser.done(value);
      }
    }
    return new Base10NumberParser(sign, value, mode, step);
  }
}

/** @internal */
class Base10DecimalParser extends Parser<number> {
  /** @internal */
  readonly output: Output<string>;
  /** @internal */
  readonly mode: number;
  /** @internal */
  readonly step: number;

  constructor(output: Output<string>, mode: number = 2, step: number = 1) {
    super();
    this.output = output;
    this.mode = mode;
    this.step = step;
  }

  override feed(input: Input): Parser<number> {
    return Base10DecimalParser.parse(input, this.output, this.mode, this.step);
  }

  static parse(input: Input, output: Output<string>, mode: number = 2,
               step: number = 1): Parser<number> {
    let c = 0;
    if (step === 1) {
      if (input.isCont()) {
        c = input.head();
        if (c === 46/*'.'*/) {
          input = input.step();
          output = output.write(c);
          step = 2;
        } else if (mode > 1 && (c === 69/*'E'*/ || c === 101/*'e'*/)) {
          input = input.step();
          output = output.write(c);
          step = 5;
        } else {
          return Parser.error(Diagnostic.expected("decimal or exponent", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("decimal or exponent", input));
      }
    }
    if (step === 2) {
      if (input.isCont()) {
        c = input.head();
        if (c >= 48/*'0'*/ && c <= 57/*'9'*/) {
          input = input.step();
          output = output.write(c);
          step = 3;
        } else {
          return Parser.error(Diagnostic.expected("digit", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("digit", input));
      }
    }
    if (step === 3) {
      while (input.isCont()) {
        c = input.head();
        if (c >= 48/*'0'*/ && c <= 57/*'9'*/) {
          input = input.step();
          output = output.write(c);
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (mode > 1) {
          step = 4;
        } else {
          return Parser.done(+output.bind());
        }
      } else if (input.isDone()) {
        return Parser.done(+output.bind());
      }
    }
    if (step === 4) {
      c = input.head();
      if (c === 69/*'E'*/ || c === 101/*'e'*/) {
        input = input.step();
        output = output.write(c);
        step = 5;
      } else {
        return Parser.done(+output.bind());
      }
    }
    if (step === 5) {
      if (input.isCont()) {
        c = input.head();
        if (c === 43/*'+'*/ || c === 45/*'-'*/) {
          input = input.step();
          output = output.write(c);
        }
        step = 6;
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 6) {
      if (input.isCont()) {
        c = input.head();
        if (c >= 48/*'0'*/ && c <= 57/*'9'*/) {
          input = input.step();
          output = output.write(c);
          step = 7;
        } else {
          return Parser.error(Diagnostic.expected("digit", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("digit", input));
      }
    }
    if (step === 7) {
      while (input.isCont()) {
        c = input.head();
        if (c >= 48/*'0'*/ && c <= 57/*'9'*/) {
          input = input.step();
          output = output.write(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        return Parser.done(+output.bind());
      }
    }
    return new Base10DecimalParser(output, mode, step);
  }
}
