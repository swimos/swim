// Copyright 2015-2020 SWIM.AI inc.
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
import {FontStyle} from "./FontStyle";
import {FontVariant} from "./FontVariant";
import {FontWeight} from "./FontWeight";
import {FontStretch} from "./FontStretch";
import {FontSize} from "./FontSize";
import {LineHeight} from "./LineHeight";
import {FontFamily} from "./FontFamily";
import {FontFamilyParser} from "./FontFamilyParser";
import {Font} from "./Font";

/** @hidden */
export class FontParser extends Parser<Font> {
  private readonly style: FontStyle | undefined;
  private readonly variant: FontVariant | undefined;
  private readonly weight: FontWeight | undefined;
  private readonly stretch: FontStretch | undefined;
  private readonly size: FontSize | undefined;
  private readonly height: LineHeight | undefined;
  private readonly family: FontFamily | FontFamily[] | undefined;
  private readonly identOutput: Output<string> | undefined;
  private readonly lengthParser: Parser<Length> | undefined;
  private readonly familyParser: Parser<FontFamily> | undefined;
  private readonly step: number | undefined;

  constructor(style?: FontStyle, variant?: FontVariant, weight?: FontWeight,
              stretch?: FontStretch, size?: FontSize, height?: LineHeight,
              family?: FontFamily | FontFamily[], identOutput?: Output<string>,
              lengthParser?: Parser<Length>, familyParser?: Parser<FontFamily>,
              step?: number) {
    super();
    this.style = style;
    this.variant = variant;
    this.weight = weight;
    this.stretch = stretch;
    this.size = size;
    this.height = height;
    this.family = family;
    this.identOutput = identOutput;
    this.lengthParser = lengthParser;
    this.familyParser = familyParser;
    this.step = step;
  }

  feed(input: Input): Parser<Font> {
    return FontParser.parse(input, this.style, this.variant, this.weight,
                            this.stretch, this.size, this.height, this.family,
                            this.identOutput, this.lengthParser,
                            this.familyParser, this.step);
  }

  static parse(input: Input, style?: FontStyle, variant?: FontVariant,
               weight?: FontWeight, stretch?: FontStretch, size?: FontSize,
               height?: LineHeight, family?: FontFamily | FontFamily[],
               identOutput?: Output<string>, lengthParser?: Parser<Length>,
               familyParser?: Parser<FontFamily>, step: number = 1): Parser<Font> {
    let c = 0;
    do {
      if (step === 1) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input.step();
        }
        if (input.isCont()) {
          if (Unicode.isAlpha(c)) {
            step = 2;
          } else if (c === 34/*'"'*/ || c === 39/*'\''*/) {
            step = 11;
          } else {
            step = 4;
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 2) {
        identOutput = identOutput || Unicode.stringOutput();
        while (input.isCont() && (c = input.head(), Unicode.isAlpha(c) || c === 45/*'-'*/)) {
          input = input.step();
          identOutput.write(c);
        }
        if (!input.isEmpty()) {
          const ident = identOutput.bind();
          identOutput = void 0;
          switch (ident) {
            case "italic":
            case "oblique":
              if (style === void 0) {
                style = ident;
              } else {
                return Parser.error(Diagnostic.message("reapeated font style: " + ident, input));
              }
              step = 3;
              break;
            case "small-caps":
              if (variant === void 0) {
                variant = ident;
              } else {
                return Parser.error(Diagnostic.message("reapeated font variant: " + ident, input));
              }
              step = 3;
              break;
            case "bold":
            case "bolder":
            case "lighter":
              if (weight === void 0) {
                weight = ident;
              } else {
                return Parser.error(Diagnostic.message("reapeated font weight: " + ident, input));
              }
              step = 3;
              break;
            case "ultra-condensed":
            case "extra-condensed":
            case "semi-condensed":
            case "condensed":
            case "expanded":
            case "semi-expanded":
            case "extra-expanded":
            case "ultra-expanded":
              if (stretch === void 0) {
                stretch = ident;
              } else {
                return Parser.error(Diagnostic.message("reapeated font stretch: " + ident, input));
              }
              step = 3;
              break;
            case "normal":
              if (style === void 0) {
                style = ident;
              } else if (variant === void 0) {
                variant = ident;
              } else if (weight === void 0) {
                weight = ident;
              } else if (stretch === void 0) {
                stretch = ident;
              } else {
                return Parser.error(Diagnostic.message("reapeated font property: " + ident, input));
              }
              step = 3;
              break;
            case "large":
            case "larger":
            case "medium":
            case "small":
            case "smaller":
            case "x-large":
            case "x-small":
            case "xx-large":
            case "xx-small":
              size = ident;
              step = 5;
              break;
            default:
              family = ident;
              step = 12;
          }
        }
      }
      if (step === 3) {
        if (input.isCont()) {
          c = input.head();
          if (Unicode.isSpace(c)) {
            input.step();
            step = 1;
            continue;
          } else {
            return Parser.error(Diagnostic.expected("font property, size, or family", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 4) {
        if (!lengthParser) {
          lengthParser = LengthParser.parse(input);
        } else {
          lengthParser = lengthParser.feed(input);
        }
        if (lengthParser.isDone()) {
          const length = lengthParser.bind();
          if (length.units() === "") {
            const value = length.value();
            switch (value) {
              case 100:
              case 200:
              case 300:
              case 400:
              case 500:
              case 600:
              case 700:
              case 800:
              case 900:
                if (weight === void 0) {
                  weight = String(value) as FontWeight;
                } else {
                  return Parser.error(Diagnostic.message("reapeated font weight: " + value, input));
                }
                break;
              default:
                return Parser.error(Diagnostic.message("unknown font property: " + value, input));
            }
            step = 3;
            continue;
          } else {
            size = length;
            lengthParser = void 0;
            step = 5;
          }
        } else if (lengthParser.isError()) {
          return lengthParser.asError();
        }
      }
      if (step === 5) {
        if (input.isCont()) {
          c = input.head();
          if (Unicode.isSpace(c)) {
            input.step();
            step = 6;
          } else if (c === 47/*'/'*/) {
            input.step();
            step = 7;
          } else {
            return Parser.error(Diagnostic.expected("font family", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 6) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input.step();
        }
        if (input.isCont()) {
          if (c === 47/*'/'*/) {
            input.step();
            step = 7;
          } else {
            step = 11;
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 7) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input.step();
        }
        if (input.isCont()) {
          if (Unicode.isAlpha(c)) {
            step = 8;
          } else {
            step = 9;
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 8) {
        identOutput = identOutput || Unicode.stringOutput();
        while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
          input = input.step();
          identOutput.write(c);
        }
        if (!input.isEmpty()) {
          const ident = identOutput.bind();
          identOutput = void 0;
          switch (ident) {
            case "normal":
              height = ident;
              step = 10;
              break;
            default:
              return Parser.error(Diagnostic.message("unknown line height: " + ident, input));
          }
        }
      }
      if (step === 9) {
        if (!lengthParser) {
          lengthParser = LengthParser.parse(input);
        } else {
          lengthParser = lengthParser.feed(input);
        }
        if (lengthParser.isDone()) {
          height = lengthParser.bind();
          lengthParser = void 0;
          step = 10;
        } else if (lengthParser.isError()) {
          return lengthParser.asError();
        }
      }
      if (step === 10) {
        if (input.isCont()) {
          c = input.head();
          if (Unicode.isSpace(c)) {
            input.step();
            step = 11;
          } else {
            return Parser.error(Diagnostic.expected("font family", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 11) {
        if (!familyParser) {
          familyParser = FontFamilyParser.parse(input);
        } else {
          familyParser = familyParser.feed(input);
        }
        if (familyParser.isDone()) {
          if (Array.isArray(family)) {
            family.push(familyParser.bind());
          } else if (family !== void 0) {
            family = [family!, familyParser.bind()];
          } else {
            family = familyParser.bind();
          }
          familyParser = void 0;
          step = 12;
        } else if (familyParser.isError()) {
          return familyParser.asError();
        }
      }
      if (step === 12) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input.step();
        }
        if (input.isCont() && c === 44/*','*/) {
          input.step();
          step = 11;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.done(Font.from(style, variant, weight, stretch, size, height, family!));
        }
      }
      break;
    } while (true);
    return new FontParser(style, variant, weight, stretch, size, height, family,
                          identOutput, lengthParser, familyParser, step);
  }

  static parseRest(input: Input, style?: FontStyle, variant?: FontVariant,
                   weight?: FontWeight, stretch?: FontStretch, size?: FontSize,
                   height?: LineHeight, family?: FontFamily | FontFamily[]): Parser<Font> {
    const step = family !== void 0 ? 12 : size !== void 0 ? 5 : 3;
    return FontParser.parse(input, style, variant, weight, stretch, size, height,
                            family, void 0, void 0, void 0, step);
  }
}
Font.Parser = FontParser;
