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

import {Input, Parser, Diagnostic, Base64} from "@swim/codec";
import type {ReconParser} from "./ReconParser";

/** @internal */
export class DataParser<I, V> extends Parser<V> {
  private readonly recon: ReconParser<I, V>;
  private readonly base64Parser: Parser<V> | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconParser<I, V>, base64Parser?: Parser<V>, step?: number) {
    super();
    this.recon = recon;
    this.base64Parser = base64Parser;
    this.step = step;
  }

  override feed(input: Input): Parser<V> {
    return DataParser.parse(input, this.recon, this.base64Parser, this.step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>,
                     base64Parser?: Parser<V>, step: number = 1): Parser<V> {
    let c = 0;
    if (step === 1) {
      if (input.isCont()) {
        c = input.head();
        if (c === 37/*'%'*/) {
          input = input.step();
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected(37/*'%'*/, input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected(37/*'%'*/, input));
      }
    }
    if (step === 2) {
      if (base64Parser === void 0) {
        base64Parser = Base64.standard().parse(input, recon.dataOutput());
      }
      while (base64Parser.isCont() && !input.isEmpty()) {
        base64Parser = base64Parser.feed(input);
      }
      if (base64Parser.isDone()) {
        return base64Parser;
      } else if (base64Parser.isError()) {
        return base64Parser;
      }
    }
    return new DataParser<I, V>(recon, base64Parser, step);
  }
}
