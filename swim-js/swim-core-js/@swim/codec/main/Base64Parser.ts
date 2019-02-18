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

import {Input} from "./Input";
import {Output} from "./Output";
import {Parser} from "./Parser";
import {Diagnostic} from "./Diagnostic";
import {Base64} from "./Base64";

/** @hidden */
export class Base64Parser<O> extends Parser<O> {
  /** @hidden */
  readonly _output: Output<O>;
  /** @hidden */
  readonly _base64: Base64;
  /** @hidden */
  readonly _p: number;
  /** @hidden */
  readonly _q: number;
  /** @hidden */
  readonly _r: number;
  /** @hidden */
  readonly _step: number;

  constructor(output: Output<O>, base64: Base64, p: number = 0, q: number = 0,
              r: number = 0, step: number = 1) {
    super();
    this._output = output;
    this._base64 = base64;
    this._p = p;
    this._q = q;
    this._r = r;
    this._step = step;
  }

  feed(input: Input): Parser<O> {
    return Base64Parser.parse(input, this._output.clone(), this._base64,
                              this._p, this._q, this._r, this._step);
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
Base64.Parser = Base64Parser;
