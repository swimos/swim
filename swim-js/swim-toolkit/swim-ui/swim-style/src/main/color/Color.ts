// Copyright 2015-2021 Swim.inc
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

import {Lazy, Equivalent, HashCode, Interpolate, Interpolator} from "@swim/util";
import {Output, Parser, Debug, Diagnostic, Unicode} from "@swim/codec";
import type {Value, Form} from "@swim/structure";
import {AnyAngle, Angle} from "@swim/math";
import {ColorForm} from "../"; // forward import
import {ColorParser} from "../"; // forward import
import {RgbColorInit, RgbColor} from "../"; // forward import
import {RgbColorInterpolator} from "../"; // forward import
import {HslColorInit, HslColor} from "../"; // forward import

/** @public */
export type AnyColor = Color | ColorInit | string;

/** @public */
export type ColorInit = RgbColorInit | HslColorInit;

/** @public */
export abstract class Color implements Interpolate<Color>, HashCode, Equivalent, Debug {
  abstract isDefined(): boolean;

  abstract alpha(): number;
  abstract alpha(a: number): Color;

  abstract plus(that: AnyColor): Color;

  abstract times(scalar: number): Color;

  abstract combine(that: AnyColor, scalar?: number): Color;

  abstract readonly lightness: number;

  abstract lighter(k?: number): Color;

  abstract darker(k?: number): Color;

  contrast(k?: number): Color {
    return this.lightness < 0.67 ? this.lighter(k) : this.darker(k);
  }

  abstract rgb(): RgbColor;

  abstract hsl(): HslColor;

  interpolateTo(that: Color): Interpolator<Color>;
  interpolateTo(that: unknown): Interpolator<Color> | null;
  interpolateTo(that: unknown): Interpolator<Color> | null {
    if (that instanceof Color) {
      return RgbColorInterpolator(this.rgb(), that.rgb());
    } else {
      return null;
    }
  }

  abstract equivalentTo(that: unknown, epsilon?: number): boolean;

  abstract equals(other: unknown): boolean;

  abstract hashCode(): number;

  abstract debug<T>(output: Output<T>): Output<T>;

  abstract toHexString(): string;

  abstract toRgbString(): string;

  abstract toHslString(): string;

  abstract toString(): string;

  static transparent(): Color {
    return RgbColor.transparent();
  }

  static black(alpha?: number): Color {
    return RgbColor.black(alpha);
  }

  static white(alpha?: number): Color {
    return RgbColor.white(alpha);
  }

  static rgb(r: number, g: number, b: number, a?: number): RgbColor {
    return new RgbColor(r, g, b, a);
  }

  static hsl(h: AnyAngle, s: number, l: number, a?: number): HslColor {
    if (typeof h !== "number") {
      h = Angle.fromAny(h).degValue();
    }
    return new HslColor(h, s, l, a);
  }

  static forName(name: string): Color | null {
    switch (name) {
      case "transparent": return Color.transparent();
      case "black": return Color.black();
      case "white": return Color.white();
      default: return null;
    }
  }

  static fromInit(value: ColorInit): Color {
    if (RgbColor.isInit(value)) {
      return RgbColor.fromInit(value);
    } else if (HslColor.isInit(value)) {
      return HslColor.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromAny(value: AnyColor): Color {
    if (value === void 0 || value === null || value instanceof Color) {
      return value;
    } else if (typeof value === "string") {
      return Color.parse(value);
    } else if (RgbColor.isInit(value)) {
      return RgbColor.fromInit(value);
    } else if (HslColor.isInit(value)) {
      return HslColor.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): Color | null {
    let color: Color | null;
    color = RgbColor.fromValue(value);
    if (color === void 0) {
      color = HslColor.fromValue(value);
    }
    return color;
  }

  static parse(string: string): Color {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = ColorParser.parse(input);
    if (parser.isDone()) {
      while (input.isCont() && Unicode.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  /** @internal */
  static isInit(value: unknown): value is ColorInit {
    return RgbColor.isInit(value) || HslColor.isInit(value);
  }

  /** @internal */
  static isAny(value: unknown): value is AnyColor {
    return value instanceof Color
        || Color.isInit(value)
        || typeof value === "string";
  }

  @Lazy
  static form(): Form<Color, AnyColor> {
    return new ColorForm(Color.transparent());
  }

  /** @internal */
  static Darker: number = 0.7;
  /** @internal */
  static Brighter: number = 1 / Color.Darker;
}
