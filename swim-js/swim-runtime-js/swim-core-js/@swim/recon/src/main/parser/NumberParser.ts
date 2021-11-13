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

import {Input, Output, Parser, Diagnostic, Unicode, Base16} from "@swim/codec";
import {Recon} from "../Recon";
import type {ReconParser} from "./ReconParser";

/** @internal */
export class NumberParser<I, V> extends Parser<V> {
  private readonly recon: ReconParser<I, V>;
  private readonly sign: number | undefined;
  private readonly value: number | undefined;
  private readonly mode: number | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconParser<I, V>, sign?: number, value?: number, mode?: number, step?: number) {
    super();
    this.recon = recon;
    this.sign = sign;
    this.value = value;
    this.mode = mode;
    this.step = step;
  }

  override feed(input: Input): Parser<V> {
    return NumberParser.parse(input, this.recon, this.sign, this.value, this.mode, this.step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, sign: number = 1, value: number = 0,
                     mode: number = 2, step: number = 1): Parser<V> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Recon.isWhitespace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 45/*'-'*/) {
          input = input.step();
          sign = -1;
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
        return Parser.done(recon.num(value));
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
          return DecimalParser.parse(input, recon, output, mode);
        } else if (c === 120/*'x'*/ && sign > 0 && value === 0) {
          input = input.step();
          return HexadecimalParser.parse(input, recon);
        } else {
          return Parser.done(recon.num(value));
        }
      } else if (input.isDone()) {
        return Parser.done(recon.num(value));
      }
    }
    return new NumberParser<I, V>(recon, sign, value, mode, step);
  }

  static parseInteger<I, V>(input: Input, recon: ReconParser<I, V>): Parser<V> {
    return NumberParser.parse(input, recon, void 0, void 0, 0);
  }

  static parseDecimal<I, V>(input: Input, recon: ReconParser<I, V>): Parser<V> {
    return NumberParser.parse(input, recon, void 0, void 0, 1);
  }
}

/** @internal */
export class DecimalParser<I, V> extends Parser<V> {
  private readonly recon: ReconParser<I, V>;
  private readonly output: Output<string>;
  private readonly mode: number | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconParser<I, V>, output: Output<string>, mode?: number, step?: number) {
    super();
    this.recon = recon;
    this.output = output;
    this.mode = mode;
    this.step = step;
  }

  override feed(input: Input): Parser<V> {
    return DecimalParser.parse(input, this.recon, this.output, this.mode, this.step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, output: Output<string>,
                     mode: number = 2, step: number = 1): Parser<V> {
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
          return Parser.done(recon.num(output.bind()));
        }
      } else if (input.isDone()) {
        return Parser.done(recon.num(output.bind()));
      }
    }
    if (step === 4) {
      c = input.head();
      if (c === 69/*'E'*/ || c === 101/*'e'*/) {
        input = input.step();
        output = output.write(c);
        step = 5;
      } else {
        return Parser.done(recon.num(output.bind()));
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
        return Parser.done(recon.num(output.bind()));
      }
    }
    return new DecimalParser<I, V>(recon, output, mode, step);
  }
}

/** @internal */
class HexadecimalParser<I, V> extends Parser<V> {
  private readonly recon: ReconParser<I, V>;
  private readonly value: number | undefined;
  private readonly size: number | undefined;

  constructor(recon: ReconParser<I, V>, value?: number, size?: number) {
    super();
    this.recon = recon;
    this.value = value;
    this.size = size;
  }

  override feed(input: Input): Parser<V> {
    return HexadecimalParser.parse(input, this.recon, this.value, this.size);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>,
                     value: number = 0, size: number = 0): Parser<V> {
    let c = 0;
    while (input.isCont()) {
      c = input.head();
      if (Base16.isDigit(c)) {
        input = input.step();
        value = 16 * value + Base16.decodeDigit(c);
        size += 1;
      } else {
        break;
      }
    }
    if (!input.isEmpty()) {
      if (size > 0) {
        if (size <= 8) {
          return Parser.done(recon.uint32(value));
        } else {
          return Parser.done(recon.uint64(value));
        }
      } else {
        return Parser.error(Diagnostic.expected("hex digit", input));
      }
    }
    return new HexadecimalParser<I, V>(recon, value, size);
  }
}
