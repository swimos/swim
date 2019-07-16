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

import {HashCode} from "@swim/util";
import {Output, Parser, Debug, Diagnostic, Unicode} from "@swim/codec";
import {Value, Form} from "@swim/structure";
import {AnyAngle, Angle} from "@swim/angle";
import {RgbColorInit, RgbColor} from "./RgbColor";
import {HslColorInit, HslColor} from "./HslColor";
import {RgbColorParser} from "./RgbColorParser";
import {HexColorParser} from "./HexColorParser";
import {HslColorParser} from "./HslColorParser";
import {ColorParser} from "./ColorParser";
import {ColorForm} from "./ColorForm";

/** @hidden */
export const DARKER: number = 0.7;
/** @hidden */
export const BRIGHTER: number = 1 / DARKER;

export type AnyColor = Color | ColorInit | string;

export type ColorInit = RgbColorInit | HslColorInit;

export abstract class Color implements HashCode, Debug {
  abstract isDefined(): boolean;

  abstract alpha(): number;
  abstract alpha(a: number): Color;

  abstract lightness(): number;

  abstract brighter(k?: number): Color;

  abstract darker(k?: number): Color;

  contrast(k?: number): Color {
    return this.lightness() < 0.67 ? this.brighter(k) : this.darker(k);
  }

  abstract rgb(): RgbColor;

  abstract hsl(): HslColor;

  abstract equals(other: unknown): boolean;

  abstract hashCode(): number;

  abstract debug(output: Output): void;

  abstract toHexString(): string;

  abstract toString(): string;

  static transparent(alpha?: number): Color {
    return Color.Rgb.transparent(alpha);
  }

  static black(): Color {
    return Color.Rgb.black();
  }

  static white(): Color {
    return Color.Rgb.white();
  }

  static rgb(value: AnyColor): RgbColor;
  static rgb(r: number, g: number, b: number, a?: number): RgbColor;
  static rgb(r: AnyColor | number, g?: number, b?: number, a?: number): RgbColor {
    if (arguments.length === 1) {
      return Color.fromAny(r as AnyColor).rgb();
    } else {
      return new Color.Rgb(r as number, g!, b!, a);
    }
  }

  static hsl(value: AnyColor): HslColor;
  static hsl(h: AnyAngle, s: number, l: number, a?: number): HslColor;
  static hsl(h: AnyColor | AnyAngle, s?: number, l?: number, a?: number): HslColor {
    if (arguments.length === 1) {
      return Color.fromAny(h as AnyColor).hsl();
    } else {
      h = typeof h === "number" ? h : Angle.fromAny(h as AnyAngle).degValue();
      return new Color.Hsl(h, s!, l!, a);
    }
  }

  static fromName(name: string): Color | undefined {
    switch (name) {
      case "transparent": return Color.transparent();
      case "black": return Color.black();
      case "white": return Color.white();
      default: return void 0;
    }
  }

  static fromAny(value: AnyColor): Color {
    if (value instanceof Color) {
      return value;
    } else if (typeof value === "string") {
      return Color.parse(value);
    } else if (value && typeof value === "object") {
      const rgb = value as RgbColorInit;
      if (rgb.r !== void 0 && rgb.g !== void 0 && rgb.b !== void 0) {
        return new Color.Rgb(rgb.r, rgb.g, rgb.b, rgb.a);
      }
      const hsl = value as HslColorInit;
      if (hsl.h !== void 0 && hsl.s !== void 0 && hsl.l !== void 0) {
        const h = typeof hsl.h === "number" ? hsl.h : Angle.fromAny(hsl.h).degValue();
        return new Color.Hsl(h, hsl.s, hsl.l, hsl.a);
      }
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): Color | undefined {
    let color: Color | undefined;
    color = Color.Rgb.fromValue(value);
    if (!color) {
      color = Color.Hsl.fromValue(value);
    }
    return color;
  }

  static parse(string: string): Color {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = Color.Parser.parse(input);
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

  /** @hidden */
  static isInit(value: unknown): value is ColorInit {
    return Color.Rgb.isInit(value) || Color.Hsl.isInit(value);
  }

  private static _form: Form<Color, AnyColor>;
  static form(unit?: AnyColor): Form<Color, AnyColor> {
    if (unit !== void 0) {
      unit = Color.fromAny(unit);
    }
    if (unit !== Color.transparent()) {
      return new Color.Form(unit);
    } else {
      if (!Color._form) {
        Color._form = new Color.Form(Color.transparent());
      }
      return Color._form;
    }
  }

  // Forward type declarations
  /** @hidden */
  static Rgb: typeof RgbColor; // defined by RgbColor
  /** @hidden */
  static Hsl: typeof HslColor; // defined by HslColor
  /** @hidden */
  static HexParser: typeof HexColorParser; // defined by HexColorParser
  /** @hidden */
  static RgbParser: typeof RgbColorParser; // defined by RgbColorParser
  /** @hidden */
  static HslParser: typeof HslColorParser; // defined by HslColorParser
  /** @hidden */
  static Parser: typeof ColorParser; // defined by ColorParser
  /** @hidden */
  static Form: typeof ColorForm; // defined by ColorForm
}
