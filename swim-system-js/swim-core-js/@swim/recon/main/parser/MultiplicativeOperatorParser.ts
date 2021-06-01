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

import type {Builder} from "@swim/util";
import {Input, Parser, Diagnostic} from "@swim/codec";
import {Recon} from "../Recon";
import type {ReconParser} from "./ReconParser";

/** @hidden */
export class MultiplicativeOperatorParser<I, V> extends Parser<V> {
  private readonly recon: ReconParser<I, V>;
  private readonly builder: Builder<I, V> | undefined;
  private readonly lhsParser: Parser<V> | undefined;
  private readonly operator: string | undefined;
  private readonly rhsParser: Parser<V> | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconParser<I, V>, builder?: Builder<I, V>, lhsParser?: Parser<V>,
              operator?: string, rhsParser?: Parser<V>, step?: number) {
    super();
    this.recon = recon;
    this.builder = builder;
    this.lhsParser = lhsParser;
    this.operator = operator;
    this.rhsParser = rhsParser;
    this.step = step;
  }

  override feed(input: Input): Parser<V> {
    return MultiplicativeOperatorParser.parse(input, this.recon, this.builder, this.lhsParser,
                                              this.operator, this.rhsParser, this.step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, builder?: Builder<I, V>, lhsParser?: Parser<V>,
                     operator?: string, rhsParser?: Parser<V>, step: number = 1): Parser<V> {
    let c = 0;
    do {
      if (step === 1) {
        if (lhsParser === void 0) {
          lhsParser = recon.parsePrefixOperator(input, builder);
        }
        while (lhsParser.isCont() && !input.isEmpty()) {
          lhsParser = lhsParser.feed(input);
        }
        if (lhsParser.isDone()) {
          step = 2;
        } else if (lhsParser.isError()) {
          return lhsParser.asError();
        }
      }
      if (step === 2) {
        while (input.isCont() && (c = input.head(), Recon.isSpace(c))) {
          input = input.step();
        }
        if (input.isCont()) {
          if (c === 42/*'*'*/) {
            input = input.step();
            operator = "*";
            step = 3;
          } else if (c === 47/*'/'*/) {
            input = input.step();
            operator = "/";
            step = 3;
          } else if (c === 37/*'%'*/) {
            input = input.step();
            operator = "%";
            step = 3;
          } else {
            return lhsParser!;
          }
        } else if (input.isDone()) {
          return lhsParser!;
        }
      }
      if (step === 3) {
        if (rhsParser === void 0) {
          rhsParser = recon.parsePrefixOperator(input, builder);
        }
        while (rhsParser.isCont() && !input.isEmpty()) {
          rhsParser = rhsParser.feed(input);
        }
        if (rhsParser.isDone()) {
          const lhs = lhsParser!.bind();
          const rhs = rhsParser.bind();
          if (operator === "*") {
            lhsParser = Parser.done(recon.times(lhs, rhs));
          } else if (operator === "/") {
            lhsParser = Parser.done(recon.divide(lhs, rhs));
          } else if (operator === "%") {
            lhsParser = Parser.done(recon.modulo(lhs, rhs));
          } else {
            return Parser.error(Diagnostic.message(operator!, input));
          }
          rhsParser = void 0;
          operator = void 0;
          step = 2;
          continue;
        } else if (rhsParser.isError()) {
          return rhsParser.asError();
        }
      }
      break;
    } while (true);
    return new MultiplicativeOperatorParser<I, V>(recon, builder, lhsParser, operator, rhsParser, step);
  }
}
