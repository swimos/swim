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

import {Input, Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import type {Length} from "../length/Length";
import {PxLength} from "../length/PxLength";
import {LengthParser} from "../length/LengthParser";
import {TranslateTransform} from "./TranslateTransform";

/** @internal */
export class TranslateTransformParser extends Parser<TranslateTransform> {
  private readonly identOutput: Output<string> | undefined;
  private readonly xParser: Parser<Length> | undefined;
  private readonly yParser: Parser<Length> | undefined;
  private readonly zParser: Parser<Length> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, xParser?: Parser<Length>,
              yParser?: Parser<Length>, zParser?: Parser<Length>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.xParser = xParser;
    this.yParser = yParser;
    this.zParser = zParser;
    this.step = step;
  }

  override feed(input: Input): Parser<TranslateTransform> {
    return TranslateTransformParser.parse(input, this.identOutput, this.xParser,
                                          this.yParser, this.zParser, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, xParser?: Parser<Length>,
               yParser?: Parser<Length>, zParser?: Parser<Length>,
               step: number = 1): Parser<TranslateTransform> {
    let c = 0;
    if (step === 1) {
      identOutput = identOutput || Unicode.stringOutput();
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c) || Unicode.isDigit(c) || c === 45/*'-'*/)) {
        input = input.step();
        identOutput.write(c);
      }
      if (!input.isEmpty()) {
        const ident = identOutput.bind();
        switch (ident) {
          case "translate3d":
          case "translateX":
          case "translateY":
          case "translate": step = 2; break;
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
          xParser = LengthParser.parse(input, "px");
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
            case "translateX": return Parser.done(new TranslateTransform(xParser!.bind(), PxLength.zero()));
            case "translateY": return Parser.done(new TranslateTransform(PxLength.zero(), xParser!.bind()));
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
          yParser = LengthParser.parse(input, "px");
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
      if (input.isCont()) {
        c = input.head();
        if (c === 41/*')'*/) {
          input.step();
          const ident = identOutput!.bind();
          switch (ident) {
            case "translate": return Parser.done(new TranslateTransform(xParser!.bind(), yParser!.bind()));
            default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
          }
        } else if (c === 44/*','*/) {
          input.step();
          step = 7;
        } else {
          return Parser.error(Diagnostic.expected(",", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 7) {
      if (zParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input.step();
        }
        if (!input.isEmpty()) {
          zParser = LengthParser.parse(input, "px");
        }
      } else {
        zParser = zParser.feed(input);
      }
      if (zParser !== void 0) {
        if (zParser.isDone()) {
          step = 8;
        } else if (zParser.isError()) {
          return zParser.asError();
        }
      }
    }
    if (step === 8) {
      while (input.isCont() && Unicode.isSpace(input.head())) {
        input.step();
      }
      if (input.isCont() && input.head() === 41/*')'*/) {
        input.step();
        const ident = identOutput!.bind();
        switch (ident) {
          case "translate3d":
            if (zParser!.bind().value === 0) {
              return Parser.done(new TranslateTransform(xParser!.bind(), yParser!.bind()));
            }
          default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    return new TranslateTransformParser(identOutput, xParser, yParser, zParser, step);
  }

  /** @internal */
  static parseRest(input: Input, identOutput?: Output<string>): Parser<TranslateTransform> {
    return TranslateTransformParser.parse(input, identOutput, void 0, void 0, void 0, 2);
  }
}
