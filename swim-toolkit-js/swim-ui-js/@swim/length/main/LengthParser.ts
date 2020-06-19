// Copyright 2015-2020 Swim inc.
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

import {Input, Output, Parser, Diagnostic, Unicode, Base10} from "@swim/codec";
import {LengthUnits, Length} from "./Length";

/** @hidden */
export class LengthParser extends Parser<Length> {
  private readonly _defaultUnits: LengthUnits | undefined;
  private readonly _node: Node | null;
  private readonly _valueParser: Parser<number> | undefined;
  private readonly _unitsOutput: Output<string> | undefined;
  private readonly _step: number | undefined;

  constructor(defaultUnits?: LengthUnits, node: Node | null = null,
              valueParser?: Parser<number>, unitsOutput?: Output<string>, step?: number) {
    super();
    this._defaultUnits = defaultUnits;
    this._node = node;
    this._valueParser = valueParser;
    this._unitsOutput = unitsOutput;
    this._step = step;
  }

  feed(input: Input): Parser<Length> {
    return LengthParser.parse(input, this._defaultUnits, this._node, this._valueParser,
                              this._unitsOutput, this._step);
  }

  static parse(input: Input, defaultUnits?: LengthUnits, node: Node | null = null,
               valueParser?: Parser<number>, unitsOutput?: Output<string>, step: number = 1): Parser<Length> {
    let c = 0;
    if (step === 1) {
      if (valueParser === void 0) {
        valueParser = Base10.parseDecimal(input);
      } else {
        valueParser = valueParser.feed(input);
      }
      if (valueParser.isDone()) {
        step = 2;
      } else if (valueParser.isError()) {
        return valueParser.asError();
      }
    }
    if (step === 2) {
      unitsOutput = unitsOutput || Unicode.stringOutput();
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c) || c === 37/*'%'*/)) {
        input = input.step();
        unitsOutput.push(c);
      }
      if (!input.isEmpty()) {
        const value = valueParser!.bind();
        const units = unitsOutput.bind() || defaultUnits;
        switch (units) {
          case "px": return Parser.done(Length.px(value, node));
          case "em": return Parser.done(Length.em(value, node));
          case "rem": return Parser.done(Length.rem(value, node));
          case "%": return Parser.done(Length.pct(value, node));
          case "":
          case void 0: return Parser.done(Length.unitless(value, node));
          default: return Parser.error(Diagnostic.message("unknown units: " + units, input));
        }
      }
    }
    return new LengthParser(defaultUnits, node, valueParser, unitsOutput, step);
  }
}
Length.Parser = LengthParser;
