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
import {DegAngle} from "../angle/DegAngle";
import {AngleParser} from "../angle/AngleParser";
import {SkewTransform} from "./SkewTransform";

/** @internal */
export class SkewTransformParser extends Parser<SkewTransform> {
  private readonly identOutput: Output<string> | undefined;
  private readonly xParser: Parser<Angle> | undefined;
  private readonly yParser: Parser<Angle> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, xParser?: Parser<Angle>,
              yParser?: Parser<Angle>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.xParser = xParser;
    this.yParser = yParser;
    this.step = step;
  }

  override feed(input: Input): Parser<SkewTransform> {
    return SkewTransformParser.parse(input, this.identOutput, this.xParser, this.yParser, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, xParser?: Parser<Angle>,
               yParser?: Parser<Angle>, step: number = 1): Parser<SkewTransform> {
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
          case "skewX":
          case "skewY":
          case "skew": step = 2; break;
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
      if (xParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input.step();
        }
        if (!input.isEmpty()) {
          xParser = AngleParser.parse(input, "deg");
        }
      } else {
        xParser = xParser.feed(input);
      }
      if (xParser !== void 0) {
        if (xParser.isDone()) {
          step = 4;
        } else if (xParser.isError()) {
          return xParser.asError();
        }
      }
    }
    if (step === 4) {
      while (input.isCont() && Unicode.isSpace(input.head())) {
        input.step();
      }
      if (input.isCont()) {
        c = input.head();
        if (c === 41/*')'*/) {
          input.step();
          const ident = identOutput!.bind();
          switch (ident) {
            case "skewX": return Parser.done(new SkewTransform(xParser!.bind(), DegAngle.zero()));
            case "skewY": return Parser.done(new SkewTransform(DegAngle.zero(), xParser!.bind()));
            default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
          }
        } else if (c === 44/*','*/) {
          input.step();
          step = 5;
        } else {
          return Parser.error(Diagnostic.expected(",", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 5) {
      if (yParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input.step();
        }
        if (!input.isEmpty()) {
          yParser = AngleParser.parse(input, "deg");
        }
      } else {
        yParser = yParser.feed(input);
      }
      if (yParser !== void 0) {
        if (yParser.isDone()) {
          step = 6;
        } else if (yParser.isError()) {
          return yParser.asError();
        }
      }
    }
    if (step === 6) {
      while (input.isCont() && Unicode.isSpace(input.head())) {
        input.step();
      }
      if (input.isCont() && input.head() === 41/*')'*/) {
        input.step();
        const ident = identOutput!.bind();
        switch (ident) {
          case "skew": return Parser.done(new SkewTransform(xParser!.bind(), yParser!.bind()));
          default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    return new SkewTransformParser(identOutput, xParser, yParser, step);
  }

  /** @internal */
  static parseRest(input: Input, identOutput?: Output<string>): Parser<SkewTransform> {
    return SkewTransformParser.parse(input, identOutput, void 0, void 0, 2);
  }
}
