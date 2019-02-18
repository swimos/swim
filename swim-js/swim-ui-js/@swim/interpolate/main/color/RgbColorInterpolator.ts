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

import {AnyColor, Color, RgbColor} from "@swim/color";
import {ColorInterpolator} from "../ColorInterpolator";

export class RgbColorInterpolator extends ColorInterpolator<RgbColor> {
  private readonly r0: number;
  private readonly dr: number;
  private readonly g0: number;
  private readonly dg: number;
  private readonly b0: number;
  private readonly db: number;
  private readonly a0: number;
  private readonly da: number;

  constructor(c0: AnyColor | undefined, c1: AnyColor | undefined) {
    super();
    if (c0 !== void 0) {
      c0 = Color.rgb(c0);
    }
    if (c1 !== void 0) {
      c1 = Color.rgb(c1);
    }
    if (!c0 && !c1) {
      c1 = c0 = RgbColor.transparent();
    } else if (!c1) {
      c1 = c0;
    } else if (!c0) {
      c0 = c1;
    }
    this.r0 = (c0 as RgbColor).r;
    this.dr = (c1 as RgbColor).r - this.r0;
    this.g0 = (c0 as RgbColor).g;
    this.dg = (c1 as RgbColor).g - this.g0;
    this.b0 = (c0 as RgbColor).b;
    this.db = (c1 as RgbColor).b - this.b0;
    this.a0 = (c0 as RgbColor).a;
    this.da = (c1 as RgbColor).a - this.a0;
  }

  interpolate(u: number): RgbColor {
    const r = this.r0 + this.dr * u;
    const g = this.g0 + this.dg * u;
    const b = this.b0 + this.db * u;
    const a = this.a0 + this.da * u;
    return new RgbColor(r, g, b, a);
  }

  deinterpolate(c: AnyColor): number {
    c = Color.rgb(c);
    const cr = (c as RgbColor).r - this.r0;
    const cg = (c as RgbColor).g - this.g0;
    const cb = (c as RgbColor).b - this.b0;
    const ca = (c as RgbColor).a - this.a0;
    const dp = cr * this.dr + cg * this.dg + cb * this.db + ca * this.da;
    const lc = Math.sqrt(cr * cr + cg * cg + cb * cb + ca * ca);
    return lc ? dp / lc : lc;
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
}
ColorInterpolator.Rgb = RgbColorInterpolator;
