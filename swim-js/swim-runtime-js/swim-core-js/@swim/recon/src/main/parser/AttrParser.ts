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

import {Input, Parser, Diagnostic} from "@swim/codec";
import {Recon} from "../Recon";
import type {ReconParser} from "./ReconParser";

/** @internal */
export class AttrParser<I, V> extends Parser<I> {
  private readonly recon: ReconParser<I, V>;
  private readonly keyParser: Parser<V> | undefined;
  private readonly valueParser: Parser<V> | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconParser<I, V>, keyParser?: Parser<V>,
              valueParser?: Parser<V>, step?: number) {
    super();
    this.recon = recon;
    this.keyParser = keyParser;
    this.valueParser = valueParser;
    this.step = step;
  }

  override feed(input: Input): Parser<I> {
    return AttrParser.parse(input, this.recon, this.keyParser,
                            this.valueParser, this.step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, keyParser?: Parser<V>,
                     valueParser?: Parser<V>, step: number = 1): Parser<I> {
    let c = 0;
    if (step === 1) {
      if (input.isCont()) {
        c = input.head();
        if (c === 64/*'@'*/) {
          input = input.step();
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected(64/*'@'*/, input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected(64/*'@'*/, input));
      }
    }
    if (step === 2) {
      if (keyParser === void 0) {
        if (input.isCont()) {
          c = input.head();
          if (c === 34/*'"'*/ || c === 39/*'\''*/) {
            keyParser = recon.parseString(input);
          } else if (Recon.isIdentStartChar(c)) {
            keyParser = recon.parseIdent(input);
          } else {
            return Parser.error(Diagnostic.expected("attribute name", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("attribute name", input));
        }
      } else {
        keyParser = keyParser.feed(input);
      }
      if (keyParser !== void 0) {
        if (keyParser.isDone()) {
          step = 3;
        } else if (keyParser.isError()) {
          return keyParser.asError();
        }
      }
    }
    if (step === 3) {
      if (input.isCont() && input.head() === 40/*'('*/) {
        input = input.step();
        step = 4;
      } else if (!input.isEmpty()) {
        return Parser.done(recon.attr(keyParser!.bind()));
      }
    }
    if (step === 4) {
      while (input.isCont() && (c = input.head(), Recon.isWhitespace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 41/*')'*/) {
          input = input.step();
          return Parser.done(recon.attr(keyParser!.bind()));
        } else {
          step = 5;
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    if (step === 5) {
      if (valueParser === void 0) {
        valueParser = recon.parseBlock(input);
      }
      while (valueParser.isCont() && !input.isEmpty()) {
        valueParser = valueParser.feed(input);
      }
      if (valueParser.isDone()) {
        step = 6;
      } else if (valueParser.isError()) {
        return valueParser.asError();
      }
    }
    if (step === 6) {
      while (input.isCont() && (c = input.head(), Recon.isWhitespace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 41/*')'*/) {
          input = input.step();
          return Parser.done(recon.attr(keyParser!.bind(), valueParser!.bind()));
        } else {
          return Parser.error(Diagnostic.expected(")", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    return new AttrParser<I, V>(recon, keyParser, valueParser, step);
  }
}
