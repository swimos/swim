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

import {Input, Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import {Color} from "./Color";
import {HexColorParser} from "../"; // forward import
import {RgbColorParser} from "../"; // forward import
import {HslColorParser} from "../"; // forward import

/** @internal */
export class ColorParser extends Parser<Color> {
  private readonly identOutput: Output<string> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.step = step;
  }

  override feed(input: Input): Parser<Color> {
    return ColorParser.parse(input, this.identOutput, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, step: number = 1): Parser<Color> {
    let c = 0;
    if (step === 1) {
      if (input.isCont()) {
        if (input.head() === 35/*'#'*/) {
          return HexColorParser.parse(input);
        } else {
          step = 2;
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 2) {
      identOutput = identOutput || Unicode.stringOutput();
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
        input = input.step();
        identOutput.write(c);
      }
      if (!input.isEmpty()) {
        const ident = identOutput.bind();
        switch (ident) {
          case "rgb":
          case "rgba": return RgbColorParser.parseRest(input);
          case "hsl":
          case "hsla": return HslColorParser.parseRest(input);
          default: {
            const color = Color.forName(ident);
            if (color !== null) {
              return Parser.done(color);
            } else {
              return Parser.error(Diagnostic.message("unknown color: " + ident, input));
            }
          }
        }
      }
    }
    return new ColorParser(identOutput, step);
  }
}
