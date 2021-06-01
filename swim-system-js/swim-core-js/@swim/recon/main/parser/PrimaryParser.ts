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
export class PrimaryParser<I, V> extends Parser<V> {
  private readonly recon: ReconParser<I, V>;
  private readonly builder: Builder<I, V> | undefined;
  private readonly exprParser: Parser<V> | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconParser<I, V>, builder?: Builder<I, V>,
              exprParser?: Parser<V>, step?: number) {
    super();
    this.recon = recon;
    this.builder = builder;
    this.exprParser = exprParser;
    this.step = step;
  }

  override feed(input: Input): Parser<V> {
    return PrimaryParser.parse(input, this.recon, this.builder,
                               this.exprParser, this.step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, builder?: Builder<I, V>,
                     exprParser?: Parser<V>, step: number = 1): Parser<V> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Recon.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 40/*'('*/) {
          input = input.step();
          step = 3;
        } else {
          step = 2;
        }
      } else if (input.isDone()) {
        step = 2;
      }
    }
    if (step === 2) {
      if (exprParser === void 0) {
        exprParser = recon.parseLiteral(input, builder);
      }
      while (exprParser.isCont() && !input.isEmpty()) {
        exprParser = exprParser.feed(input);
      }
      if (exprParser.isDone()) {
        return exprParser;
      } else if (exprParser.isError()) {
        return exprParser.asError();
      }
    }
    if (step === 3) {
      if (exprParser === void 0) {
        exprParser = recon.parseBlockExpression(input, builder);
      }
      while (exprParser.isCont() && !input.isEmpty()) {
        exprParser = exprParser.feed(input);
      }
      if (exprParser.isDone()) {
        step = 4;
      } else if (exprParser.isError()) {
        return exprParser.asError();
      }
    }
    do {
      if (step === 4) {
        while (input.isCont() && (c = input.head(), Recon.isSpace(c))) {
          input = input.step();
        }
        if (input.isCont()) {
          if (c === 44/*','*/) {
            input = input.step();
            if (exprParser !== void 0) {
              if (builder === void 0) {
                builder = recon.recordBuilder();
                builder.push(recon.item(exprParser.bind()));
              }
              exprParser = void 0;
            }
            step = 5;
          } else if (c === 41/*')'*/) {
            input = input.step();
            if (exprParser !== void 0) {
              return exprParser;
            } else {
              return Parser.done(builder!.bind());
            }
          } else {
            return Parser.error(Diagnostic.expected(41/*')'*/, input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected(41/*')'*/, input));
        }
      }
      if (step === 5) {
        if (exprParser === void 0) {
          exprParser = recon.parseBlockExpression(input, builder);
        }
        while (exprParser.isCont() && !input.isEmpty()) {
          exprParser = exprParser.feed(input);
        }
        if (exprParser.isDone()) {
          exprParser = void 0;
          step = 4;
          continue;
        } else if (exprParser.isError()) {
          return exprParser.asError();
        }
      }
      break;
    } while (true);
    return new PrimaryParser<I, V>(recon, builder, exprParser, step);
  }
}
