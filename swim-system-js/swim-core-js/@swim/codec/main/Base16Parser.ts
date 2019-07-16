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
import {Base16} from "./Base16";

/** @hidden */
export class Base16Parser<O> extends Parser<O> {
  /** @hidden */
  readonly _output: Output<O>;
  /** @hidden */
  readonly _p: number;
  /** @hidden */
  readonly _step: number;

  constructor(output: Output<O>, p: number = 0, step: number = 1) {
    super();
    this._output = output;
    this._p = p;
    this._step = step;
  }

  feed(input: Input): Parser<O> {
    return Base16Parser.parse(input, this._output.clone(), this._p, this._step);
  }

  static parse<O>(input: Input, output: Output<O>, p: number = 0, step: number = 1): Parser<O> {
    let c = 0;
    while (!input.isEmpty()) {
      if (step === 1) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          p = c;
          step = 2;
        } else if (!input.isEmpty()) {
          return Parser.done(output.bind());
        }
      }
      if (step === 2) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          Base16.writeQuantum(p, c, output);
          p = 0;
          step = 1;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("base16 digit", input));
        }
      }
    }
    return new Base16Parser<O>(output, p, step);
  }
}
Base16.Parser = Base16Parser;
