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
import type {HashCode} from "@swim/util";
import type {Equivalent} from "@swim/util";
import type {Interpolate} from "@swim/util";
import type {Interpolator} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Base10} from "@swim/codec";
import {Unicode} from "@swim/codec";
import type {Item} from "@swim/structure";
import type {Value} from "@swim/structure";
import {Text} from "@swim/structure";
import {Form} from "@swim/structure";
import type {AngleLike} from "@swim/math";
import {Angle} from "@swim/math";
import {RgbColorInit} from "./"; // forward import
import {RgbColor} from "./"; // forward import
import {RgbColorInterpolator} from "./"; // forward import
import {RgbColorParser} from "./"; // forward import
import {HexColorParser} from "./"; // forward import
import {HslColorInit} from "./"; // forward import
import {HslColor} from "./"; // forward import
import {HslColorParser} from "./"; // forward import

/** @public */
export type ColorLike = Color | ColorInit | string;

/** @public */
export const ColorLike = {
  [Symbol.hasInstance](instance: unknown): instance is ColorLike {
    return instance instanceof Color
        || ColorInit[Symbol.hasInstance](instance)
        || typeof instance === "string";
  },
};

/** @public */
export type ColorInit = RgbColorInit | HslColorInit;

/** @public */
export const ColorInit = {
  [Symbol.hasInstance](instance: unknown): instance is ColorInit {
    return RgbColorInit[Symbol.hasInstance](instance)
        || HslColorInit[Symbol.hasInstance](instance);
  },
};

/** @public */
export abstract class Color implements Interpolate<Color>, HashCode, Equivalent, Debug {
  likeType?(like: ColorInit | string): void;

  abstract isDefined(): boolean;

  abstract alpha(): number;
  abstract alpha(a: number): Color;

  abstract plus(that: ColorLike): Color;

  abstract times(scalar: number): Color;

  abstract combine(that: ColorLike, scalar?: number): Color;

  abstract readonly lightness: number;

  abstract lighter(k?: number): Color;

  abstract darker(k?: number): Color;

  contrast(k?: number): Color {
    return this.lightness < 0.67 ? this.lighter(k) : this.darker(k);
  }

  abstract rgb(): RgbColor;

  abstract hsl(): HslColor;

  /** @override */
  interpolateTo(that: Color): Interpolator<Color>;
  interpolateTo(that: unknown): Interpolator<Color> | null;
  interpolateTo(that: unknown): Interpolator<Color> | null {
    if (that instanceof Color) {
      return RgbColorInterpolator(this.rgb(), that.rgb());
    }
    return null;
  }

  /** @override */
  abstract equivalentTo(that: unknown, epsilon?: number): boolean;

  /** @override */
  abstract equals(other: unknown): boolean;

  /** @override */
  abstract hashCode(): number;

  /** @override */
  abstract debug<T>(output: Output<T>): Output<T>;

  abstract toHexString(): string;

  abstract toRgbString(): string;

  abstract toHslString(): string;

  /** @override */
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

  static hsl(h: AngleLike, s: number, l: number, a?: number): HslColor {
    if (typeof h !== "number") {
      h = Angle.fromLike(h).degValue();
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

  static fromLike<T extends ColorLike | null | undefined>(value: T): Color | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Color) {
      return value as Color | Uninitable<T>;
    } else if (typeof value === "string") {
      return Color.parse(value);
    }
    return Color.fromInit(value);
  }

  static fromInit(value: ColorInit): Color {
    if (RgbColorInit[Symbol.hasInstance](value)) {
      return RgbColor.fromInit(value);
    } else if (HslColorInit[Symbol.hasInstance](value)) {
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

  @Lazy
  static form(): Form<Color, ColorLike> {
    return new ColorForm(Color.transparent());
  }

  /** @internal */
  static Darker: number = 0.7;
  /** @internal */
  static Brighter: number = 1 / this.Darker;
}

/** @internal */
export class ColorForm extends Form<Color, ColorLike> {
  constructor(unit: Color | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly unit: Color | undefined;

  override withUnit(unit: Color | undefined): Form<Color, ColorLike> {
    if (unit === this.unit) {
      return this;
    }
    return new ColorForm(unit);
  }

  override mold(color: ColorLike): Item {
    color = Color.fromLike(color);
    return Text.from(color.toString());
  }

  override cast(item: Item): Color | undefined {
    const value = item.toValue();
    let color: Color | null = null;
    try {
      color = Color.fromValue(value);
      if (color === void 0) {
        const string = value.stringValue(void 0);
        if (string !== void 0) {
          color = Color.parse(string);
        }
      }
    } catch (e) {
      // swallow
    }
    return color !== null ? color : void 0;
  }
}

/** @internal */
export class ColorParser extends Parser<Color> {
  private readonly identOutput: Output<string> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.step = step;
  }

  override feed(input: Input): Parser<Color> {
    return ColorParser.parse(input, this.identOutput, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, step: number = 1): Parser<Color> {
    let c = 0;
    if (step === 1) {
      if (input.isCont()) {
        if (input.head() === 35/*'#'*/) {
          return HexColorParser.parse(input);
        } else {
          step = 2;
        }
      } else if (input.isDone()) {
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
          case "rgb":
          case "rgba": return RgbColorParser.parseRest(input);
          case "hsl":
          case "hsla": return HslColorParser.parseRest(input);
          default: {
            const color = Color.forName(ident);
            if (color !== null) {
              return Parser.done(color);
            } else {
              return Parser.error(Diagnostic.message("unknown color: " + ident, input));
            }
          }
        }
      }
    }
    return new ColorParser(identOutput, step);
  }
}

/** @internal */
export class ColorChannel {
  constructor(value: number, units?: string) {
    this.value = value;
    this.units = units !== void 0 ? units : "";
  }

  readonly value: number;

  readonly units: string;

  scale(k: number): number {
    if (this.units === "%") {
      return this.value * k / 100;
    } else {
      return this.value;
    }
  }
}

/** @internal */
export class ColorChannelParser extends Parser<ColorChannel> {
  private readonly valueParser: Parser<number> | undefined;
  private readonly step: number | undefined;

  constructor(valueParser?: Parser<number>, step?: number) {
    super();
    this.valueParser = valueParser;
    this.step = step;
  }

  override feed(input: Input): Parser<ColorChannel> {
    return ColorChannelParser.parse(input, this.valueParser, this.step);
  }

  static parse(input: Input, valueParser?: Parser<number>, step: number = 1): Parser<ColorChannel> {
    if (step === 1) {
      if (valueParser === void 0) {
        valueParser = Base10.parseNumber(input);
      } else {
        valueParser = valueParser.feed(input);
      }
      if (valueParser.isDone()) {
        step = 2;
      } else if (valueParser.isError()) {
        return valueParser.asError();
      }
    }
    if (step === 2) {
      if (input.isCont() && input.head() === 37/*'%'*/) {
        input = input.step();
        return Parser.done(new ColorChannel(valueParser!.bind(), "%"));
      } else if (!input.isEmpty()) {
        return Parser.done(new ColorChannel(valueParser!.bind()));
      }
    }
    return new ColorChannelParser(valueParser, step);
  }
}
