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

import {Builder} from "@swim/util";
import {Input, Parser, Diagnostic} from "@swim/codec";
import {Recon} from "./Recon";
import {ReconParser} from "./ReconParser";

/** @hidden */
export class PrefixOperatorParser<I, V> extends Parser<V> {
  private readonly _recon: ReconParser<I, V>;
  private readonly _builder: Builder<I, V> | undefined;
  private readonly _operator: string | undefined;
  private readonly _operandParser: Parser<V> | undefined;
  private readonly _step: number | undefined;

  constructor(recon: ReconParser<I, V>, builder?: Builder<I, V>,
              operator?: string, rhsParser?: Parser<V>, step?: number) {
    super();
    this._recon = recon;
    this._builder = builder;
    this._operator = operator;
    this._operandParser = rhsParser;
    this._step = step;
  }

  feed(input: Input): Parser<V> {
    return PrefixOperatorParser.parse(input, this._recon, this._builder,
                                      this._operator, this._operandParser, this._step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, builder?: Builder<I, V>,
                     operator?: string, rhsParser?: Parser<V>, step: number = 1): Parser<V> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Recon.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 33/*'!'*/) {
          input = input.step();
          operator = "!";
        } else if (c === 126/*'~'*/) {
          input = input.step();
          operator = "~";
        } else if (c === 45/*'-'*/) {
          input = input.step();
          operator = "-";
        } else if (c === 43/*'+'*/) {
          input = input.step();
          operator = "+";
        } else {
          return recon.parseInvokeOperator(input, builder);
        }
        step = 2;
      } else if (input.isDone()) {
        return recon.parseInvokeOperator(input, builder);
      }
    }
    if (step === 2) {
      if (!rhsParser) {
        rhsParser = recon.parsePrefixOperator(input, builder);
      }
      while (rhsParser.isCont() && !input.isEmpty()) {
        rhsParser = rhsParser.feed(input);
      }
      if (rhsParser.isDone()) {
        const operand = rhsParser.bind();
        if (!recon.isDistinct(operand)) {
          return Parser.error(Diagnostic.expected("value", input));
        } else if (operator === "!") {
          return Parser.done(recon.not(operand));
        } else if (operator === "~") {
          return Parser.done(recon.bitwiseNot(operand));
        } else if (operator === "-") {
          return Parser.done(recon.negative(operand));
        } else if (operator === "+") {
          return Parser.done(recon.positive(operand));
        } else {
          return Parser.error(Diagnostic.message(operator!, input));
        }
      } else if (rhsParser.isError()) {
        return rhsParser.asError();
      }
    }
    return new PrefixOperatorParser<I, V>(recon, builder, operator, rhsParser, step);
  }
}
