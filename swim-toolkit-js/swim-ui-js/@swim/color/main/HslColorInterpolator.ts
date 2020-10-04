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

import {Interpolator} from "@swim/interpolate";
import {AnyColor, Color} from "./Color";
import {HslColorInit, HslColor} from "./HslColor";
import {ColorInterpolator} from "./ColorInterpolator";

export class HslColorInterpolator extends ColorInterpolator<HslColor> {
  /** @hidden */
  readonly h0: number;
  /** @hidden */
  readonly dh: number;
  /** @hidden */
  readonly s0: number;
  /** @hidden */
  readonly ds: number;
  /** @hidden */
  readonly l0: number;
  /** @hidden */
  readonly dl: number;
  /** @hidden */
  readonly a0: number;
  /** @hidden */
  readonly da: number;

  constructor(c0: HslColor, c1: HslColor) {
    super();
    this.h0 = c0.h;
    this.dh = c1.h - this.h0;
    this.s0 = c0.s;
    this.ds = c1.s - this.s0;
    this.l0 = c0.l;
    this.dl = c1.l - this.l0;
    this.a0 = c0.a;
    this.da = c1.a - this.a0;
  }

  interpolate(u: number): HslColor {
    const h = this.h0 + this.dh * u;
    const s = this.s0 + this.ds * u;
    const l = this.l0 + this.dl * u;
    const a = this.a0 + this.da * u;
    return new HslColor(h, s, l, a);
  }

  deinterpolate(c: AnyColor): number {
    c = Color.fromAny(c).hsl();
    const ch = (c as HslColor).h - this.h0;
    const cs = (c as HslColor).s - this.s0;
    const cl = (c as HslColor).l - this.l0;
    const ca = (c as HslColor).a - this.a0;
    const dp = ch * this.dh + cs * this.ds + cl * this.dl + ca * this.da;
    const lc = Math.sqrt(ch * ch + cs * cs + cl * cl + ca * ca);
    return lc !== 0 ? dp / lc : lc;
  }

  range(): readonly [HslColor, HslColor];
  range(cs: readonly [HslColor | HslColorInit, HslColor | HslColorInit]): HslColorInterpolator;
  range(c0: HslColor | HslColorInit, c1: HslColor | HslColorInit): HslColorInterpolator;
  range(cs: readonly [AnyColor, AnyColor]): ColorInterpolator;
  range(c0: AnyColor, c1: AnyColor): ColorInterpolator;
  range(c0?: readonly [AnyColor, AnyColor] | AnyColor,
        c1?: AnyColor): readonly [HslColor, HslColor] | ColorInterpolator {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (arguments.length === 1) {
      c0 = c0 as readonly [AnyColor, AnyColor];
      return HslColorInterpolator.between(c0[0], c0[1]);
    } else {
      return HslColorInterpolator.between(c0 as AnyColor, c1 as AnyColor);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof HslColorInterpolator) {
      return this.h0 === that.h0 && this.dh === that.dh
          && this.s0 === that.s0 && this.ds === that.ds
          && this.l0 === that.l0 && this.dl === that.dl
          && this.a0 === that.a0 && this.da === that.da;
    }
    return false;
  }

  static between(c0: HslColor | HslColorInit, c1: HslColor | HslColorInit): HslColorInterpolator;
  static between(c0: AnyColor, c1: AnyColor): ColorInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof HslColor && b instanceof HslColor) {
      return new HslColorInterpolator(a, b);
    } else if (HslColor.isInit(a) && HslColor.isInit(b)) {
      return new HslColorInterpolator(HslColor.fromInit(a), HslColor.fromInit(b));
    }
    return ColorInterpolator.between(a, b);
  }
}
ColorInterpolator.Hsl = HslColorInterpolator;
