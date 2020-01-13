// Copyright 2015-2020 SWIM.AI inc.
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

import {Builder} from "@swim/util";
import {Input, Parser, Diagnostic} from "@swim/codec";
import {Recon} from "./Recon";
import {ReconParser} from "./ReconParser";

/** @hidden */
export class ConditionalOperatorParser<I, V> extends Parser<V> {
  private readonly _recon: ReconParser<I, V>;
  private readonly _builder: Builder<I, V> | undefined;
  private readonly _ifParser: Parser<V> | undefined;
  private readonly _thenParser: Parser<V> | undefined;
  private readonly _elseParser: Parser<V> | undefined;
  private readonly _step: number | undefined;

  constructor(recon: ReconParser<I, V>, builder?: Builder<I, V>, ifParser?: Parser<V>,
              thenParser?: Parser<V>, elseParser?: Parser<V>, step?: number) {
    super();
    this._recon = recon;
    this._builder = builder;
    this._ifParser = ifParser;
    this._thenParser = thenParser;
    this._elseParser = elseParser;
    this._step = step;
  }

  feed(input: Input): Parser<V> {
    return ConditionalOperatorParser.parse(input, this._recon, this._builder, this._ifParser,
                                           this._thenParser, this._elseParser, this._step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, builder?: Builder<I, V>,
                     ifParser?: Parser<V>, thenParser?: Parser<V>,
                     elseParser?: Parser<V>, step: number = 1): Parser<V> {
    let c = 0;
    if (step === 1) {
      if (!ifParser) {
        ifParser = recon.parseOrOperator(input, builder);
      }
      while (ifParser.isCont() && !input.isEmpty()) {
        ifParser = ifParser.feed(input);
      }
      if (ifParser.isDone()) {
        step = 2;
      } else if (ifParser.isError()) {
        return ifParser.asError();
      }
    }
    if (step === 2) {
      while (input.isCont() && (c = input.head(), Recon.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 63/*'?'*/) {
          input = input.step();
          step = 3;
        } else {
          return ifParser!;
        }
      } else if (input.isDone()) {
        return ifParser!;
      }
    }
    if (step === 3) {
      if (!thenParser) {
        thenParser = recon.parseConditionalOperator(input, builder);
      }
      while (thenParser.isCont() && !input.isEmpty()) {
        thenParser = thenParser.feed(input);
      }
      if (thenParser.isDone()) {
        step = 4;
      } else if (thenParser.isError()) {
        return thenParser.asError();
      }
    }
    if (step === 4) {
      while (input.isCont() && (c = input.head(), Recon.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 58/*':'*/) {
          input = input.step();
          step = 5;
        } else {
          return Parser.error(Diagnostic.expected(58/*':'*/, input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected(58/*':'*/, input));
      }
    }
    if (step === 5) {
      if (!elseParser) {
        elseParser = recon.parseConditionalOperator(input, builder);
      }
      while (elseParser.isCont() && !input.isEmpty()) {
        elseParser = elseParser.feed(input);
      }
      if (elseParser.isDone()) {
        const ifTerm = ifParser!.bind();
        const thenTerm = thenParser!.bind();
        const elseTerm = elseParser.bind();
        return Parser.done(recon.conditional(ifTerm, thenTerm, elseTerm));
      } else if (elseParser.isError()) {
        return elseParser.asError();
      }
    }
    return new ConditionalOperatorParser<I, V>(recon, builder, ifParser, thenParser, elseParser, step);
  }
}
