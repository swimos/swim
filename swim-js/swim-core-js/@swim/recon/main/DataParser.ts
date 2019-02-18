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

import {Input, Parser, Diagnostic, Base64} from "@swim/codec";
import {ReconParser} from "./ReconParser";

/** @hidden */
export class DataParser<I, V> extends Parser<V> {
  private readonly _recon: ReconParser<I, V>;
  private readonly _base64Parser: Parser<V> | undefined;
  private readonly _step: number | undefined;

  constructor(recon: ReconParser<I, V>, base64Parser?: Parser<V>, step?: number) {
    super();
    this._recon = recon;
    this._base64Parser = base64Parser;
    this._step = step;
  }

  feed(input: Input): Parser<V> {
    return DataParser.parse(input, this._recon, this._base64Parser, this._step);
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
      if (!base64Parser) {
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
