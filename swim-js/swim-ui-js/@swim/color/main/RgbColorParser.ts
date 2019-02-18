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

import {Input, Parser, Diagnostic, Unicode} from "@swim/codec";
import {Color} from "./Color";
import {RgbColor} from "./RgbColor";
import {ColorChannel} from "./ColorChannel";
import {ColorChannelParser} from "./ColorChannelParser";

/** @hidden */
export class RgbColorParser extends Parser<RgbColor> {
  private readonly rParser: Parser<ColorChannel> | undefined;
  private readonly gParser: Parser<ColorChannel> | undefined;
  private readonly bParser: Parser<ColorChannel> | undefined;
  private readonly aParser: Parser<ColorChannel> | undefined;
  private readonly step: number | undefined;

  constructor(rParser?: Parser<ColorChannel>, gParser?: Parser<ColorChannel>,
              bParser?: Parser<ColorChannel>, aParser?: Parser<ColorChannel>,
              step?: number) {
    super();
    this.rParser = rParser;
    this.gParser = gParser;
    this.bParser = bParser;
    this.aParser = aParser;
    this.step = step;
  }

  feed(input: Input): Parser<RgbColor> {
    return RgbColorParser.parse(input, this.rParser, this.gParser,
                                this.bParser, this.aParser, this.step);
  }

  static parse(input: Input, rParser?: Parser<ColorChannel>, gParser?: Parser<ColorChannel>,
               bParser?: Parser<ColorChannel>, aParser?: Parser<ColorChannel>,
               step?: number): Parser<RgbColor> {
    let c = 0;
    if (step === 1) {
      if (input.isCont() && input.head() === 114/*'r'*/) {
        input = input.step();
        step = 2;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("r", input));
      }
    }
    if (step === 2) {
      if (input.isCont() && input.head() === 103/*'g'*/) {
        input = input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("g", input));
      }
    }
    if (step === 3) {
      if (input.isCont() && input.head() === 98/*'b'*/) {
        input = input.step();
        step = 4;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("b", input));
      }
    }
    if (step === 4) {
      if (input.isCont() && input.head() === 97/*'a'*/) {
        input = input.step();
        step = 5;
      } else if (!input.isEmpty()) {
        step = 5;
      }
    }
    if (step === 5) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont() && c === 40/*'('*/) {
        input = input.step();
        step = 6;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("(", input));
      }
    }
    if (step === 6) {
      if (!rParser) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          rParser = ColorChannelParser.parse(input);
        }
      } else {
        rParser = rParser.feed(input);
      }
      if (rParser) {
        if (rParser.isDone()) {
          step = 7;
        } else if (rParser.isError()) {
          return rParser.asError();
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
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 8) {
      if (!gParser) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          gParser = ColorChannelParser.parse(input);
        }
      } else {
        gParser = gParser.feed(input);
      }
      if (gParser) {
        if (gParser.isDone()) {
          step = 9;
        } else if (gParser.isError()) {
          return gParser.asError();
        }
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
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 10) {
      if (!bParser) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          bParser = ColorChannelParser.parse(input);
        }
      } else {
        bParser = bParser.feed(input);
      }
      if (bParser) {
        if (bParser.isDone()) {
          step = 11;
        } else if (bParser.isError()) {
          return bParser.asError();
        }
      }
    }
    if (step === 11) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 41/*')'*/) {
          input = input.step();
          return Parser.done(new RgbColor(rParser!.bind().scale(255),
                                          gParser!.bind().scale(255),
                                          bParser!.bind().scale(255)));
        } else if (c === 44/*','*/ || c === 47/*'/'*/) {
          input = input.step();
        }
        step = 12;
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 12) {
      if (!aParser) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          aParser = ColorChannelParser.parse(input);
        }
      } else {
        aParser = aParser.feed(input);
      }
      if (aParser) {
        if (aParser.isDone()) {
          step = 13;
        } else if (aParser.isError()) {
          return aParser.asError();
        }
      }
    }
    if (step === 13) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont() && c === 41/*')'*/) {
        input = input.step();
        return Parser.done(new RgbColor(rParser!.bind().scale(255),
                                        gParser!.bind().scale(255),
                                        bParser!.bind().scale(255),
                                        aParser!.bind().scale(1)));
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    return new RgbColorParser(rParser, gParser, bParser, aParser, step);
  }

  /** @hidden */
  static parseRest(input: Input): Parser<RgbColor> {
    return RgbColorParser.parse(input, void 0, void 0, void 0, void 0, 5);
  }
}
Color.RgbParser = RgbColorParser;
