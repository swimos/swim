// Copyright 2015-2021 Swim Inc.
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

import {Lazy, Mutable, Murmur3, Numbers, Constructors, Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import {Item, Value} from "@swim/structure";
import {AnyAngle, Angle} from "@swim/math";
import {AnyColor, Color} from "../color/Color";
import {RgbColor} from "../rgb/RgbColor";
import {HslColorInterpolator} from "../"; // forward import

/** @public */
export type AnyHslColor = HslColor | HslColorInit | string;

/** @public */
export interface HslColorInit {
  readonly h: AnyAngle;
  readonly s: number;
  readonly l: number;
  readonly a?: number;
}

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
    } else if (this.a !== a) {
      return new HslColor(this.h, this.s, this.l, a);
    } else {
      return this;
    }
  }

  override get lightness(): number {
    return this.l;
  }

  override plus(that: AnyColor): HslColor {
    that = Color.fromAny(that).hsl();
    return new HslColor(this.h + (that as HslColor).h, this.s + (that as HslColor).s,
                        this.l + (that as HslColor).l, this.a + (that as HslColor).a);
  }

  override times(scalar: number): HslColor {
    return new HslColor(this.h * scalar, this.s * scalar, this.l * scalar, this.a * scalar);
  }

  override combine(that: AnyColor, scalar: number = 1): HslColor {
    that = Color.fromAny(that).hsl();
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

  private static toRgb(h: number, m1: number, m2: number): number {
    return 255 * (h < 60 ? m1 + (m2 - m1) * h / 60
                         : h < 180 ? m2
                                   : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
                                             : m1);
  }

  override rgb(): RgbColor {
    const h = this.h % 360 + +(this.h < 0) * 360;
    const s = isNaN(h) || isNaN(this.s) ? 0 : this.s;
    const l = this.l;
    const m2 = l + (l < 0.5 ? l : 1 - l) * s;
    const m1 = 2 * l - m2;
    return new RgbColor(HslColor.toRgb(h >= 240 ? h - 240 : h + 120, m1, m2),
                        HslColor.toRgb(h, m1, m2),
                        HslColor.toRgb(h < 120 ? h + 240 : h - 120, m1, m2),
                        this.a);
  }

  override hsl(): HslColor {
    return this;
  }

  override interpolateTo(that: HslColor): Interpolator<HslColor>;
  override interpolateTo(that: Color): Interpolator<Color>;
  override interpolateTo(that: unknown): Interpolator<Color> | null;
  override interpolateTo(that: unknown): Interpolator<Color> | null {
    if (that instanceof HslColor) {
      return HslColorInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
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

  /** @internal */
  readonly stringValue: string | undefined;

  override toString(): string {
    let s = this.stringValue;
    if (s === void 0) {
      let a = this.a;
      a = isNaN(a) ? 1 : Math.max(0, Math.min(this.a, 1));
      s = a === 1 ? "hsl" : "hsla";
      s += "(";
      s += Math.max(0, Math.min(Math.round(this.h) || 0, 360));
      s += ",";
      s += Math.max(0, Math.min(100 * Math.round(this.s) || 0, 100)) + "%";
      s += ",";
      s += Math.max(0, Math.min(100 * Math.round(this.l) || 0, 100)) + "%";
      if (a !== 1) {
        s += ",";
        s += a;
      }
      s += ")";
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

  static override fromInit(value: HslColorInit): HslColor {
    const h = typeof value.h === "number" ? value.h : Angle.fromAny(value.h).degValue();
    return new HslColor(h, value.s, value.l, value.a);
  }

  static override fromAny(value: AnyHslColor): HslColor {
    if (value === void 0 || value === null || value instanceof HslColor) {
      return value;
    } else if (typeof value === "string") {
      return HslColor.parse(value);
    } else if (HslColor.isInit(value)) {
      return HslColor.fromInit(value);
    }
    throw new TypeError("" + value);
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

  /** @internal */
  static override isInit(value: unknown): value is HslColorInit {
    if (typeof value === "object" && value !== null) {
      const init = value as HslColorInit;
      return Angle.isAny(init.h)
          && typeof init.s === "number"
          && typeof init.l === "number"
          && (typeof init.a === "number" || typeof init.a === "undefined");
    }
    return false;
  }

  /** @internal */
  static override isAny(value: unknown): value is AnyHslColor {
    return value instanceof HslColor
        || HslColor.isInit(value)
        || typeof value === "string";
  }
}
