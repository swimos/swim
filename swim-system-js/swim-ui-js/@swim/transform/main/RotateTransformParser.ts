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

import {Input, Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import {Angle, AngleParser} from "@swim/angle";
import {Transform} from "./Transform";
import {RotateTransform} from "./RotateTransform";

/** @hidden */
export class RotateTransformParser extends Parser<RotateTransform> {
  private readonly identOutput: Output<string> | undefined;
  private readonly aParser: Parser<Angle> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, aParser?: Parser<Angle>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.aParser = aParser;
    this.step = step;
  }

  feed(input: Input): Parser<RotateTransform> {
    return RotateTransformParser.parse(input, this.identOutput, this.aParser, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, aParser?: Parser<Angle>,
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
      if (!aParser) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input.step();
        }
        if (!input.isEmpty()) {
          aParser = AngleParser.parse(input, "deg");
        }
      } else {
        aParser = aParser.feed(input);
      }
      if (aParser) {
        if (aParser.isDone()) {
          step = 4;
        } else if (aParser.isError()) {
          return aParser.asError();
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
          case "rotate": return Parser.done(Transform.rotate(aParser!.bind()));
          default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    return new RotateTransformParser(identOutput, aParser, step);
  }

  /** @hidden */
  static parseRest(input: Input, identOutput?: Output<string>): Parser<RotateTransform> {
    return RotateTransformParser.parse(input, identOutput, void 0, 2);
  }
}
Transform.RotateParser = RotateTransformParser;
