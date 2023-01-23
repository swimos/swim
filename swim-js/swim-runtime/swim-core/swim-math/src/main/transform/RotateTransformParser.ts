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
import type {Angle} from "../angle/Angle";
import {AngleParser} from "../angle/AngleParser";
import {RotateTransform} from "./RotateTransform";

/** @internal */
export class RotateTransformParser extends Parser<RotateTransform> {
  private readonly identOutput: Output<string> | undefined;
  private readonly angleParser: Parser<Angle> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, angleParser?: Parser<Angle>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.angleParser = angleParser;
    this.step = step;
  }

  override feed(input: Input): Parser<RotateTransform> {
    return RotateTransformParser.parse(input, this.identOutput, this.angleParser, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, angleParser?: Parser<Angle>,
               step: number = 1): Parser<RotateTransform> {
    let c = 0;
    if (step === 1) {
      identOutput = identOutput || Unicode.stringOutput();
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
        input = input.step();
        identOutput.write(c);
      }
      if (!input.isEmpty()) {
        const ident = identOutput.bind();
        switch (ident) {
          case "rotate": step = 2; break;
          default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
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
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input.step();
        }
        if (!input.isEmpty()) {
          angleParser = AngleParser.parse(input, "deg");
        }
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
      while (input.isCont() && Unicode.isSpace(input.head())) {
        input.step();
      }
      if (input.isCont() && input.head() === 41/*')'*/) {
        input.step();
        const ident = identOutput!.bind();
        switch (ident) {
          case "rotate": return Parser.done(new RotateTransform(angleParser!.bind()));
          default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    return new RotateTransformParser(identOutput, angleParser, step);
  }

  /** @internal */
  static parseRest(input: Input, identOutput?: Output<string>): Parser<RotateTransform> {
    return RotateTransformParser.parse(input, identOutput, void 0, 2);
  }
}
