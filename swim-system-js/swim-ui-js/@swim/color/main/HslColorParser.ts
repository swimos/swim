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
import {Angle, AngleParser} from "@swim/angle";
import {Color} from "./Color";
import {HslColor} from "./HslColor";
import {ColorChannel} from "./ColorChannel";
import {ColorChannelParser} from "./ColorChannelParser";

/** @hidden */
export class HslColorParser extends Parser<HslColor> {
  private readonly hParser: Parser<Angle> | undefined;
  private readonly sParser: Parser<ColorChannel> | undefined;
  private readonly lParser: Parser<ColorChannel> | undefined;
  private readonly aParser: Parser<ColorChannel> | undefined;
  private readonly step: number | undefined;

  constructor(hParser?: Parser<Angle>, sParser?: Parser<ColorChannel>,
              lParser?: Parser<ColorChannel>, aParser?: Parser<ColorChannel>,
              step?: number) {
    super();
    this.hParser = hParser;
    this.sParser = sParser;
    this.lParser = lParser;
    this.aParser = aParser;
    this.step = step;
  }

  feed(input: Input): Parser<HslColor> {
    return HslColorParser.parse(input, this.hParser, this.sParser,
                                this.lParser, this.aParser, this.step);
  }

  static parse(input: Input, hParser?: Parser<Angle>, sParser?: Parser<ColorChannel>,
               lParser?: Parser<ColorChannel>, aParser?: Parser<ColorChannel>,
               step?: number): Parser<HslColor> {
    let c = 0;
    if (step === 1) {
      if (input.isCont() && input.head() === 104/*'h'*/) {
        input = input.step();
        step = 2;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("h", input));
      }
    }
    if (step === 2) {
      if (input.isCont() && input.head() === 115/*'s'*/) {
        input = input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("s", input));
      }
    }
    if (step === 3) {
      if (input.isCont() && input.head() === 108/*'l'*/) {
        input = input.step();
        step = 4;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("l", input));
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
      if (!hParser) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          hParser = AngleParser.parse(input, "deg");
        }
      } else {
        hParser = hParser.feed(input);
      }
      if (hParser) {
        if (hParser.isDone()) {
          step = 7;
        } else if (hParser.isError()) {
          return hParser.asError();
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
      if (!sParser) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          sParser = ColorChannelParser.parse(input);
        }
      } else {
        sParser = sParser.feed(input);
      }
      if (sParser) {
        if (sParser.isDone()) {
          if (sParser.bind().units === "%") {
            step = 9;
          } else {
            return Parser.error(Diagnostic.expected("%", input));
          }
        } else if (sParser.isError()) {
          return sParser.asError();
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
      if (!lParser) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (input.isCont()) {
          lParser = ColorChannelParser.parse(input);
        }
      } else {
        lParser = lParser.feed(input);
      }
      if (lParser) {
        if (lParser.isDone()) {
          if (lParser.bind().units === "%") {
            step = 11;
          } else {
            return Parser.error(Diagnostic.expected("%", input));
          }
        } else if (lParser.isError()) {
          return lParser.asError();
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
          return Parser.done(new HslColor(hParser!.bind().degValue(),
                                          sParser!.bind().scale(1),
                                          lParser!.bind().scale(1)));
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
        return Parser.done(new HslColor(hParser!.bind().degValue(),
                                        sParser!.bind().scale(1),
                                        lParser!.bind().scale(1),
                                        aParser!.bind().scale(1)));
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    return new HslColorParser(hParser, sParser, lParser, aParser, step);
  }

  /** @hidden */
  static parseRest(input: Input): Parser<HslColor> {
    return HslColorParser.parse(input, void 0, void 0, void 0, void 0, 5);
  }
}
Color.HslParser = HslColorParser;
