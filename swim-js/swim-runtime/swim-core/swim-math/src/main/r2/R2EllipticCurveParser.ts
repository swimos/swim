// Copyright 2015-2021 Swim.inc
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
import {R2EllipticCurve} from "./R2EllipticCurve";

/** @internal */
export class R2EllipticCurveParser extends Parser<R2EllipticCurve> {
  private readonly x0Parser: Parser<number> | undefined;
  private readonly y0Parser: Parser<number> | undefined;
  private readonly rxParser: Parser<number> | undefined;
  private readonly ryParser: Parser<number> | undefined;
  private readonly phiParser: Parser<number> | undefined;
  private readonly large: boolean | undefined;
  private readonly sweep: boolean | undefined;
  private readonly x1Parser: Parser<number> | undefined;
  private readonly y1Parser: Parser<number> | undefined;
  private readonly command: number | undefined;
  private readonly step: number | undefined;

  constructor(x0Parser?: Parser<number>, y0Parser?: Parser<number>,
              rxParser?: Parser<number>, ryParser?: Parser<number>,
              phiParser?: Parser<number>, large?: boolean, sweep?: boolean,
              x1Parser?: Parser<number>, y1Parser?: Parser<number>,
              command?: number, step?: number) {
    super();
    this.x0Parser = x0Parser;
    this.y0Parser = y0Parser;
    this.rxParser = rxParser;
    this.ryParser = ryParser;
    this.phiParser = phiParser;
    this.large = large;
    this.sweep = sweep;
    this.x1Parser = x1Parser;
    this.y1Parser = y1Parser;
    this.command = command;
    this.step = step;
  }

  override feed(input: Input): Parser<R2EllipticCurve> {
    return R2EllipticCurveParser.parse(input, this.x0Parser, this.y0Parser,
                                       this.rxParser, this.ryParser,
                                       this.phiParser, this.large, this.sweep,
                                       this.x1Parser, this.y1Parser,
                                       this.command, this.step);
  }

  static parse(input: Input, x0Parser?: Parser<number>, y0Parser?: Parser<number>,
               rxParser?: Parser<number>, ryParser?: Parser<number>,
               phiParser?: Parser<number>, large?: boolean, sweep?: boolean,
               x1Parser?: Parser<number>, y1Parser?: Parser<number>,
               command?: number, step: number = 1): Parser<R2EllipticCurve> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        switch (c) {
          case 65/*'A'*/:
          case 97/*'a'*/:
            input = input.step();
            command  = c;
            step = 2;
            break;
          default:
            return Parser.error(Diagnostic.expected("arcto", input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 2) {
      if (rxParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          rxParser = Base10.parseDecimal(input);
        }
      } else {
        rxParser = rxParser.feed(input);
      }
      if (rxParser !== void 0) {
        if (rxParser.isDone()) {
          step = 3;
        } else if (rxParser.isError()) {
          return rxParser.asError();
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
      if (ryParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          ryParser = Base10.parseDecimal(input);
        }
      } else {
        ryParser = ryParser.feed(input);
      }
      if (ryParser !== void 0) {
        if (ryParser.isDone()) {
          step = 5;
        } else if (ryParser.isError()) {
          return ryParser.asError();
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
      if (phiParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          phiParser = Base10.parseDecimal(input);
        }
      } else {
        phiParser = phiParser.feed(input);
      }
      if (phiParser !== void 0) {
        if (phiParser.isDone()) {
          step = 7;
        } else if (phiParser.isError()) {
          return phiParser.asError();
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
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 48/*'0'*/) {
          input = input.step();
          large = false;
          step = 9;
        } else if (c === 49/*'1'*/) {
          input = input.step();
          large = true;
          step = 9;
        } else {
          return Parser.error(Diagnostic.expected("flag", input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 9) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input = input.step();
        }
        step = 10;
      } else if (!input.isEmpty()) {
        step = 10;
      }
    }
    if (step === 10) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 48/*'0'*/) {
          input = input.step();
          sweep = false;
          step = 11;
        } else if (c === 49/*'1'*/) {
          input = input.step();
          sweep = true;
          step = 11;
        } else {
          return Parser.error(Diagnostic.expected("flag", input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 11) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input = input.step();
        }
        step = 12;
      } else if (!input.isEmpty()) {
        step = 12;
      }
    }
    if (step === 12) {
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
          step = 13;
        } else if (x1Parser.isError()) {
          return x1Parser.asError();
        }
      }
    }
    if (step === 13) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input = input.step();
        }
        step = 14;
      } else if (!input.isEmpty()) {
        step = 14;
      }
    }
    if (step === 14) {
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
          const rx = rxParser!.bind();
          const ry = ryParser!.bind();
          const phi = phiParser!.bind() * Math.PI / 180;
          let x1 = x1Parser!.bind();
          let y1 = y1Parser.bind();
          if (command === 97/*'a'*/) {
            x1 += x0;
            y1 += y0;
          }
          return Parser.done(R2EllipticCurve.fromEndpoints(x0, y0, rx, ry, phi, large!, sweep!, x1, y1));
        } else if (y1Parser.isError()) {
          return y1Parser.asError();
        }
      }
    }
    return new R2EllipticCurveParser(x0Parser, y0Parser, rxParser, ryParser,
                                     phiParser, large, sweep, x1Parser, y1Parser,
                                     command, step);
  }

  static parseRest(input: Input, command?: number, x0Parser?: Parser<number>,
                   y0Parser?: Parser<number>): Parser<R2EllipticCurve> {
    return R2EllipticCurveParser.parse(input, x0Parser, y0Parser, void 0, void 0, void 0,
                                       void 0, void 0, void 0, void 0, command, 2);
  }
}
