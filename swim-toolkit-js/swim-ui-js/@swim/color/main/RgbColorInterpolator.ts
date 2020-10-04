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
import {RgbColorInit, RgbColor} from "./RgbColor";
import {ColorInterpolator} from "./ColorInterpolator";

export class RgbColorInterpolator extends ColorInterpolator<RgbColor> {
  /** @hidden */
  readonly r0: number;
  /** @hidden */
  readonly dr: number;
  /** @hidden */
  readonly g0: number;
  /** @hidden */
  readonly dg: number;
  /** @hidden */
  readonly b0: number;
  /** @hidden */
  readonly db: number;
  /** @hidden */
  readonly a0: number;
  /** @hidden */
  readonly da: number;

  constructor(c0: RgbColor, c1: RgbColor) {
    super();
    this.r0 = c0.r;
    this.dr = c1.r - this.r0;
    this.g0 = c0.g;
    this.dg = c1.g - this.g0;
    this.b0 = c0.b;
    this.db = c1.b - this.b0;
    this.a0 = c0.a;
    this.da = c1.a - this.a0;
  }

  interpolate(u: number): RgbColor {
    const r = this.r0 + this.dr * u;
    const g = this.g0 + this.dg * u;
    const b = this.b0 + this.db * u;
    const a = this.a0 + this.da * u;
    return new RgbColor(r, g, b, a);
  }

  deinterpolate(c: AnyColor): number {
    c = Color.fromAny(c).rgb();
    const cr = (c as RgbColor).r - this.r0;
    const cg = (c as RgbColor).g - this.g0;
    const cb = (c as RgbColor).b - this.b0;
    const ca = (c as RgbColor).a - this.a0;
    const dp = cr * this.dr + cg * this.dg + cb * this.db + ca * this.da;
    const lc = Math.sqrt(cr * cr + cg * cg + cb * cb + ca * ca);
    return lc !== 0 ? dp / lc : lc;
  }

  range(): readonly [RgbColor, RgbColor];
  range(cs: readonly [RgbColor | RgbColorInit, RgbColor | RgbColorInit]): RgbColorInterpolator;
  range(c0: RgbColor | RgbColorInit, c1: RgbColor | RgbColorInit): RgbColorInterpolator;
  range(cs: readonly [AnyColor, AnyColor]): ColorInterpolator;
  range(c0: AnyColor, c1: AnyColor): ColorInterpolator;
  range(c0?: readonly [AnyColor, AnyColor] | AnyColor,
        c1?: AnyColor): readonly [RgbColor, RgbColor] | ColorInterpolator {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (arguments.length === 1) {
      c0 = c0 as readonly [AnyColor, AnyColor];
      return RgbColorInterpolator.between(c0[0], c0[1]);
    } else {
      return RgbColorInterpolator.between(c0 as AnyColor, c1 as AnyColor);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof RgbColorInterpolator) {
      return this.r0 === that.r0 && this.dr === that.dr
          && this.g0 === that.g0 && this.dg === that.dg
          && this.b0 === that.b0 && this.db === that.db
          && this.a0 === that.a0 && this.da === that.da;
    }
    return false;
  }

  static between(c0: RgbColor | RgbColorInit, c1: RgbColor | RgbColorInit): RgbColorInterpolator;
  static between(c0: AnyColor, c1: AnyColor): ColorInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof RgbColor && b instanceof RgbColor) {
      return new RgbColorInterpolator(a, b);
    } else if (RgbColor.isInit(a) && RgbColor.isInit(b)) {
      return new RgbColorInterpolator(RgbColor.fromInit(a), RgbColor.fromInit(b));
    }
    return ColorInterpolator.between(a, b);
  }
}
ColorInterpolator.Rgb = RgbColorInterpolator;
