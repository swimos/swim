// Copyright 2015-2020 Swim inc.
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
import {Interpolator, StepInterpolator} from "@swim/interpolate";
import {Form} from "@swim/structure";
import {AnyDateTime, DateTime} from "@swim/time";
import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color, RgbColorInit, HslColorInit} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {AnyBoxShadow, BoxShadowInit, BoxShadow} from "@swim/shadow";
import {AnyLinearGradient, LinearGradient} from "@swim/gradient";
import {AnyTransform, Transform} from "@swim/transform";
import {Scale, ContinuousScale, LinearScale, TimeScale} from "@swim/scale";
import {AnyTransition, TransitionInit, Transition} from "@swim/transition";
import {StyleValueParser} from "./StyleValueParser";
import {StyleValueForm} from "./StyleValueForm";
import {StyleInterpolatorForm} from "./StyleInterpolatorForm";
import {StyleScaleForm} from "./StyleScaleForm";
import {StyleTransitionForm} from "./StyleTransitionForm";

export type AnyStyleValue = AnyDateTime
                          | AnyAngle
                          | AnyLength
                          | AnyColor | RgbColorInit | HslColorInit
                          | AnyFont
                          | AnyBoxShadow | BoxShadowInit
                          | AnyLinearGradient
                          | AnyTransform
                          | Interpolator<any>
                          | Scale<any, any>
                          | AnyTransition<any> | TransitionInit<any>
                          | number
                          | boolean;

export type StyleValue = DateTime
                       | Angle
                       | Length
                       | Color
                       | Font
                       | BoxShadow
                       | LinearGradient
                       | Transform
                       | Interpolator<any>
                       | Scale<any, any>
                       | Transition<any>
                       | number
                       | boolean;

export interface StyleValueClass {
  fromAny(value: AnyStyleValue): StyleValue;

  parse(input: Input | string): StyleValue;

  parseScale<X, Y>(input: string): ContinuousScale<X, Y>;

  /** @hidden */
  _form: Form<StyleValue, AnyStyleValue> | undefined;
  form(unit?: AnyStyleValue): Form<StyleValue, AnyStyleValue>;

  /** @hidden */
  _interpolatorForm: Form<Interpolator<StyleValue, AnyStyleValue>> | undefined;
  interpolatorForm(unit?: Interpolator<StyleValue, AnyStyleValue>): Form<Interpolator<StyleValue, AnyStyleValue>>;

  /** @hidden */
  _scaleForm: Form<Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue>> | undefined,
  scaleForm(unit?: Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue>): Form<Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue>>;

  /** @hidden */
  _transitionForm: Form<Transition<StyleValue>, AnyTransition<StyleValue>> | undefined;
  transitionForm(unit?: AnyTransition<StyleValue> | null): Form<Transition<StyleValue>, AnyTransition<StyleValue>>;

  // Forward type declarations
  /** @hidden */
  Parser: typeof StyleValueParser, // defined by StyleValueParser
  /** @hidden */
  Form: typeof StyleValueForm, // defined by StyleValueForm
  /** @hidden */
  InterpolatorForm: typeof StyleInterpolatorForm, // defined by StyleInterpolatorForm
  /** @hidden */
  ScaleForm: typeof StyleScaleForm, // defined by StyleScaleForm
  /** @hidden */
  TransitionForm: typeof StyleTransitionForm, // defined by StyleTransitionForm
}

export const StyleValue: StyleValueClass = {
  fromAny(value: AnyStyleValue): StyleValue {
    if (value instanceof DateTime
        || value instanceof Angle
        || value instanceof Length
        || value instanceof Color
        || value instanceof Font
        || value instanceof BoxShadow
        || value instanceof LinearGradient
        || value instanceof Transform
        || value instanceof Interpolator
        || value instanceof Scale
        || value instanceof Transition
        || typeof value === "number"
        || typeof value === "boolean") {
      return value;
    } else if (value instanceof Date || DateTime.isInit(value)) {
      return DateTime.fromAny(value);
    } else if (Color.isInit(value)) {
      return Color.fromAny(value);
    } else if (Font.isInit(value)) {
      return Font.fromAny(value);
    } else if (BoxShadow.isInit(value)) {
      return BoxShadow.fromAny(value);
    } else if (Transition.isInit(value)) {
      return Transition.fromAny(value);
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

  parseScale<X, Y>(input: string): ContinuousScale<X, Y> {
    if (input === "linear") {
      return new LinearScale(0, 1, new StepInterpolator(void 0, void 0)) as unknown as ContinuousScale<X, Y>;
    } else if (input === "time") {
      const d1 = DateTime.current();
      const d0 = d1.day(d1.day() - 1);
      return new TimeScale(d0, d1, new StepInterpolator(void 0, void 0)) as unknown as ContinuousScale<X, Y>;
    } else {
      const domain = input.split("...");
      const x0 = StyleValue.parse(domain[0]);
      const x1 = StyleValue.parse(domain[1]);
      if (typeof x0 === "number" && typeof x1 === "number") {
        return new LinearScale(x0, x1, new StepInterpolator(void 0, void 0)) as unknown as ContinuousScale<X, Y>;
      } else if (x0 instanceof DateTime && x1 instanceof DateTime) {
        return new TimeScale(x0, x1, new StepInterpolator(void 0, void 0)) as unknown as ContinuousScale<X, Y>;
      }
    }
    throw new TypeError("" + input);
  },

  /** @hidden */
  _form: void 0 as Form<StyleValue, AnyStyleValue> | undefined,
  form(unit?: AnyStyleValue): Form<StyleValue, AnyStyleValue> {
    if (unit !== void 0) {
      unit = StyleValue.fromAny(unit);
      return new StyleValue.Form(unit as StyleValue);
    } else {
      if (StyleValue._form === void 0) {
        StyleValue._form = new StyleValue.Form();
      }
      return StyleValue._form;
    }
  },

  /** @hidden */
  _interpolatorForm: void 0 as Form<Interpolator<StyleValue, AnyStyleValue>> | undefined,
  interpolatorForm(unit?: Interpolator<StyleValue, AnyStyleValue>): Form<Interpolator<StyleValue, AnyStyleValue>> {
    if (unit !== void 0) {
      return new StyleValue.InterpolatorForm(unit);
    } else {
      if (StyleValue._interpolatorForm === void 0) {
        StyleValue._interpolatorForm = new StyleValue.InterpolatorForm();
      }
      return StyleValue._interpolatorForm;
    }
  },

  /** @hidden */
  _scaleForm: void 0 as Form<Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue>> | undefined,
  scaleForm(unit?: Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue>): Form<Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue>> {
    if (unit !== void 0) {
      return new StyleValue.ScaleForm(unit);
    } else {
      if (StyleValue._scaleForm === void 0) {
        StyleValue._scaleForm = new StyleValue.ScaleForm();
      }
      return StyleValue._scaleForm;
    }
  },

  /** @hidden */
  _transitionForm: void 0 as Form<Transition<StyleValue>, AnyTransition<StyleValue>> | undefined,
  transitionForm(unit: AnyTransition<StyleValue> | null = null): Form<Transition<StyleValue>, AnyTransition<StyleValue>> {
    if (unit !== null) {
      unit = Transition.fromAny(unit);
      return new StyleValue.TransitionForm(unit || void 0);
    } else {
      if (StyleValue._transitionForm === void 0) {
        StyleValue._transitionForm = new StyleValue.TransitionForm();
      }
      return StyleValue._transitionForm;
    }
  },

  // Forward type declarations
  /** @hidden */
  Parser: void 0 as any as typeof StyleValueParser, // defined by StyleValueParser
  /** @hidden */
  Form: void 0 as any as typeof StyleValueForm, // defined by StyleValueForm
  /** @hidden */
  InterpolatorForm: void 0 as any as typeof StyleInterpolatorForm, // defined by StyleInterpolatorForm
  /** @hidden */
  ScaleForm: void 0 as any as typeof StyleScaleForm, // defined by StyleScaleForm
  /** @hidden */
  TransitionForm: void 0 as any as typeof StyleTransitionForm, // defined by StyleTransitionForm
};
