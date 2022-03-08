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

import type {Builder} from "@swim/util";
import {Input, Parser, Diagnostic} from "@swim/codec";
import {Recon} from "../Recon";
import type {ReconParser} from "./ReconParser";

/** @internal */
export class SelectorParser<I, V> extends Parser<V> {
  private readonly recon: ReconParser<I, V>;
  private readonly builder: Builder<I, V> | undefined;
  private readonly selector: V | undefined;
  private readonly valueParser: Parser<V> | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconParser<I, V>, builder?: Builder<I, V>,
              selector?: V, valueParser?: Parser<V>, step?: number) {
    super();
    this.recon = recon;
    this.builder = builder;
    this.selector = selector;
    this.valueParser = valueParser;
    this.step = step;
  }

  override feed(input: Input): Parser<V> {
    return SelectorParser.parse(input, this.recon, this.builder,
                                this.selector, this.valueParser, this.step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, builder?: Builder<I, V>,
                     selector?: V, valueParser?: Parser<V>, step: number = 1): Parser<V> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Recon.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont() && c === 36/*'$'*/) {
        input = input.step();
        selector = selector || recon.selector();
        step = 2;
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected(36/*'$'*/, input));
      }
    }
    if (step === 2) {
      if (input.isCont()) {
        c = input.head();
        if (c === 91/*'['*/) {
          input = input.step();
          step = 8;
        } else if (c === 64/*'@'*/) {
          input = input.step();
          step = 7;
        } else if (c === 58/*':'*/) {
          input = input.step();
          step = 6;
        } else if (c === 42/*'*'*/) {
          input = input.step();
          step = 5;
        } else if (c === 35/*'#'*/) {
          input = input.step();
          step = 4;
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    do {
      if (step === 3) {
        if (valueParser === void 0) {
          valueParser = recon.parseLiteral(input, recon.valueBuilder());
        }
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          selector = recon.get(selector!, valueParser.bind());
          valueParser = void 0;
          step = 10;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      if (step === 4) {
        if (valueParser === void 0) {
          valueParser = recon.parseInteger(input);
        }
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          selector = recon.value(recon.getItem(selector!, valueParser.bind()));
          valueParser = void 0;
          step = 10;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      if (step === 5) {
        if (input.isCont()) {
          c = input.head();
          if (c === 58/*':'*/) {
            input = input.step();
            selector = recon.keys(selector!);
            step = 10;
          } else if (c === 42/*'*'*/) {
            input = input.step();
            selector = recon.descendants(selector!);
            step = 10;
          } else {
            selector = recon.children(selector!);
            step = 10;
          }
        } else if (input.isDone()) {
          selector = recon.children(selector!);
          step = 10;
        }
      }
      if (step === 6) {
        if (input.isCont()) {
          c = input.head();
          if (c === 42/*'*'*/) {
            input = input.step();
            selector = recon.values(selector!);
            step = 10;
          } else {
            return Parser.error(Diagnostic.expected(42/*'*'*/, input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected(42/*'*'*/, input));
        }
      }
      if (step === 7) {
        if (valueParser === void 0) {
          valueParser = recon.parseIdent(input);
        }
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          selector = recon.getAttr(selector!, valueParser.bind());
          valueParser = void 0;
          step = 10;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      if (step === 8) {
        if (valueParser === void 0) {
          valueParser = recon.parseBlockExpression(input);
        }
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          step = 9;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      if (step === 9) {
        while (input.isCont() && (c = input.head(), Recon.isSpace(c))) {
          input = input.step();
        }
        if (input.isCont()) {
          if (c === 93/*']'*/) {
            input = input.step();
            selector = recon.filter(selector!, valueParser!.bind());
            valueParser = void 0;
            step = 10;
          } else {
            return Parser.error(Diagnostic.expected(93/*']'*/, input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected(93/*']'*/, input));
        }
      }
      if (step === 10) {
        if (input.isCont()) {
          c = input.head();
          if (c === 91/*'['*/) {
            input = input.step();
            step = 8;
            continue;
          } else if (c === 35/*'#'*/) {
            input = input.step();
            step = 4;
            continue;
          } else if (c === 46/*'.'*/) {
            input = input.step();
            step = 11;
          } else if (builder !== void 0) {
            builder.push(recon.item(selector!));
            return Parser.done(builder.bind());
          } else {
            return Parser.done(selector!);
          }
        } else if (input.isDone()) {
          if (builder !== void 0) {
            builder.push(recon.item(selector!));
            return Parser.done(builder.bind());
          } else {
            return Parser.done(selector!);
          }
        }
      }
      if (step === 11) {
        if (input.isCont()) {
          c = input.head();
          if (c === 64/*'@'*/) {
            input = input.step();
            step = 7;
            continue;
          } else if (c === 58/*':'*/) {
            input = input.step();
            step = 6;
            continue;
          } else if (c === 42/*'*'*/) {
            input = input.step();
            step = 5;
            continue;
          } else {
            step = 3;
            continue;
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      break;
    } while (true);
    return new SelectorParser<I, V>(recon, builder, selector, valueParser, step);
  }
}
