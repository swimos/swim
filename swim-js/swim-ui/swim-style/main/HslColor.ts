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
import type {Mutable} from "@swim/util";
import {Lazy} from "@swim/util";
import {Murmur3} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import {Objects} from "@swim/util";
import {Interpolator} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import {Unicode} from "@swim/codec";
import type {Item} from "@swim/structure";
import {Value} from "@swim/structure";
import type {AngleLike} from "@swim/math";
import {Angle} from "@swim/math";
import {AngleParser} from "@swim/math";
import type {ColorLike} from "./Color";
import {Color} from "./Color";
import type {ColorChannel} from "./Color";
import {ColorChannelParser} from "./Color";
import {RgbColor} from "./RgbColor";

/** @public */
export type HslColorLike = HslColor | HslColorInit | string;

/** @public */
export const HslColorLike = {
  [Symbol.hasInstance](instance: unknown): instance is HslColorLike {
    return instance instanceof HslColor
        || HslColorInit[Symbol.hasInstance](instance)
        || typeof instance === "string";
  },
};

/** @public */
export interface HslColorInit {
  readonly h: AngleLike;
  readonly s: number;
  readonly l: number;
  readonly a?: number;
}

/** @public */
export const HslColorInit = {
  [Symbol.hasInstance](instance: unknown): instance is HslColorInit {
    return Objects.hasAllKeys(instance, "h", "s", "l");
  },
};

/** @public */
export class HslColor extends Color {
  constructor(h: number, s: number, l: number, a: number = 1) {
    super();
    this.h = h;
    this.s = s;
    this.l = l;
    this.a = a;
    this.stringValue = void 0;
  }

  override likeType?(like: HslColorInit | string): void;

  override isDefined(): boolean {
    return isFinite(this.h) && isFinite(this.s)
        && isFinite(this.l) && isFinite(this.a);
  }

  readonly h: number;

  readonly s: number;

  readonly l: number;

  readonly a: number;

  override alpha(): number;
  override alpha(a: number): HslColor;
  override alpha(a?: number): number | HslColor {
    if (a === void 0) {
      return this.a;
    } else if (this.a === a) {
      return this;
    }
    return new HslColor(this.h, this.s, this.l, a);
  }

  override get lightness(): number {
    return this.l;
  }

  override plus(that: ColorLike): HslColor {
    that = Color.fromLike(that).hsl();
    return new HslColor(this.h + (that as HslColor).h, this.s + (that as HslColor).s,
                        this.l + (that as HslColor).l, this.a + (that as HslColor).a);
  }

  override times(scalar: number): HslColor {
    return new HslColor(this.h * scalar, this.s * scalar, this.l * scalar, this.a * scalar);
  }

  override combine(that: ColorLike, scalar: number = 1): HslColor {
    that = Color.fromLike(that).hsl();
    return new HslColor(this.h + (that as HslColor).h * scalar, this.s + (that as HslColor).s * scalar,
                        this.l + (that as HslColor).l * scalar, this.a + (that as HslColor).a * scalar);
  }

  override lighter(k?: number): HslColor {
    k = k === void 0 ? Color.Brighter : Math.pow(Color.Brighter, k);
    return k !== 1 ? new HslColor(this.h, this.s, this.l * k, this.a) : this;
  }

  override darker(k?: number): HslColor {
    k = k === void 0 ? Color.Darker : Math.pow(Color.Darker, k);
    return k !== 1 ? new HslColor(this.h, this.s, this.l * k, this.a) : this;
  }

  override rgb(): RgbColor {
    return RgbColor.fromHsl(this.h, this.s, this.l, this.a);
  }

  override hsl(): HslColor {
    return this;
  }

  override interpolateTo(that: Color): Interpolator<HslColor>;
  override interpolateTo(that: unknown): Interpolator<Color> | null;
  override interpolateTo(that: unknown): Interpolator<Color> | null {
    if (that instanceof Color) {
      return HslColorInterpolator(this, that);
    }
    return super.interpolateTo(that);
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Color) {
      that = that.hsl();
      return Numbers.equivalent(this.h, (that as HslColor).h, epsilon)
          && Numbers.equivalent(this.s, (that as HslColor).s, epsilon)
          && Numbers.equivalent(this.l, (that as HslColor).l, epsilon)
          && Numbers.equivalent(this.a, (that as HslColor).a, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof HslColor) {
      return this.h === that.h && this.s === that.s && this.l === that.l && this.a === that.a;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Constructors.hash(HslColor),
        Numbers.hash(this.h)), Numbers.hash(this.s)), Numbers.hash(this.l)), Numbers.hash(this.a)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Color").write(46/*'.'*/).write("hsl").write(40/*'('*/)
                   .debug(this.h).write(", ").debug(this.s).write(", ").debug(this.l);
    if (this.a !== 1) {
      output = output.write(", ").debug(this.a);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  override toHexString(): string {
    return this.rgb().toHexString();
  }

  override toRgbString(): string {
    return this.rgb().toRgbString();
  }

  override toHslString(): string {
    let a = this.a;
    a = isNaN(a) ? 1 : Math.max(0, Math.min(this.a, 1));
    let s = a === 1 ? "hsl" : "hsla";
    s += "(";
    s += Math.max(0, Math.min(Math.round(this.h || 0), 360));
    s += ",";
    s += Math.max(0, Math.min(Math.round(100 * (this.s || 0)), 100)) + "%";
    s += ",";
    s += Math.max(0, Math.min(Math.round(100 * (this.l || 0)), 100)) + "%";
    if (a !== 1) {
      s += ",";
      s += a;
    }
    s += ")";
    return s;
  }

  /** @internal */
  readonly stringValue: string | undefined;

  override toString(): string {
    let s = this.stringValue;
    if (s === void 0) {
      s = this.toHslString();
      (this as Mutable<this>).stringValue = s;
    }
    return s;
  }

  @Lazy
  static override transparent(): HslColor {
    return new HslColor(0, 0, 0, 0);
  }

  static override black(alpha: number = 1): HslColor {
    return new HslColor(0, 0, 0, alpha);
  }

  static override white(alpha: number = 1): HslColor {
    return new HslColor(0, 1, 1, alpha);
  }

  static fromRgb(r: number, g: number, b: number, a?: number): HslColor {
    r /= 255;
    g /= 255;
    b /= 255;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    let h = NaN;
    let s = max - min;
    const l = (max + min) / 2;
    if (s !== 0) {
      if (r === max) {
        h = (g - b) / s + +(g < b) * 6;
      } else if (g === max) {
        h = (b - r) / s + 2;
      } else {
        h = (r - g) / s + 4;
      }
      s /= l < 0.5 ? max + min : 2 - (max + min);
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new HslColor(h, s, l, a);
  }

  static override fromLike<T extends HslColorLike | null | undefined>(value: T): HslColor | Uninitable<T>;
  static override fromLike<T extends ColorLike | null | undefined>(value: T): never;
  static override fromLike<T extends HslColorLike | null | undefined>(value: T): HslColor | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof HslColor) {
      return value as HslColor | Uninitable<T>;
    } else if (typeof value === "string") {
      return HslColor.parse(value);
    } else if (HslColorInit[Symbol.hasInstance](value)) {
      return HslColor.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static override fromInit(value: HslColorInit): HslColor {
    const h = typeof value.h === "number" ? value.h : Angle.fromLike(value.h).degValue();
    return new HslColor(h, value.s, value.l, value.a);
  }

  static override fromValue(value: Value): HslColor | null {
    const tag = value.tag;
    let positional: boolean;
    if (tag === "hsl" || tag === "hsla") {
      value = value.header(tag);
      positional = true;
    } else {
      positional = false;
    }
    let h: Angle | undefined;
    let s: number | undefined;
    let l: number | undefined;
    let a: number | undefined;
    value.forEach(function (member: Item, index: number): void {
      const key = member.key.stringValue();
      if (key !== void 0) {
        if (key === "h") {
          h = member.toValue().cast(Angle.form(), h);
        } else if (key === "s") {
          s = member.toValue().numberValue(s);
        } else if (key === "l") {
          l = member.toValue().numberValue(l);
        } else if (key === "a") {
          a = member.toValue().numberValue(a);
        }
      } else if (member instanceof Value && positional) {
        if (index === 0) {
          h = member.cast(Angle.form(), h);
        } else if (index === 1) {
          s = member.numberValue(s);
        } else if (index === 2) {
          l = member.numberValue(l);
        } else if (index === 3) {
          a = member.numberValue(a);
        }
      }
    });
    if (h !== void 0 && s !== void 0 && l !== void 0) {
      return new HslColor(h.degValue(), s, l, a);
    }
    return null;
  }

  static override parse(str: string): HslColor {
    return Color.parse(str).hsl();
  }
}

/** @internal */
export const HslColorInterpolator = (function (_super: typeof Interpolator) {
  const HslColorInterpolator = function (c0: Color, c1: Color): Interpolator<HslColor> {
    const hsl0 = c0.hsl();
    const hsl1 = c1.hsl();
    const interpolator = function (u: number): HslColor {
      const hsl0 = interpolator[0];
      const hsl1 = interpolator[1];
      const h = hsl0.h + u * (hsl1.h - hsl0.h);
      const s = hsl0.s + u * (hsl1.s - hsl0.s);
      const l = hsl0.l + u * (hsl1.l - hsl0.l);
      const a = hsl0.a + u * (hsl1.a - hsl0.a);
      return new HslColor(h, s, l, a);
    } as Interpolator<HslColor>;
    Object.setPrototypeOf(interpolator, HslColorInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = hsl0;
    (interpolator as Mutable<typeof interpolator>)[1] = hsl1;
    return interpolator;
  } as {
    (c0: Color, c1: Color): Interpolator<HslColor>;

    /** @internal */
    prototype: Interpolator<HslColor>;
  };

  HslColorInterpolator.prototype = Object.create(_super.prototype);
  HslColorInterpolator.prototype.constructor = HslColorInterpolator;

  return HslColorInterpolator;
})(Interpolator);

/** @internal */
export class HslColorParser extends Parser<HslColor> {
  private readonly hParser: Parser<Angle> | undefined;
  private readonly sParser: Parser<ColorChannel> | undefined;
  private readonly lParser: Parser<ColorChannel> | undefined;
  private readonly aParser: Parser<ColorChannel> | undefined;
  private readonly step: number | undefined;

  constructor(hParser?: Parser<Angle>, sParser?: Parser<ColorChannel>,
              lParser?: Parser<ColorChannel>, aParser?: Parser<ColorChannel>,
              step?: number) {
    super();
    this.hParser = hParser;
    this.sParser = sParser;
    this.lParser = lParser;
    this.aParser = aParser;
    this.step = step;
  }

  override feed(input: Input): Parser<HslColor> {
    return HslColorParser.parse(input, this.hParser, this.sParser,
                                this.lParser, this.aParser, this.step);
  }

  static parse(input: Input, hParser?: Parser<Angle>, sParser?: Parser<ColorChannel>,
               lParser?: Parser<ColorChannel>, aParser?: Parser<ColorChannel>,
               step?: number): Parser<HslColor> {
    let c = 0;
    if (step === 1) {
      if (input.isCont() && input.head() === 104/*'h'*/) {
        input = input.step();
        step = 2;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("h", input));
      }
    }
    if (step === 2) {
      if (input.isCont() && input.head() === 115/*'s'*/) {
        input = input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("s", input));
      }
    }
    if (step === 3) {
      if (input.isCont() && input.head() === 108/*'l'*/) {
        input = input.step();
        step = 4;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("l", input));
      }
    }
    if (step === 4) {
      if (input.isCont() && input.head() === 97/*'a'*/) {
        input = input.step();
        step = 5;
      } else if (!input.isEmpty()) {
        step = 5;
      }
    }
    if (step === 5) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont() && c === 40/*'('*/) {
        input = input.step();
        step = 6;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("(", input));
      }
    }
    if (step === 6) {
      if (hParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          hParser = AngleParser.parse(input, "deg");
        }
      } else {
        hParser = hParser.feed(input);
      }
      if (hParser !== void 0) {
        if (hParser.isDone()) {
          step = 7;
        } else if (hParser.isError()) {
          return hParser.asError();
        }
      }
    }
    if (step === 7) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input = input.step();
        }
        step = 8;
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 8) {
      if (sParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          sParser = ColorChannelParser.parse(input);
        }
      } else {
        sParser = sParser.feed(input);
      }
      if (sParser !== void 0) {
        if (sParser.isDone()) {
          if (sParser.bind().units === "%") {
            step = 9;
          } else {
            return Parser.error(Diagnostic.expected("%", input));
          }
        } else if (sParser.isError()) {
          return sParser.asError();
        }
      }
    }
    if (step === 9) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input = input.step();
        }
        step = 10;
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 10) {
      if (lParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (input.isCont()) {
          lParser = ColorChannelParser.parse(input);
        }
      } else {
        lParser = lParser.feed(input);
      }
      if (lParser !== void 0) {
        if (lParser.isDone()) {
          if (lParser.bind().units === "%") {
            step = 11;
          } else {
            return Parser.error(Diagnostic.expected("%", input));
          }
        } else if (lParser.isError()) {
          return lParser.asError();
        }
      }
    }
    if (step === 11) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 41/*')'*/) {
          input = input.step();
          return Parser.done(new HslColor(hParser!.bind().degValue(),
                                          sParser!.bind().scale(1),
                                          lParser!.bind().scale(1)));
        } else if (c === 44/*','*/ || c === 47/*'/'*/) {
          input = input.step();
        }
        step = 12;
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 12) {
      if (aParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          aParser = ColorChannelParser.parse(input);
        }
      } else {
        aParser = aParser.feed(input);
      }
      if (aParser !== void 0) {
        if (aParser.isDone()) {
          step = 13;
        } else if (aParser.isError()) {
          return aParser.asError();
        }
      }
    }
    if (step === 13) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont() && c === 41/*')'*/) {
        input = input.step();
        return Parser.done(new HslColor(hParser!.bind().degValue(),
                                        sParser!.bind().scale(1),
                                        lParser!.bind().scale(1),
                                        aParser!.bind().scale(1)));
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    return new HslColorParser(hParser, sParser, lParser, aParser, step);
  }

  /** @internal */
  static parseRest(input: Input): Parser<HslColor> {
    return HslColorParser.parse(input, void 0, void 0, void 0, void 0, 5);
  }
}
