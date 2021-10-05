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

import {Input, Parser, Diagnostic, Unicode, Base10} from "@swim/codec";
import {R2QuadraticCurve} from "./R2QuadraticCurve";

/** @internal */
export class R2QuadraticCurveParser extends Parser<R2QuadraticCurve> {
  private readonly x0Parser: Parser<number> | undefined;
  private readonly y0Parser: Parser<number> | undefined;
  private readonly x1Parser: Parser<number> | undefined;
  private readonly y1Parser: Parser<number> | undefined;
  private readonly x2Parser: Parser<number> | undefined;
  private readonly y2Parser: Parser<number> | undefined;
  private readonly command: number | undefined;
  private readonly step: number | undefined;

  constructor(x0Parser?: Parser<number>, y0Parser?: Parser<number>,
              x1Parser?: Parser<number>, y1Parser?: Parser<number>,
              x2Parser?: Parser<number>, y2Parser?: Parser<number>,
              command?: number, step?: number) {
    super();
    this.x0Parser = x0Parser;
    this.y0Parser = y0Parser;
    this.x1Parser = x1Parser;
    this.y1Parser = y1Parser;
    this.x2Parser = x2Parser;
    this.y2Parser = y2Parser;
    this.command = command;
    this.step = step;
  }

  override feed(input: Input): Parser<R2QuadraticCurve> {
    return R2QuadraticCurveParser.parse(input, this.x0Parser, this.y0Parser,
                                        this.x1Parser, this.y1Parser,
                                        this.x2Parser, this.y2Parser,
                                        this.command, this.step);
  }

  static parse(input: Input, x0Parser?: Parser<number>, y0Parser?: Parser<number>,
               x1Parser?: Parser<number>, y1Parser?: Parser<number>,
               x2Parser?: Parser<number>, y2Parser?: Parser<number>,
               command?: number, step: number = 1): Parser<R2QuadraticCurve> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        switch (c) {
          case 81/*'Q'*/:
          case 113/*'q'*/:
            input = input.step();
            command = c;
            step = 2;
            break;
          case 84/*'T'*/:
          case 116/*'t'*/:
            input = input.step();
            command = c;
            step = 6;
            break;
          default:
            return Parser.error(Diagnostic.expected("curveto", input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 2) {
      if (x1Parser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          x1Parser = Base10.parseDecimal(input);
        }
      } else {
        x1Parser = x1Parser.feed(input);
      }
      if (x1Parser !== void 0) {
        if (x1Parser.isDone()) {
          step = 3;
        } else if (x1Parser.isError()) {
          return x1Parser.asError();
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
      if (y1Parser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          y1Parser = Base10.parseDecimal(input);
        }
      } else {
        y1Parser = y1Parser.feed(input);
      }
      if (y1Parser !== void 0) {
        if (y1Parser.isDone()) {
          step = 5;
        } else if (y1Parser.isError()) {
          return y1Parser.asError();
        }
      }
    }
    if (step === 5) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input = input.step();
        }
        step = 6;
      } else if (!input.isEmpty()) {
        step = 6;
      }
    }
    if (step === 6) {
      if (x2Parser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          x2Parser = Base10.parseDecimal(input);
        }
      } else {
        x2Parser = x2Parser.feed(input);
      }
      if (x2Parser !== void 0) {
        if (x2Parser.isDone()) {
          step = 7;
        } else if (x2Parser.isError()) {
          return x2Parser.asError();
        }
      }
    }
    if (step === 7) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input = input.step();
        }
        step = 8;
      } else if (!input.isEmpty()) {
        step = 8;
      }
    }
    if (step === 8) {
      if (y2Parser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          y2Parser = Base10.parseDecimal(input);
        }
      } else {
        y2Parser = y2Parser.feed(input);
      }
      if (y2Parser !== void 0) {
        if (y2Parser.isDone()) {
          const x0 = x0Parser!.bind();
          const y0 = y0Parser!.bind();
          let x1 = x1Parser!.bind();
          let y1 = y1Parser!.bind();
          let x2 = x2Parser!.bind();
          let y2 = y2Parser.bind();
          if (command === 113/*'q'*/ || command === 116/*'t'*/) {
            x1 += x0;
            y1 += y0;
            x2 += x0;
            y2 += y0;
          }
          return Parser.done(new R2QuadraticCurve(x0, y0, x1, y1, x2, y2));
        } else if (y2Parser.isError()) {
          return y2Parser.asError();
        }
      }
    }
    return new R2QuadraticCurveParser(x0Parser, y0Parser, x1Parser, y1Parser,
                                      x2Parser, y2Parser, command, step);
  }

  static parseRest(input: Input, command?: number, x0Parser?: Parser<number>,
                   y0Parser?: Parser<number>, x1Parser?: Parser<number>,
                   y1Parser?: Parser<number>): Parser<R2QuadraticCurve> {
    const step = command === 84/*'T'*/ || command === 116/*'t'*/ ? 6 : 2;
    return R2QuadraticCurveParser.parse(input, x0Parser, y0Parser, x1Parser, y1Parser,
                                        void 0, void 0, command, step);
  }
}
