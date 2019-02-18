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
import {Length, LengthParser} from "@swim/length";
import {Color, ColorParser} from "@swim/color";
import {BoxShadow} from "./BoxShadow";

/** @hidden */
export class BoxShadowParser extends Parser<BoxShadow> {
  private readonly boxShadow: BoxShadow | undefined;
  private readonly identOutput: Output<string> | undefined;
  private readonly offsetXParser: Parser<Length> | undefined;
  private readonly offsetYParser: Parser<Length> | undefined;
  private readonly blurRadiusParser: Parser<Length> | undefined;
  private readonly spreadRadiusParser: Parser<Length> | undefined;
  private readonly colorParser: Parser<Color> | undefined;
  private readonly step: number | undefined;

  constructor(boxShadow?: BoxShadow, identOutput?: Output<string>,
              offsetXParser?: Parser<Length>, offsetYParser?: Parser<Length>,
              blurRadiusParser?: Parser<Length>, spreadRadiusParser?: Parser<Length>,
              colorParser?: Parser<Color>, step?: number) {
    super();
    this.boxShadow = boxShadow;
    this.identOutput = identOutput;
    this.offsetXParser = offsetXParser;
    this.offsetYParser = offsetYParser;
    this.blurRadiusParser = blurRadiusParser;
    this.spreadRadiusParser = spreadRadiusParser;
    this.colorParser = colorParser;
    this.step = step;
  }

  feed(input: Input): Parser<BoxShadow> {
    return BoxShadowParser.parse(input, this.boxShadow, this.identOutput, this.offsetXParser,
                                 this.offsetYParser, this.blurRadiusParser, this.spreadRadiusParser,
                                 this.colorParser, this.step);
  }

  static parse(input: Input, boxShadow?: BoxShadow, identOutput?: Output<string>,
               offsetXParser?: Parser<Length>, offsetYParser?: Parser<Length>,
               blurRadiusParser?: Parser<Length>, spreadRadiusParser?: Parser<Length>,
               colorParser?: Parser<Color>, step: number = 1): Parser<BoxShadow> {
    let c = 0;
    do {
      if (step === 1) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input.step();
        }
        if (input.isCont()) {
          if (Unicode.isAlpha(c)) {
            step = 2;
          } else {
            step = 4;
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 2) {
        identOutput = identOutput || Unicode.stringOutput();
        while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
          input = input.step();
          identOutput.write(c);
        }
        if (!input.isEmpty()) {
          const ident = identOutput.bind();
          switch (ident) {
            case "inset": step = 3; break;
            case "none": return Parser.done(BoxShadow.none());
            default: return Parser.error(Diagnostic.message("unknown box-shadow: " + ident, input));
          }
        }
      }
      if (step === 3) {
        if (input.isCont()) {
          if (Unicode.isSpace(input.head())) {
            input.step();
            step = 4;
          } else {
            return Parser.error(Diagnostic.expected("space", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 4) {
        if (!offsetXParser) {
          while (input.isCont() && Unicode.isSpace(input.head())) {
            input.step();
          }
          if (!input.isEmpty()) {
            offsetXParser = LengthParser.parse(input);
          }
        } else {
          offsetXParser = offsetXParser.feed(input);
        }
        if (offsetXParser) {
          if (offsetXParser.isDone()) {
            step = 5;
          } else if (offsetXParser.isError()) {
            return offsetXParser.asError();
          }
        }
      }
      if (step === 5) {
        if (input.isCont()) {
          if (Unicode.isSpace(input.head())) {
            input.step();
            step = 6;
          } else {
            return Parser.error(Diagnostic.expected("space", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 6) {
        if (!offsetYParser) {
          while (input.isCont() && Unicode.isSpace(input.head())) {
            input.step();
          }
          if (!input.isEmpty()) {
            offsetYParser = LengthParser.parse(input);
          }
        } else {
          offsetYParser = offsetYParser.feed(input);
        }
        if (offsetYParser) {
          if (offsetYParser.isDone()) {
            step = 7;
          } else if (offsetYParser.isError()) {
            return offsetYParser.asError();
          }
        }
      }
      if (step === 7) {
        if (input.isCont()) {
          if (Unicode.isSpace(input.head())) {
            input.step();
            step = 8;
          } else {
            return Parser.error(Diagnostic.expected("space", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 8) {
        if (!blurRadiusParser) {
          while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
            input.step();
          }
          if (input.isCont() && (c === 45/*'-'*/ || c >= 48/*'0'*/ && c <= 57/*'9'*/)) {
            blurRadiusParser = LengthParser.parse(input);
          } else if (!input.isEmpty()) {
            step = 12;
          }
        } else {
          blurRadiusParser = blurRadiusParser.feed(input);
        }
        if (blurRadiusParser) {
          if (blurRadiusParser.isDone()) {
            step = 9;
          } else if (blurRadiusParser.isError()) {
            return blurRadiusParser.asError();
          }
        }
      }
      if (step === 9) {
        if (input.isCont()) {
          if (Unicode.isSpace(input.head())) {
            input.step();
            step = 10;
          } else {
            return Parser.error(Diagnostic.expected("space", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 10) {
        if (!spreadRadiusParser) {
          while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
            input.step();
          }
          if (input.isCont() && (c === 45/*'-'*/ || c >= 48/*'0'*/ && c <= 57/*'9'*/)) {
            spreadRadiusParser = LengthParser.parse(input);
          } else if (!input.isEmpty()) {
            step = 12;
          }
        } else {
          spreadRadiusParser = spreadRadiusParser.feed(input);
        }
        if (spreadRadiusParser) {
          if (spreadRadiusParser.isDone()) {
            step = 11;
          } else if (spreadRadiusParser.isError()) {
            return spreadRadiusParser.asError();
          }
        }
      }
      if (step === 11) {
        if (input.isCont()) {
          if (Unicode.isSpace(input.head())) {
            input.step();
            step = 12;
          } else {
            return Parser.error(Diagnostic.expected("space", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 12) {
        if (!colorParser) {
          while (input.isCont() && Unicode.isSpace(input.head())) {
            input.step();
          }
          if (!input.isEmpty()) {
            colorParser = ColorParser.parse(input);
          }
        } else {
          colorParser = colorParser.feed(input);
        }
        if (colorParser) {
          if (colorParser.isDone()) {
            const inset = identOutput ? identOutput.bind() === "inset" : false;
            const offsetX = offsetXParser!.bind();
            const offsetY = offsetYParser!.bind();
            const blurRadius = blurRadiusParser ? blurRadiusParser.bind() : Length.zero();
            const spreadRadius = spreadRadiusParser ? spreadRadiusParser.bind() : Length.zero();
            const color = colorParser!.bind();
            const next = new BoxShadow(inset, offsetX, offsetY, blurRadius, spreadRadius, color, null);
            if (!boxShadow) {
              boxShadow = next;
            } else {
              boxShadow = boxShadow.and(next);
            }
            identOutput = void 0;
            offsetXParser = void 0;
            offsetYParser = void 0;
            blurRadiusParser = void 0;
            spreadRadiusParser = void 0;
            colorParser = void 0;
            step = 13;
          } else if (colorParser.isError()) {
            return colorParser.asError();
          }
        }
      }
      if (step === 13) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input.step();
        }
        if (input.isCont() && c === 44/*','*/) {
          input.step();
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.done(boxShadow!);
        }
      }
      break;
    } while (true);
    return new BoxShadowParser(boxShadow, identOutput, offsetXParser, offsetYParser,
                               blurRadiusParser, spreadRadiusParser, colorParser, step);
  }
}
BoxShadow.Parser = BoxShadowParser;
