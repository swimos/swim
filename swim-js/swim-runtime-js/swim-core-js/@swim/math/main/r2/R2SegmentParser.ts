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
import {R2Segment} from "./R2Segment";

/** @hidden */
export class R2SegmentParser extends Parser<R2Segment> {
  private readonly x0Parser: Parser<number> | undefined;
  private readonly y0Parser: Parser<number> | undefined;
  private readonly x1Parser: Parser<number> | undefined;
  private readonly y1Parser: Parser<number> | undefined;
  private readonly command: number | undefined;
  private readonly step: number | undefined;

  constructor(x0Parser?: Parser<number>, y0Parser?: Parser<number>,
              x1Parser?: Parser<number>, y1Parser?: Parser<number>,
              command?: number, step?: number) {
    super();
    this.x0Parser = x0Parser;
    this.y0Parser = y0Parser;
    this.x1Parser = x1Parser;
    this.y1Parser = y1Parser;
    this.command = command;
    this.step = step;
  }

  override feed(input: Input): Parser<R2Segment> {
    return R2SegmentParser.parse(input, this.x0Parser, this.y0Parser,
                                 this.x1Parser, this.y1Parser,
                                 this.command, this.step);
  }

  static parse(input: Input, x0Parser?: Parser<number>, y0Parser?: Parser<number>,
               x1Parser?: Parser<number>, y1Parser?: Parser<number>,
               command?: number, step: number = 1): Parser<R2Segment> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        switch (c) {
          case 77/*'M'*/:
          case 109/*'m'*/:
          case 76/*'L'*/:
          case 108/*'l'*/:
            input = input.step();
            command = c;
            step = 2;
            break;
          case 72/*'H'*/:
            input = input.step();
            y1Parser = y0Parser;
            command = c;
            step = 2;
            break;
          case 104/*'h'*/:
            input = input.step();
            y1Parser = Parser.done(0);
            command = c;
            step = 2;
            break;
          case 86/*'V'*/:
            input = input.step();
            x1Parser = x0Parser;
            command = c;
            step = 4;
            break;
          case 118/*'v'*/:
            input = input.step();
            x1Parser = Parser.done(0);
            command = c;
            step = 4;
            break;
          default:
            return Parser.error(Diagnostic.expected("lineto", input));
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
          if (y1Parser === void 0 || !y1Parser.isDone()) {
            step = 3;
          } else { // H or h
            step = 4;
          }
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
          const x0 = x0Parser!.bind();
          const y0 = y0Parser!.bind();
          let x1 = x1Parser!.bind();
          let y1 = y1Parser.bind();
          if (command === 109/*'m'*/ || command === 108/*'l'*/ ||
              command === 104/*'h'*/ || command === 118/*'v'*/) {
            x1 += x0;
            y1 += y0;
          }
          return Parser.done(new R2Segment(x0, y0, x1, y1));
        } else if (y1Parser.isError()) {
          return y1Parser.asError();
        }
      }
    }
    return new R2SegmentParser(x0Parser, y0Parser, x1Parser, y1Parser, command, step);
  }

  static parseRest(input: Input, command?: number, x0Parser?: Parser<number>,
                   y0Parser?: Parser<number>): Parser<R2Segment> {
    let x1Parser: Parser<number> | undefined;
    let y1Parser: Parser<number> | undefined;
    let step: number;
    switch (command) {
      case 72/*'H'*/:
        y1Parser = y0Parser;
        step = 2;
        break;
      case 104/*'h'*/:
        y1Parser = Parser.done(0);
        step = 2;
        break;
      case 86/*'V'*/:
        x1Parser = x0Parser;
        step = 4;
        break;
      case 118/*'v'*/:
        x1Parser = Parser.done(0);
        step = 4;
        break;
      default:
        step = 2;
    }
    return this.parse(input, x0Parser, y0Parser, x1Parser, y1Parser, command, step);
  }
}
