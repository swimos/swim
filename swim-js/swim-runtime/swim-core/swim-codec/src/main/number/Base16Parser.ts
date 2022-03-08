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
import {Base16} from "./Base16";

/** @internal */
export class Base16Parser<O> extends Parser<O> {
  /** @internal */
  readonly output: Output<O>;
  /** @internal */
  readonly p: number;
  /** @internal */
  readonly step: number;

  constructor(output: Output<O>, p: number = 0, step: number = 1) {
    super();
    this.output = output;
    this.p = p;
    this.step = step;
  }

  override feed(input: Input): Parser<O> {
    return Base16Parser.parse(input, this.output.clone(), this.p, this.step);
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
          output = Base16.writeQuantum(output, p, c);
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
