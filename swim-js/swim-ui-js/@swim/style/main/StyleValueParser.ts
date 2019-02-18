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

import {Input, Output, Parser, Diagnostic, Unicode, Base10} from "@swim/codec";
import {DateTimeInit, DateTimeFormat} from "@swim/time";
import {Angle} from "@swim/angle";
import {Length} from "@swim/length";
import {Color, HexColorParser, RgbColorParser, HslColorParser} from "@swim/color";
import {FontWeight, FontParser} from "@swim/font";
import {
  Transform,
  TranslateTransformParser,
  ScaleTransformParser,
  RotateTransformParser,
  SkewTransformParser,
  AffineTransformParser,
} from "@swim/transform";
import {StyleValue} from "./StyleValue";

const ISO_8601_REST = DateTimeFormat.pattern('%m-%dT%H:%M:%S.%LZ');

/** @hidden */
export class StyleValueParser extends Parser<StyleValue> {
  private readonly identOutput: Output<string> | undefined;
  private readonly valueParser: Parser<number> | undefined;
  private readonly unitsOutput: Output<String> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, valueParser?: Parser<number>,
              unitsOutput?: Output<String>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.valueParser = valueParser;
    this.unitsOutput = unitsOutput;
    this.step = step;
  }

  feed(input: Input): Parser<StyleValue> {
    return StyleValueParser.parse(input, this.identOutput, this.valueParser,
                                  this.unitsOutput, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, valueParser?: Parser<number>,
               unitsOutput?: Output<String>, step: number = 1): Parser<StyleValue> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input.step();
      }
      if (input.isCont()) {
        if (c === 35/*'#'*/) {
          return HexColorParser.parse(input);
        } else if (Unicode.isAlpha(c)) {
          step = 2;
        } else {
          step = 3;
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
        switch (ident) {
          case "rgb":
          case "rgba": return RgbColorParser.parseRest(input);

          case "hsl":
          case "hsla": return HslColorParser.parseRest(input);

          case "normal":
          case "italic":
          case "oblique": return FontParser.parseRest(input, ident);
          case "small-caps": return FontParser.parseRest(input, void 0, ident);
          case "bold":
          case "bolder":
          case "lighter": return FontParser.parseRest(input, void 0, void 0, ident);
          case "ultra-condensed":
          case "extra-condensed":
          case "semi-condensed":
          case "condensed":
          case "expanded":
          case "semi-expanded":
          case "extra-expanded":
          case "ultra-expanded": return FontParser.parseRest(input, void 0, void 0, void 0, ident);
          case "large":
          case "larger":
          case "medium":
          case "small":
          case "smaller":
          case "x-large":
          case "x-small":
          case "xx-large":
          case "xx-small": return FontParser.parseRest(input, void 0, void 0, void 0, void 0, ident);

          case "translateX":
          case "translateY":
          case "translate": return TranslateTransformParser.parseRest(input, identOutput);
          case "scaleX":
          case "scaleY":
          case "scale": return ScaleTransformParser.parseRest(input, identOutput);
          case "rotate": return RotateTransformParser.parseRest(input, identOutput);
          case "skewX":
          case "skewY":
          case "skew": return SkewTransformParser.parseRest(input, identOutput);
          case "matrix": return AffineTransformParser.parseRest(input, identOutput);
          case "none": return Parser.done(Transform.identity());

          case "true": return Parser.done(true);
          case "false": return Parser.done(false);
          default:
            const color = Color.fromName(ident);
            if (color !== void 0) {
              return Parser.done(color);
            }
            return Parser.error(Diagnostic.message("unknown style value: " + ident, input));
        }
      }
    }
    if (step === 3) {
      if (!valueParser) {
        valueParser = Base10.parseDecimal(input);
      } else {
        valueParser = valueParser.feed(input);
      }
      if (valueParser.isDone()) {
        step = 4;
      } else if (valueParser.isError()) {
        return valueParser.asError();
      }
    }
    if (step === 4) {
      if (input.isCont() && (c = input.head(), c === 45/*'-'*/)) {
        input.step();
        const date = {} as DateTimeInit;
        date.year = valueParser!.bind();
        return ISO_8601_REST.parseDate(input, date);
      } else if (!input.isEmpty()) {
        step = 5;
      }
    }
    if (step === 5) {
      unitsOutput = unitsOutput || Unicode.stringOutput();
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c) || c === 37/*'%'*/)) {
        input.step();
        unitsOutput.push(c);
      }
      if (!input.isEmpty()) {
        step = 6;
      }
    }
    if (step === 6) {
      if (!input.isEmpty()) {
        const value = valueParser!.bind();
        const units = unitsOutput!.bind();
        let styleValue: Angle | Length | number;
        switch (units) {
          case "deg": styleValue = Angle.deg(value); break;
          case "rad": styleValue = Angle.rad(value); break;
          case "grad": styleValue = Angle.grad(value); break;
          case "turn": styleValue = Angle.turn(value); break;

          case "px": styleValue = Length.px(value); break;
          case "em": styleValue = Length.em(value); break;
          case "rem": styleValue = Length.rem(value); break;
          case "%": styleValue = Length.pct(value); break;

          case "": styleValue = value; break;
          default: return Parser.error(Diagnostic.message("unknown style units: " + units, input));
        }
        if (input.isCont() && (c = input.head(), Unicode.isSpace(c) || c === 47/*'/'*/)) {
          if (styleValue instanceof Length) {
            return FontParser.parseRest(input, void 0, void 0, void 0, void 0, styleValue as Length);
          } else if (typeof styleValue === "number") {
            switch (value) {
              case 100:
              case 200:
              case 300:
              case 400:
              case 500:
              case 600:
              case 700:
              case 800:
              case 900: return FontParser.parseRest(input, void 0, void 0, String(value) as FontWeight);
            }
          }
        }
        return Parser.done(styleValue);
      }
    }
    return new StyleValueParser(identOutput, valueParser, unitsOutput, step);
  }
}
StyleValue.Parser = StyleValueParser;
