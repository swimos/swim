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

import {Input, Parser, Diagnostic, Unicode} from "@swim/codec";
import {Length, LengthParser} from "@swim/math";
import type {Color} from "../color/Color";
import {ColorParser} from "../color/ColorParser";
import {ColorStop} from "./ColorStop";

/** @internal */
export class ColorStopParser extends Parser<ColorStop> {
  private readonly colorParser: Parser<Color> | undefined;
  private readonly stopParser: Parser<Length> | undefined;
  private readonly hintParser: Parser<Length> | undefined;
  private readonly step: number | undefined;

  constructor(colorParser?: Parser<Color>, stopParser?: Parser<Length>,
              hintParser?: Parser<Length>, step?: number) {
    super();
    this.colorParser = colorParser;
    this.stopParser = stopParser;
    this.hintParser = hintParser;
    this.step = step;
  }

  override feed(input: Input): Parser<ColorStop> {
    return ColorStopParser.parse(input, this.colorParser, this.stopParser,
                                 this.hintParser, this.step);
  }

  static parse(input: Input, colorParser?: Parser<Color>, stopParser?: Parser<Length>,
               hintParser?: Parser<Length>, step: number = 4): Parser<ColorStop> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input.step();
      }
      if (input.isCont()) {
        if (c === 45/*'-'*/ || c === 46/*'.'*/ || c >= 48/*'0'*/ && c <= 57/*'9'*/) {
          step = 2;
        } else {
          step = 7;
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 2) {
      if (hintParser === void 0) {
        hintParser = LengthParser.parse(input);
      } else {
        hintParser = hintParser.feed(input);
      }
      if (hintParser !== void 0) {
        if (hintParser.isDone()) {
          step = 3;
        } else if (hintParser.isError()) {
          return hintParser.asError();
        }
      }
    }
    if (step === 3) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input.step();
          step = 4;
        } else {
          stopParser = hintParser;
          hintParser = void 0;
          step = 7;
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 4) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input.step();
      }
      if (input.isCont()) {
        if (c === 45/*'-'*/ || c === 46/*'.'*/ || c >= 48/*'0'*/ && c <= 57/*'9'*/) {
          step = 5;
        } else {
          step = 7;
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 5) {
      if (stopParser === void 0) {
        stopParser = LengthParser.parse(input);
      } else {
        stopParser = stopParser.feed(input);
      }
      if (stopParser !== void 0) {
        if (stopParser.isDone()) {
          step = 6;
        } else if (stopParser.isError()) {
          return stopParser.asError();
        }
      }
    }
    if (step === 6) {
      if (input.isCont()) {
        if (Unicode.isSpace(input.head())) {
          input.step();
          step = 7;
        } else {
          return Parser.error(Diagnostic.expected("color", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 7) {
      if (colorParser === void 0) {
        colorParser = ColorParser.parse(input);
      } else {
        colorParser = colorParser.feed(input);
      }
      if (colorParser !== void 0) {
        if (colorParser.isDone()) {
          if (stopParser !== void 0) {
            const hint = hintParser !== void 0 ? hintParser.bind() : null;
            return Parser.done(new ColorStop(colorParser.bind(), stopParser.bind(), hint));
          } else {
            step = 8;
          }
        } else if (colorParser.isError()) {
          return colorParser.asError();
        }
      }
    }
    if (step === 8) {
      if (input.isCont() && Unicode.isSpace(input.head())) {
        input.step();
        step = 9;
      } else if (!input.isEmpty()) {
        const hint = hintParser !== void 0 ? hintParser.bind() : null;
        return Parser.done(new ColorStop(colorParser!.bind(), null, hint));
      }
    }
    if (step === 9) {
      if (stopParser === void 0) {
        stopParser = LengthParser.parse(input);
      } else {
        stopParser = stopParser.feed(input);
      }
      if (stopParser !== void 0) {
        if (stopParser.isDone()) {
          const hint = hintParser !== void 0 ? hintParser.bind() : null;
          return Parser.done(new ColorStop(colorParser!.bind(), stopParser.bind(), hint));
        } else if (stopParser.isError()) {
          return stopParser.asError();
        }
      }
    }
    return new ColorStopParser(colorParser, stopParser, hintParser, step);
  }

  static parseHint(input: Input): Parser<ColorStop> {
    return ColorStopParser.parse(input, void 0, void 0, void 0, 1);
  }
}
