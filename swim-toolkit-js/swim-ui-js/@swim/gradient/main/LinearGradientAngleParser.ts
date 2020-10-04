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

import {Input, Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import {Angle, AngleParser} from "@swim/angle";
import {LinearGradientAngle, LinearGradientSide, LinearGradient} from "./LinearGradient";

/** @hidden */
export class LinearGradientAngleParser extends Parser<LinearGradientAngle> {
  private readonly identOutput: Output<string> | undefined;
  private readonly angleParser: Parser<Angle> | undefined;
  private readonly side: LinearGradientSide | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, angleParser?: Parser<Angle>,
              side?: LinearGradientSide, step?: number) {
    super();
    this.identOutput = identOutput;
    this.angleParser = angleParser;
    this.side = side;
    this.step = step;
  }

  feed(input: Input): Parser<LinearGradientAngle> {
    return LinearGradientAngleParser.parse(input, this.identOutput, this.angleParser,
                                           this.side, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, angleParser?: Parser<Angle>,
               side?: LinearGradientSide, step: number = 1): Parser<LinearGradientAngle> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input.step();
      }
      if (input.isCont()) {
        if (c === 45/*'-'*/ || c === 46/*'.'*/ || c >= 48/*'0'*/ && c <= 57/*'9'*/) {
          step = 2;
        } else {
          step = 3;
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 2) {
      if (angleParser === void 0) {
        angleParser = AngleParser.parse(input, "deg");
      } else {
        angleParser = angleParser.feed(input);
      }
      if (angleParser !== void 0) {
        if (angleParser.isDone()) {
          return angleParser;
        } else if (angleParser.isError()) {
          return angleParser.asError();
        }
      }
    }
    if (step === 3) {
      if (identOutput === void 0) {
        identOutput = Unicode.stringOutput();
      }
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
        input = input.step();
        identOutput.write(c);
      }
      if (!input.isEmpty()) {
        const ident = identOutput.bind();
        if (ident === "to") {
          identOutput = void 0;
          step = 4;
        } else {
          return Parser.error(Diagnostic.message("unexpected " + ident, input));
        }
      }
    }
    if (step === 4) {
      if (input.isCont()) {
        if (Unicode.isSpace(input.head())) {
          input.step();
          step = 5;
        } else {
          return Parser.error(Diagnostic.expected("side or corner", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 5) {
      if (identOutput === void 0) {
        identOutput = Unicode.stringOutput();
      }
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
        input = input.step();
        identOutput.write(c);
      }
      if (!input.isEmpty()) {
        const ident = identOutput.bind();
        identOutput = void 0;
        switch (ident) {
          case "left":
          case "right":
            side = ident;
            step = 6;
            break;
          case "top":
          case "bottom":
            side = ident;
            step = 7;
            break;
          default: return Parser.error(Diagnostic.message("unknown side: " + ident, input));
        }
      }
    }
    if (step === 6) {
      if (identOutput === void 0) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input = input.step();
        }
        if (input.isCont() && Unicode.isAlpha(c)) {
          identOutput = Unicode.stringOutput();
        } else if (!input.isEmpty()) {
          return Parser.done(side!);
        }
      }
      if (identOutput !== void 0) {
        while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
          input = input.step();
          identOutput.write(c);
        }
        if (!input.isEmpty()) {
          const ident = identOutput.bind();
          identOutput = void 0;
          switch (ident) {
            case "top":
            case "bottom": return Parser.done([side as "left" | "right", ident]);
            default: return Parser.error(Diagnostic.message("unknown side: " + ident, input));
          }
        }
      }
    }
    if (step === 7) {
      if (identOutput === void 0) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input = input.step();
        }
        if (input.isCont() && Unicode.isAlpha(c)) {
          identOutput = Unicode.stringOutput();
        } else if (!input.isEmpty()) {
          return Parser.done(side!);
        }
      }
      if (identOutput !== void 0) {
        while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
          input = input.step();
          identOutput.write(c);
        }
        if (!input.isEmpty()) {
          const ident = identOutput.bind();
          identOutput = void 0;
          switch (ident) {
            case "left":
            case "right": return Parser.done([side as "top" | "bottom", ident])
            default: return Parser.error(Diagnostic.message("unknown side: " + ident, input));
          }
        }
      }
    }
    return new LinearGradientAngleParser(identOutput, angleParser, side, step);
  }
}
LinearGradient.AngleParser = LinearGradientAngleParser;
