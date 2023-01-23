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
import type {ColorStop} from "./ColorStop";
import {ColorStopListParser} from "./ColorStopListParser";
import {LinearGradientAngle, LinearGradient} from "./LinearGradient";
import {LinearGradientAngleParser} from "./LinearGradientAngleParser";

/** @internal */
export class LinearGradientParser extends Parser<LinearGradient> {
  private readonly identOutput: Output<string> | undefined;
  private readonly angleParser: Parser<LinearGradientAngle> | undefined;
  private readonly stopsParser: Parser<ColorStop[]> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, angleParser?: Parser<LinearGradientAngle>,
              stopsParser?: Parser<ColorStop[]>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.angleParser = angleParser;
    this.stopsParser = stopsParser;
    this.step = step;
  }

  override feed(input: Input): Parser<LinearGradient> {
    return LinearGradientParser.parse(input, this.identOutput, this.angleParser,
                                      this.stopsParser, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, angleParser?: Parser<LinearGradientAngle>,
               stopsParser?: Parser<ColorStop[]>, step: number = 1): Parser<LinearGradient> {
    let c = 0;
    if (step === 1) {
      if (identOutput === void 0) {
        identOutput = Unicode.stringOutput();
      }
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c) || c === 45/*'-'*/)) {
        input = input.step();
        identOutput.write(c);
      }
      if (!input.isEmpty()) {
        const ident = identOutput.bind();
        if (ident === "linear-gradient") {
          identOutput = void 0;
          step = 2;
        } else {
          return Parser.error(Diagnostic.message("unexpected " + ident, input));
        }
      }
    }
    if (step === 2) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont() && c === 40/*'('*/) {
        input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("(", input));
      }
    }
    if (step === 3) {
      if (angleParser === void 0) {
        angleParser = LinearGradientAngleParser.parse(input);
      } else {
        angleParser = angleParser.feed(input);
      }
      if (angleParser !== void 0) {
        if (angleParser.isDone()) {
          step = 4;
        } else if (angleParser.isError()) {
          return angleParser.asError();
        }
      }
    }
    if (step === 4) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont() && c === 44/*','*/) {
        input = input.step();
        step = 5;
      } else {
        return Parser.error(Diagnostic.expected("color stops", input));
      }
    }
    if (step === 5) {
      if (stopsParser === void 0) {
        stopsParser = ColorStopListParser.parse(input);
      } else {
        stopsParser = stopsParser.feed(input);
      }
      if (stopsParser !== void 0) {
        if (stopsParser.isDone()) {
          step = 6;
        } else if (stopsParser.isError()) {
          return stopsParser.asError();
        }
      }
    }
    if (step === 6) {
      while (input.isCont() && Unicode.isSpace(input.head())) {
        input.step();
      }
      if (input.isCont() && input.head() === 41/*')'*/) {
        input.step();
        return Parser.done(new LinearGradient(angleParser!.bind(), stopsParser!.bind()));
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    return new LinearGradientParser(identOutput, angleParser, stopsParser, step);
  }

  /** @internal */
  static parseRest(input: Input, identOutput?: Output<string>): Parser<LinearGradient> {
    return LinearGradientParser.parse(input, identOutput, void 0, void 0, 2);
  }
}
