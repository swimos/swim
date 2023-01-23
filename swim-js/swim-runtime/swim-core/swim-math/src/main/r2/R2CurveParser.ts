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

import {Input, Parser, Diagnostic, Unicode, Base10} from "@swim/codec";
import type {R2Curve} from "./R2Curve";
import {R2SegmentParser} from "../"; // forward import
import {R2QuadraticCurveParser} from "../"; // forward import
import {R2CubicCurveParser} from "../"; // forward import
import {R2EllipticCurveParser} from "../"; // forward import

/** @internal */
export class R2CurveParser extends Parser<R2Curve> {
  private readonly x0Parser: Parser<number> | undefined;
  private readonly y0Parser: Parser<number> | undefined;
  private readonly command: number | undefined;
  private readonly step: number | undefined;

  constructor(x0Parser?: Parser<number>, y0Parser?: Parser<number>,
              command?: number, step?: number) {
    super();
    this.x0Parser = x0Parser;
    this.y0Parser = y0Parser;
    this.command = command;
    this.step = step;
  }

  override feed(input: Input): Parser<R2Curve> {
    return R2CurveParser.parse(input, this.x0Parser, this.y0Parser,
                               this.command, this.step);
  }

  static parse(input: Input, x0Parser?: Parser<number>, y0Parser?: Parser<number>,
               command?: number, step: number = 1): Parser<R2Curve> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 77/*'M'*/ || c === 109/*'m'*/) {
          input = input.step();
          command = c;
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("moveto", input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 2) {
      if (x0Parser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          x0Parser = Base10.parseDecimal(input);
        }
      } else {
        x0Parser = x0Parser.feed(input);
      }
      if (x0Parser !== void 0) {
        if (x0Parser.isDone()) {
          step = 3;
        } else if (x0Parser.isError()) {
          return x0Parser.asError();
        }
      }
    }
    if (step === 3) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input = input.step();
        }
        step = 4;
      } else if (!input.isEmpty()) {
        step = 4;
      }
    }
    if (step === 4) {
      if (y0Parser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          y0Parser = Base10.parseDecimal(input);
        }
      } else {
        y0Parser = y0Parser.feed(input);
      }
      if (y0Parser !== void 0) {
        if (y0Parser.isDone()) {
          step = 5;
        } else if (y0Parser.isError()) {
          return y0Parser.asError();
        }
      }
    }
    if (step === 5) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        switch (c) {
          case 76/*'L'*/:
          case 108/*'l'*/:
          case 72/*'H'*/:
          case 104/*'h'*/:
          case 86/*'V'*/:
          case 118/*'v'*/:
            return R2SegmentParser.parse(input, x0Parser, y0Parser);
          case 81/*'Q'*/:
          case 113/*'q'*/:
            return R2QuadraticCurveParser.parse(input, x0Parser, y0Parser);
          case 84/*'T'*/:
            return R2QuadraticCurveParser.parse(input, x0Parser, y0Parser,
                                                x0Parser, y0Parser);
          case 116/*'t'*/:
            return R2QuadraticCurveParser.parse(input, x0Parser, y0Parser,
                                                Parser.done(0), Parser.done(0));
          case 67/*'C'*/:
          case 99/*'c'*/:
            return R2CubicCurveParser.parse(input, x0Parser, y0Parser);
          case 83/*'S'*/:
            return R2CubicCurveParser.parse(input, x0Parser, y0Parser,
                                             x0Parser, y0Parser);
          case 115/*'s'*/:
            return R2CubicCurveParser.parse(input, x0Parser, y0Parser,
                                             Parser.done(0), Parser.done(0));
          case 65/*'A'*/:
          case 97/*'a'*/:
            return R2EllipticCurveParser.parse(input, x0Parser, y0Parser);
          case 44/*','*/:
            input = input.step();
          case 43/*'+'*/:
          case 45/*'-'*/:
          case 46/*'.'*/:
          case 48/*'0'*/:
          case 49/*'1'*/:
          case 50/*'2'*/:
          case 51/*'3'*/:
          case 52/*'4'*/:
          case 53/*'5'*/:
          case 54/*'6'*/:
          case 55/*'7'*/:
          case 56/*'8'*/:
          case 57/*'9'*/:
            switch (command) {
              case 77/*'M'*/:
              case 109/*'m'*/:
                return R2SegmentParser.parseRest(input, command, x0Parser, y0Parser);
            }
          default:
            return Parser.error(Diagnostic.expected("draw command", input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    return new R2CurveParser(x0Parser, y0Parser, command, step);
  }
}
