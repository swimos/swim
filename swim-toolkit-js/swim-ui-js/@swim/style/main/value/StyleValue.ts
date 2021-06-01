// Copyright 2015-2021 Swim inc.
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
import {Interpolator} from "@swim/mapping";
import type {Form} from "@swim/structure";
import {AnyLength, Length, AnyAngle, Angle, AnyTransform, Transform} from "@swim/math";
import {AnyDateTime, DateTime} from "@swim/time";
import {AnyFont, Font} from "../font/Font";
import {AnyColor, Color} from "../color/Color";
import type {RgbColorInit} from "../rgb/RgbColor";
import type {HslColorInit} from "../hsl/HslColor";
import {AnyLinearGradient, LinearGradient} from "../gradient/LinearGradient";
import {AnyBoxShadow, BoxShadowInit, BoxShadow} from "../shadow/BoxShadow";
import {StyleValueForm} from "../"; // forward import
import {StyleValueParser} from "../"; // forward import

export type AnyStyleValue = AnyDateTime
                          | AnyAngle
                          | AnyLength
                          | AnyFont
                          | AnyColor | RgbColorInit | HslColorInit
                          | AnyLinearGradient
                          | AnyBoxShadow | BoxShadowInit
                          | AnyTransform
                          | Interpolator<any>
                          | number
                          | boolean;

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

export const StyleValue = {} as {
  fromAny(value: AnyStyleValue): StyleValue;

  parse(input: Input | string): StyleValue;

  form(): Form<StyleValue, AnyStyleValue>;
};

StyleValue.fromAny = function (value: AnyStyleValue): StyleValue {
  if (value instanceof DateTime
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
    return value;
  } else if (value instanceof Date || DateTime.isInit(value)) {
    return DateTime.fromAny(value);
  } else if (Font.isInit(value)) {
    return Font.fromAny(value);
  } else if (Color.isInit(value)) {
    return Color.fromAny(value);
  } else if (BoxShadow.isInit(value)) {
    return BoxShadow.fromAny(value)!;
  } else if (typeof value === "string") {
    return StyleValue.parse(value);
  }
  throw new TypeError("" + value);
};

StyleValue.parse = function (input: Input | string): StyleValue {
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
};

Object.defineProperty(StyleValue, "form", {
  value: function (): Form<StyleValue, AnyStyleValue> {
    const form = new StyleValueForm(void 0);
    Object.defineProperty(StyleValue, "form", {
      value: function (): Form<StyleValue, AnyStyleValue> {
        return form;
      },
      enumerable: true,
      configurable: true,
    });
    return form;
  },
  enumerable: true,
  configurable: true,
});
