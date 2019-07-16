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

import {Murmur3} from "@swim/util";
import {Output} from "@swim/codec";
import {Item, Value} from "@swim/structure";
import {AnyAngle, Angle} from "@swim/angle";
import {BRIGHTER, DARKER, Color} from "./Color";
import {RgbColor} from "./RgbColor";

export type AnyHslColor = HslColor | HslColorInit | string;

export interface HslColorInit {
  readonly h: AnyAngle;
  readonly s: number;
  readonly l: number;
  readonly a?: number;
}

export class HslColor extends Color {
  readonly h: number;
  readonly s: number;
  readonly l: number;
  readonly a: number;

  constructor(h: number, s: number, l: number, a: number = 1) {
    super();
    this.h = h;
    this.s = s;
    this.l = l;
    this.a = a;
  }

  isDefined(): boolean {
    return this.h !== 0 || this.s !== 0 || this.l !== 0 || this.a !== 1;
  }

  alpha(): number;
  alpha(a: number): HslColor;
  alpha(a?: number): number | HslColor {
    if (a === void 0) {
      return this.a;
    } else if (this.a !== a) {
      return new HslColor(this.h, this.s, this.l, a);
    } else {
      return this;
    }
  }

  lightness(): number {
    return this.l;
  }

  brighter(k?: number): HslColor {
    k = k === void 0 ? BRIGHTER : Math.pow(BRIGHTER, k);
    return k !== 1 ? new HslColor(this.h, this.s, this.l * k, this.a) : this;
  }

  darker(k?: number): HslColor {
    k = k === void 0 ? DARKER : Math.pow(DARKER, k);
    return k !== 1 ? new HslColor(this.h, this.s, this.l * k, this.a) : this;
  }

  private static toRgb(h: number, m1: number, m2: number): number {
    return 255 * (h < 60 ? m1 + (m2 - m1) * h / 60
                         : h < 180 ? m2
                                   : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
                                             : m1);
  }

  rgb(): RgbColor {
    const h = this.h % 360 + +(this.h < 0) * 360;
    const s = isNaN(h) || isNaN(this.s) ? 0 : this.s;
    const l = this.l;
    const m2 = l + (l < 0.5 ? l : 1 - l) * s;
    const m1 = 2 * l - m2;
    return new Color.Rgb(HslColor.toRgb(h >= 240 ? h - 240 : h + 120, m1, m2),
                         HslColor.toRgb(h, m1, m2),
                         HslColor.toRgb(h < 120 ? h + 240 : h - 120, m1, m2),
                         this.a);
  }

  hsl(): HslColor {
    return this;
  }

  equals(other: unknown): boolean {
    if (other instanceof HslColor) {
      return this.h === other.h && this.s === other.s && this.l === other.l && this.a === other.a;
    }
    return false;
  }

  hashCode(): number {
    if (HslColor._hashSeed === void 0) {
      HslColor._hashSeed = Murmur3.seed(HslColor);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(HslColor._hashSeed,
        Murmur3.hash(this.h)), Murmur3.hash(this.s)), Murmur3.hash(this.l)), Murmur3.hash(this.a)));
  }

  debug(output: Output): void {
    output = output.write("Color").write(46/*'.'*/).write("hsl").write(40/*'('*/)
        .debug(this.h).write(", ").debug(this.s).write(", ").debug(this.l);
    if (this.a !== 1) {
      output = output.write(", ").debug(this.a);
    }
    output = output.write(41/*')'*/);
  }

  toHexString(): string {
    return this.rgb().toHexString();
  }

  toString(): string {
    let a = this.a;
    a = isNaN(a) ? 1 : Math.max(0, Math.min(this.a, 1));
    let s = a === 1 ? "hsl" : "hsla";
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
    return s;
  }

  private static _hashSeed?: number;

  static transparent(alpha: number = 0): HslColor {
    return new HslColor(0, 0, 0, alpha);
  }

  static black(): HslColor {
    return new HslColor(0, 0, 0, 1);
  }

  static white(): HslColor {
    return new HslColor(0, 1, 1, 1);
  }

  static fromValue(value: Value): HslColor | undefined {
    const tag = value.tag();
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
      return Color.hsl(h, s, l, a);
    }
    return void 0;
  }

  static parse(str: string): HslColor {
    return Color.parse(str).hsl();
  }

  /** @hidden */
  static isInit(value: unknown): value is HslColorInit {
    if (value && typeof value === "object") {
      const init = value as HslColorInit;
      return init.h !== void 0 && init.s !== void 0 && init.l !== void 0;
    }
    return false;
  }
}
Color.Hsl = HslColor;
