// Copyright 2015-2021 Swim inc.
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
import type {Base64} from "./Base64";

/** @hidden */
export class Base64Parser<O> extends Parser<O> {
  /** @hidden */
  readonly output!: Output<O>;
  /** @hidden */
  readonly base64!: Base64;
  /** @hidden */
  readonly p!: number;
  /** @hidden */
  readonly q!: number;
  /** @hidden */
  readonly r!: number;
  /** @hidden */
  readonly step!: number;

  constructor(output: Output<O>, base64: Base64, p: number = 0, q: number = 0,
              r: number = 0, step: number = 1) {
    super();
    Object.defineProperty(this, "output", {
      value: output,
      enumerable: true,
    });
    Object.defineProperty(this, "base64", {
      value: base64,
      enumerable: true,
    });
    Object.defineProperty(this, "p", {
      value: p,
      enumerable: true,
    });
    Object.defineProperty(this, "q", {
      value: q,
      enumerable: true,
    });
    Object.defineProperty(this, "r", {
      value: r,
      enumerable: true,
    });
    Object.defineProperty(this, "step", {
      value: step,
      enumerable: true,
    });
  }

  override feed(input: Input): Parser<O> {
    return Base64Parser.parse(input, this.output.clone(), this.base64,
                              this.p, this.q, this.r, this.step);
  }

  static parse<O>(input: Input, output: Output<O>, base64: Base64, p: number = 0,
                  q: number = 0, r: number = 0, step: number = 1): Parser<O> {
    let c = 0;
    while (!input.isEmpty()) {
      if (step === 1) {
        if (input.isCont() && (c = input.head(), base64.isDigit(c))) {
          input = input.step();
          p = c;
          step = 2;
        } else if (!input.isEmpty()) {
          return Parser.done(output.bind());
        }
      }
      if (step === 2) {
        if (input.isCont() && (c = input.head(), base64.isDigit(c))) {
          input = input.step();
          q = c;
          step = 3;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("base64 digit", input));
        }
      }
      if (step === 3) {
        if (input.isCont() && (c = input.head(), base64.isDigit(c) || c === 61/*'='*/)) {
          input = input.step();
          r = c;
          if (c !== 61/*'='*/) {
            step = 4;
          } else {
            step = 5;
          }
        } else if (!input.isEmpty()) {
          if (!base64.isPadded()) {
            base64.writeQuantum(p, q, 61/*'='*/, 61/*'='*/, output);
            return Parser.done(output.bind());
          } else {
            return Parser.error(Diagnostic.unexpected(input));
          }
        }
      }
      if (step === 4) {
        if (input.isCont() && (c = input.head(), base64.isDigit(c) || c === 61/*'='*/)) {
          input = input.step();
          base64.writeQuantum(p, q, r, c, output);
          r = 0;
          q = 0;
          p = 0;
          if (c !== 61/*'='*/) {
            step = 1;
          } else {
            return Parser.done(output.bind());
          }
        } else if (!input.isEmpty()) {
          if (!base64.isPadded()) {
            base64.writeQuantum(p, q, r, 61/*'='*/, output);
            return Parser.done(output.bind());
          } else {
            return Parser.error(Diagnostic.unexpected(input));
          }
        }
      } else if (step === 5) {
        if (input.isCont() && (c = input.head(), c === 61/*'='*/)) {
          input = input.step();
          base64.writeQuantum(p, q, r, c, output);
          r = 0;
          q = 0;
          p = 0;
          return Parser.done(output.bind());
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected(61/*'='*/, input));
        }
      }
    }
    return new Base64Parser<O>(output, base64, p, q, r, step);
  }
}
