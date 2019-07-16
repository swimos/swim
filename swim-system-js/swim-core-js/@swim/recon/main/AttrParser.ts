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

import {Input, Parser, Diagnostic} from "@swim/codec";
import {Recon} from "./Recon";
import {ReconParser} from "./ReconParser";

/** @hidden */
export class AttrParser<I, V> extends Parser<I> {
  private readonly _recon: ReconParser<I, V>;
  private readonly _keyParser: Parser<V> | undefined;
  private readonly _valueParser: Parser<V> | undefined;
  private readonly _step: number | undefined;

  constructor(recon: ReconParser<I, V>, keyParser?: Parser<V>,
              valueParser?: Parser<V>, step?: number) {
    super();
    this._recon = recon;
    this._keyParser = keyParser;
    this._valueParser = valueParser;
    this._step = step;
  }

  feed(input: Input): Parser<I> {
    return AttrParser.parse(input, this._recon, this._keyParser,
                            this._valueParser, this._step);
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
      if (!keyParser) {
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
      if (keyParser) {
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
      if (!valueParser) {
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
