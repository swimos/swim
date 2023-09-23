// Copyright 2015-2023 Nstream, inc.
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

import {Diagnostic} from "@swim/codec";
import type {Builder} from "@swim/util";
import type {Input} from "@swim/codec";
import {Parser} from "@swim/codec";
import {Recon} from "../Recon";
import type {ReconParser} from "./ReconParser";

/** @internal */
export class LiteralParser<I, V> extends Parser<V> {
  private readonly recon: ReconParser<I, V>;
  private readonly builder: Builder<I, V> | undefined;
  private readonly valueParser: Parser<V> | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconParser<I, V>, builder?: Builder<I, V>,
              valueParser?: Parser<V>, step?: number) {
    super();
    this.recon = recon;
    this.builder = builder;
    this.valueParser = valueParser;
    this.step = step;
  }

  override feed(input: Input): Parser<V> {
    return LiteralParser.parse(input, this.recon, this.builder, this.valueParser, this.step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, builder?: Builder<I, V>,
                     valueParser?: Parser<V>, step: number = 1): Parser<V> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Recon.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 40/*'('*/) {
          input = input.step();
          step = 4;
        } else if (c === 123/*'{'*/) {
          builder = builder || recon.recordBuilder();
          valueParser = recon.parseRecord(input, builder);
          step = 3;
        } else if (c === 91/*'['*/) {
          builder = builder || recon.recordBuilder();
          valueParser = recon.parseMarkup(input, builder);
          step = 3;
        } else if (Recon.isIdentStartChar(c)) {
          valueParser = recon.parseIdent(input);
          step = 2;
        } else if (c === 34/*'"'*/ || c === 39/*'\''*/) {
          valueParser = recon.parseString(input);
          step = 2;
        } else if (c === 96/*'`'*/) {
          valueParser = recon.parseRawString(input);
          step = 2;
        } else if (c === 45/*'-'*/ || c >= 48/*'0'*/ && c <= 57/*'9'*/) {
          valueParser = recon.parseNumber(input);
          step = 2;
        } else if (c === 37/*'%'*/) {
          valueParser = recon.parseData(input);
          step = 2;
        } else if (c === 36/*'$'*/) {
          valueParser = recon.parseSelector(input);
          step = 2;
        } else if (builder === void 0) {
          return Parser.done(recon.extant());
        } else {
          return Parser.done(builder.build());
        }
      } else if (input.isDone()) {
        if (builder === void 0) {
          return Parser.done(recon.extant());
        } else {
          return Parser.done(builder.build());
        }
      }
    }
    if (step === 2) {
      while (valueParser!.isCont() && !input.isEmpty()) {
        valueParser = valueParser!.feed(input);
      }
      if (valueParser!.isDone()) {
        builder = builder || recon.valueBuilder();
        builder.push(recon.item(valueParser!.bind()));
        return Parser.done(builder.build());
      } else if (valueParser!.isError()) {
        return valueParser!.asError();
      }
    }
    if (step === 3) {
      while (valueParser!.isCont() && !input.isEmpty()) {
        valueParser = valueParser!.feed(input);
      }
      if (valueParser!.isDone()) {
        return Parser.done(builder!.build());
      } else if (valueParser!.isError()) {
        return valueParser!.asError();
      }
    }
    if (step === 4) {
      if (valueParser === void 0) {
        valueParser = recon.parseBlockExpression(input);
      }
      while (valueParser.isCont() && !input.isEmpty()) {
        valueParser = valueParser.feed(input);
      }
      if (valueParser.isDone()) {
        step = 5;
      } else if (valueParser.isError()) {
        return valueParser.asError();
      }
    }
    if (step === 5) {
      while (input.isCont() && (c = input.head(), Recon.isWhitespace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 41/*')'*/) {
          input = input.step();
          builder = builder || recon.valueBuilder();
          builder.push(recon.item(valueParser!.bind()));
          return Parser.done(builder.build());
        } else {
          return Parser.error(Diagnostic.expected(41/*')'*/, input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected(41/*')'*/, input));
      }
    }
    return new LiteralParser<I, V>(recon, builder, valueParser, step);
  }
}
