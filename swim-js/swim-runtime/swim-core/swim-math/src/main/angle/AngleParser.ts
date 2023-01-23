// Copyright 2015-2023 Swim.inc
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
import {AngleUnits, Angle} from "./Angle";

/** @internal */
export class AngleParser extends Parser<Angle> {
  private readonly defaultUnits: AngleUnits | undefined;
  private readonly valueParser: Parser<number> | undefined;
  private readonly unitsOutput: Output<string> | undefined;
  private readonly step: number | undefined;

  constructor(defaultUnits?: AngleUnits, valueParser?: Parser<number>,
              unitsOutput?: Output<string>, step?: number) {
    super();
    this.defaultUnits = defaultUnits;
    this.valueParser = valueParser;
    this.unitsOutput = unitsOutput;
    this.step = step;
  }

  override feed(input: Input): Parser<Angle> {
    return AngleParser.parse(input, this.defaultUnits, this.valueParser,
                             this.unitsOutput, this.step);
  }

  static parse(input: Input, defaultUnits?: AngleUnits, valueParser?: Parser<number>,
               unitsOutput?: Output<string>, step: number = 1): Parser<Angle> {
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
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
        input = input.step();
        unitsOutput.push(c);
      }
      if (!input.isEmpty()) {
        const value = valueParser!.bind();
        const units = unitsOutput.bind() || defaultUnits;
        switch (units) {
          case "deg": return Parser.done(Angle.deg(value));
          case "":
          case "rad": return Parser.done(Angle.rad(value));
          case "grad": return Parser.done(Angle.grad(value));
          case "turn": return Parser.done(Angle.turn(value));
          default: return Parser.error(Diagnostic.message("unknown units: " + units, input));
        }
      }
    }
    return new AngleParser(defaultUnits, valueParser, unitsOutput, step);
  }
}
