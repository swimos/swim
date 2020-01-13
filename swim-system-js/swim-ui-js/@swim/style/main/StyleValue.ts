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

import {Input, Parser, Diagnostic, Unicode} from "@swim/codec";
import {Form} from "@swim/structure";
import {AnyDateTime, DateTime} from "@swim/time";
import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color, RgbColorInit, HslColorInit} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {AnyTransform, Transform} from "@swim/transform";
import {Interpolator} from "@swim/interpolate";
import {Scale} from "@swim/scale";
import {AnyTransition, TransitionInit, Transition} from "@swim/transition";
import {AnyBoxShadow, BoxShadowInit, BoxShadow} from "./BoxShadow";
import {StyleValueParser} from "./StyleValueParser";
import {StyleValueForm} from "./StyleValueForm";

export type AnyStyleValue = AnyDateTime
                          | AnyAngle
                          | AnyLength
                          | AnyColor | RgbColorInit | HslColorInit
                          | AnyFont
                          | AnyTransform
                          | Interpolator<any>
                          | Scale<any, any>
                          | AnyTransition<any> | TransitionInit<any>
                          | AnyBoxShadow | BoxShadowInit
                          | number
                          | boolean;

export type StyleValue = DateTime
                       | Angle
                       | Length
                       | Color
                       | Font
                       | Transform
                       | Interpolator<any>
                       | Scale<any, any>
                       | Transition<any>
                       | BoxShadow
                       | number
                       | boolean;

export const StyleValue = {
  fromAny(value: AnyStyleValue): StyleValue {
    if (value instanceof DateTime
        || value instanceof Angle
        || value instanceof Length
        || value instanceof Color
        || value instanceof Font
        || value instanceof Transform
        || value instanceof Interpolator
        || value instanceof Scale
        || value instanceof Transition
        || value instanceof BoxShadow
        || typeof value === "number"
        || typeof value === "boolean") {
      return value;
    } else if (value instanceof Date || DateTime.isInit(value)) {
      return DateTime.fromAny(value);
    } else if (Color.isInit(value)) {
      return Color.fromAny(value);
    } else if (Font.isInit(value)) {
      return Font.fromAny(value);
    } else if (Transition.isInit(value)) {
      return Transition.fromAny(value);
    } else if (BoxShadow.isInit(value)) {
      return BoxShadow.fromAny(value);
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
    let parser = StyleValue.Parser.parse(input);
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

  /** @hidden */
  _form: void 0 as Form<StyleValue, AnyStyleValue> | undefined,
  form(unit?: AnyStyleValue): Form<StyleValue, AnyStyleValue> {
    if (unit !== void 0) {
      unit = StyleValue.fromAny(unit);
      return new StyleValue.Form(unit as StyleValue);
    } else {
      if (!StyleValue._form) {
        StyleValue._form = new StyleValue.Form();
      }
      return StyleValue._form;
    }
  },

  // Forward type declarations
  /** @hidden */
  Parser: void 0 as any as typeof StyleValueParser, // defined by StyleValueParser
  /** @hidden */
  Form: void 0 as any as typeof StyleValueForm, // defined by StyleValueForm
};
