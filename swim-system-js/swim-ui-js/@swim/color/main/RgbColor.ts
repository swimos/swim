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

import {Murmur3} from "@swim/util";
import {Output, Base16} from "@swim/codec";
import {Item, Value} from "@swim/structure";
import {BRIGHTER, DARKER, Color} from "./Color";
import {HslColor} from "./HslColor";

export type AnyRgbColor = RgbColor | RgbColorInit | string;

export interface RgbColorInit {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a?: number;
}

export class RgbColor extends Color {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;

  constructor(r: number, g: number, b: number, a: number = 1) {
    super();
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  isDefined(): boolean {
    return this.r !== 0 || this.g !== 0 || this.b !== 0 || this.a !== 1;
  }

  alpha(): number;
  alpha(a: number): RgbColor;
  alpha(a?: number): number | RgbColor {
    if (a === void 0) {
      return this.a;
    } else if (this.a !== a) {
      return new RgbColor(this.r, this.g, this.b, a);
    } else {
      return this;
    }
  }

  lightness(): number {
    const r = this.r / 255;
    const g = this.g / 255;
    const b = this.b / 255;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    return (max + min) / 2;
  }

  brighter(k?: number): RgbColor {
    k = k === void 0 ? BRIGHTER : Math.pow(BRIGHTER, k);
    return k !== 1 ? new RgbColor(this.r * k, this.g * k, this.b * k, this.a) : this;
  }

  darker(k?: number): RgbColor {
    k = k === void 0 ? DARKER : Math.pow(DARKER, k);
    return k !== 1 ? new RgbColor(this.r * k, this.g * k, this.b * k, this.a) : this;
  }

  rgb(): RgbColor {
    return this;
  }

  hsl(): HslColor {
    const r = this.r / 255;
    const g = this.g / 255;
    const b = this.b / 255;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    let h = NaN;
    let s = max - min;
    const l = (max + min) / 2;
    if (s) {
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
    return new Color.Hsl(h, s, l, this.a);
  }

  equals(other: unknown): boolean {
    if (other instanceof RgbColor) {
      return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
    }
    return false;
  }

  hashCode(): number {
    if (RgbColor._hashSeed === void 0) {
      RgbColor._hashSeed = Murmur3.seed(RgbColor);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(RgbColor._hashSeed,
        Murmur3.hash(this.r)), Murmur3.hash(this.g)), Murmur3.hash(this.b)), Murmur3.hash(this.a)));
  }

  debug(output: Output): void {
    output = output.write("Color").write(46/*'.'*/).write("rgb").write(40/*'('*/)
        .debug(this.r).write(", ").debug(this.g).write(", ").debug(this.b);
    if (this.a !== 1) {
      output = output.write(", ").debug(this.a);
    }
    output = output.write(41/*')'*/);
  }

  toHexString(): string {
    const r = Math.min(Math.max(0, Math.round(this.r || 0)), 255);
    const g = Math.min(Math.max(0, Math.round(this.g || 0)), 255);
    const b = Math.min(Math.max(0, Math.round(this.b || 0)), 255);
    let s = "#";
    const base16Alphabet = Base16.lowercase().alphabet();
    s += base16Alphabet.charAt(r >>> 4 & 0xf);
    s += base16Alphabet.charAt(r & 0xf);
    s += base16Alphabet.charAt(g >>> 4 & 0xf);
    s += base16Alphabet.charAt(g & 0xf);
    s += base16Alphabet.charAt(b >>> 4 & 0xf);
    s += base16Alphabet.charAt(b & 0xf);
    return s;
  }

  toString(): string {
    let a = this.a;
    a = isNaN(a) ? 1 : Math.max(0, Math.min(this.a, 1));
    if (a === 1) {
      return this.toHexString();
    } else {
      let s = a === 1 ? "rgb" : "rgba";
      s += "(";
      s += Math.max(0, Math.min(Math.round(this.r) || 0, 255));
      s += ",";
      s += Math.max(0, Math.min(Math.round(this.g) || 0, 255));
      s += ",";
      s += Math.max(0, Math.min(Math.round(this.b) || 0, 255));
      if (a !== 1) {
        s += ",";
        s += a;
      }
      s += ")";
      return s;
    }
  }

  private static _hashSeed?: number;

  static transparent(alpha: number = 0): RgbColor {
    return new RgbColor(0, 0, 0, alpha);
  }

  static black(): RgbColor {
    return new RgbColor(0, 0, 0, 1);
  }

  static white(): RgbColor {
    return new RgbColor(255, 255, 255, 1);
  }

  static fromValue(value: Value): RgbColor | undefined {
    const tag = value.tag();
    let positional: boolean;
    if (tag === "rgb" || tag === "rgba") {
      value = value.header(tag);
      positional = true;
    } else {
      positional = false;
    }
    let r: number | undefined;
    let g: number | undefined;
    let b: number | undefined;
    let a: number | undefined;
    value.forEach(function (member: Item, index: number): void {
      const key = member.key.stringValue();
      if (key !== void 0) {
        if (key === "r") {
          r = member.toValue().numberValue(r);
        } else if (key === "g") {
          g = member.toValue().numberValue(g);
        } else if (key === "b") {
          b = member.toValue().numberValue(b);
        } else if (key === "a") {
          a = member.toValue().numberValue(a);
        }
      } else if (member instanceof Value && positional) {
        if (index === 0) {
          r = member.numberValue(r);
        } else if (index === 1) {
          g = member.numberValue(g);
        } else if (index === 2) {
          b = member.numberValue(b);
        } else if (index === 3) {
          a = member.numberValue(a);
        }
      }
    });
    if (r !== void 0 && g !== void 0 && b !== void 0) {
      return Color.rgb(r, g, b, a);
    }
    return void 0;
  }

  static parse(str: string): RgbColor {
    return Color.parse(str).rgb();
  }

  /** @hidden */
  static isInit(value: unknown): value is RgbColorInit {
    if (value && typeof value === "object") {
      const init = value as RgbColorInit;
      return init.r !== void 0 && init.g !== void 0 && init.b !== void 0;
    }
    return false;
  }
}
Color.Rgb = RgbColor;
