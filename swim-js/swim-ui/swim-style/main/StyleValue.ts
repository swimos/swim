// Copyright 2015-2024 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import {Lazy} from "@swim/util";
import {Interpolator} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import {Base10} from "@swim/codec";
import {Unicode} from "@swim/codec";
import {Item} from "@swim/structure";
import {Record} from "@swim/structure";
import {Num} from "@swim/structure";
import {Bool} from "@swim/structure";
import {Form} from "@swim/structure";
import type {LengthLike} from "@swim/math";
import {Length} from "@swim/math";
import type {AngleLike} from "@swim/math";
import {Angle} from "@swim/math";
import type {TransformLike} from "@swim/math";
import {Transform} from "@swim/math";
import {TranslateTransformParser} from "@swim/math";
import {ScaleTransformParser} from "@swim/math";
import {RotateTransformParser} from "@swim/math";
import {SkewTransformParser} from "@swim/math";
import {AffineTransformParser} from "@swim/math";
import {DateTimeLike} from "@swim/time";
import type {DateTimeInit} from "@swim/time";
import {DateTime} from "@swim/time";
import {DateTimeFormat} from "@swim/time";
import type {FontWeight} from "./Font";
import {FontLike} from "./Font";
import {Font} from "./Font";
import {FontParser} from "./Font";
import {ColorLike} from "./Color";
import {Color} from "./Color";
import {RgbColorParser} from "./RgbColor";
import {HexColorParser} from "./RgbColor";
import {HslColorParser} from "./HslColor";
import {LinearGradientLike} from "./LinearGradient";
import {LinearGradient} from "./LinearGradient";
import {LinearGradientParser} from "./LinearGradient";
import {BoxShadowLike} from "./BoxShadow";
import {BoxShadow} from "./BoxShadow";

/** @public */
export type StyleValueLike = DateTimeLike
                           | AngleLike
                           | LengthLike
                           | FontLike
                           | ColorLike
                           | LinearGradientLike
                           | BoxShadowLike
                           | TransformLike
                           | Interpolator<any>
                           | number
                           | boolean;

/** @public */
export type StyleValue = DateTime
                       | Angle
                       | Length
                       | Font
                       | Color
                       | LinearGradient
                       | BoxShadow
                       | Transform
                       | Interpolator<any>
                       | number
                       | boolean;

/** @public */
export const StyleValue = {
  fromLike<T extends StyleValueLike | null | undefined>(value: T): StyleValue | Uninitable<T> {
    if (value === void 0 || value === null
        || value instanceof DateTime
        || value instanceof Angle
        || value instanceof Length
        || value instanceof Color
        || value instanceof Font
        || value instanceof BoxShadow
        || value instanceof LinearGradient
        || value instanceof Transform
        || value instanceof Interpolator
        || typeof value === "number"
        || typeof value === "boolean") {
      return value as StyleValue | Uninitable<T>;
    } else if (DateTimeLike[Symbol.hasInstance](value)) {
      return DateTime.fromLike(value);
    } else if (ColorLike[Symbol.hasInstance](value)) {
      return Color.fromLike(value);
    } else if (FontLike[Symbol.hasInstance](value)) {
      return Font.fromLike(value);
    } else if (BoxShadowLike[Symbol.hasInstance](value)) {
      return BoxShadow.fromLike(value)!;
    } else if (LinearGradientLike[Symbol.hasInstance](value)) {
      return LinearGradient.fromLike(value)!;
    } else if (typeof value === "string") {
      return StyleValue.parse(value);
    }
    throw new TypeError("" + value);
  },

  parse(input: Input | string): StyleValue {
    if (typeof input === "string") {
      input = Unicode.stringInput(input);
    }
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = StyleValueParser.parse(input);
    if (parser.isDone()) {
      while (input.isCont() && Unicode.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  },

  form: Lazy(function (): Form<StyleValue, StyleValueLike> {
    return new StyleValueForm(void 0);
  }),
};

/** @internal */
export class StyleValueForm extends Form<StyleValue, StyleValueLike> {
  constructor(unit: StyleValue | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly unit: StyleValue | undefined;

  override withUnit(unit: StyleValue | undefined): Form<StyleValue, StyleValueLike> {
    if (unit === this.unit) {
      return this;
    }
    return new StyleValueForm(unit);
  }

  override mold(value: StyleValueLike): Item {
    if (value === void 0) {
      return Item.extant();
    }
    value = StyleValue.fromLike(value);
    if (value instanceof DateTime) {
      return DateTime.form().mold(value);
    } else if (value instanceof Angle) {
      return Angle.form().mold(value);
    } else if (value instanceof Length) {
      return Length.form().mold(value);
    } else if (value instanceof Font) {
      return Font.form().mold(value);
    } else if (value instanceof Color) {
      return Color.form().mold(value);
    } else if (value instanceof BoxShadow) {
      return BoxShadow.form().mold(value);
    } else if (value instanceof Transform) {
      return Transform.form().mold(value);
    } else if (typeof value === "number") {
      return Num.from(value);
    }
    throw new TypeError("" + value);
  }

  override cast(item: Item): StyleValue | undefined {
    const value = item.toValue();
    if (value instanceof Num) {
      return value.numberValue();
    }
    if (value instanceof Bool) {
      return value.booleanValue();
    }
    const string = value.stringValue(void 0);
    if (string !== void 0) {
      try {
        return StyleValue.parse(string);
      } catch (e) {
        // swallow
      }
    }
    if (value instanceof Record) {
      const date = DateTime.fromValue(value);
      if (date !== null) {
        return date;
      }
      const angle = Angle.fromValue(value);
      if (angle !== null) {
        return angle;
      }
      const length = Length.fromValue(value);
      if (length !== null) {
        return length;
      }
      const font = Font.fromValue(value);
      if (font !== null) {
        return font;
      }
      const color = Color.fromValue(value);
      if (color !== null) {
        return color;
      }
      const boxShadow = BoxShadow.fromValue(value);
      if (boxShadow !== null) {
        return boxShadow;
      }
      const transform = Transform.fromValue(value);
      if (transform !== null) {
        return transform;
      }
    }
    return void 0;
  }
}

/** @internal */
export class StyleValueParser extends Parser<StyleValue> {
  private readonly identOutput: Output<string> | undefined;
  private readonly valueParser: Parser<number> | undefined;
  private readonly unitsOutput: Output<string> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, valueParser?: Parser<number>,
              unitsOutput?: Output<string>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.valueParser = valueParser;
    this.unitsOutput = unitsOutput;
    this.step = step;
  }

  override feed(input: Input): Parser<StyleValue> {
    return StyleValueParser.parse(input, this.identOutput, this.valueParser,
                                  this.unitsOutput, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, valueParser?: Parser<number>,
               unitsOutput?: Output<string>, step: number = 1): Parser<StyleValue> {
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
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c) || Unicode.isDigit(c) || c === 45/*'-'*/)) {
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

          case "linear-gradient": return LinearGradientParser.parseRest(input, identOutput);

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

          case "translate3d":
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
          default: {
            const color = Color.forName(ident);
            if (color !== null) {
              return Parser.done(color);
            }
            return Parser.error(Diagnostic.message("unknown style value: " + ident, input));
          }
        }
      }
    }
    if (step === 3) {
      if (valueParser === void 0) {
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
        return DateTimeFormat.pattern('%m-%dT%H:%M:%S.%LZ').parseDate(input, date);
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
            return FontParser.parseRest(input, void 0, void 0, void 0, void 0, styleValue);
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
