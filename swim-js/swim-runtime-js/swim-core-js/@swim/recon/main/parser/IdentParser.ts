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

import {Input, Output, Parser, Diagnostic} from "@swim/codec";
import {Recon} from "../Recon";
import type {ReconParser} from "./ReconParser";

/** @hidden */
export class IdentParser<I, V> extends Parser<V> {
  private readonly recon: ReconParser<I, V>;
  private readonly output: Output<V> | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconParser<I, V>, output?: Output<V>, step?: number) {
    super();
    this.recon = recon;
    this.output = output;
    this.step = step;
  }

  override feed(input: Input): Parser<V> {
    return IdentParser.parse(input, this.recon, this.output, this.step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, output?: Output<V>,
                     step: number = 1): Parser<V> {
    let c = 0;
    if (step === 1) {
      if (input.isCont()) {
        c = input.head();
        if (Recon.isIdentStartChar(c)) {
          input = input.step();
          output = output || recon.textOutput();
          output = output.write(c);
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("identifier", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("identifier", input));
      }
    }
    if (step === 2) {
      while (input.isCont() && (c = input.head(), Recon.isIdentChar(c))) {
        input = input.step();
        output!.write(c);
      }
      if (!input.isEmpty()) {
        return Parser.done(recon.ident(output!.bind()));
      }
    }
    return new IdentParser<I, V>(recon, output, step);
  }
}
