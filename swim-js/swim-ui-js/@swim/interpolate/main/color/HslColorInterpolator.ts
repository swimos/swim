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

import {AnyColor, Color, HslColor} from "@swim/color";
import {ColorInterpolator} from "../ColorInterpolator";

export class HslColorInterpolator extends ColorInterpolator<HslColor> {
  private readonly h0: number;
  private readonly dh: number;
  private readonly s0: number;
  private readonly ds: number;
  private readonly l0: number;
  private readonly dl: number;
  private readonly a0: number;
  private readonly da: number;

  constructor(c0: AnyColor | undefined, c1: AnyColor | undefined) {
    super();
    if (c0 !== void 0) {
      c0 = Color.hsl(c0);
    }
    if (c1 !== void 0) {
      c1 = Color.hsl(c1);
    }
    if (!c0 && !c1) {
      c1 = c0 = HslColor.transparent();
    } else if (!c1) {
      c1 = c0;
    } else if (!c0) {
      c0 = c1;
    }
    this.h0 = (c0 as HslColor).h;
    this.dh = (c1 as HslColor).h - this.h0;
    this.s0 = (c0 as HslColor).s;
    this.ds = (c1 as HslColor).s - this.s0;
    this.l0 = (c0 as HslColor).l;
    this.dl = (c1 as HslColor).l - this.l0;
    this.a0 = (c0 as HslColor).a;
    this.da = (c1 as HslColor).a - this.a0;
  }

  interpolate(u: number): HslColor {
    const h = this.h0 + this.dh * u;
    const s = this.s0 + this.ds * u;
    const l = this.l0 + this.dl * u;
    const a = this.a0 + this.da * u;
    return new HslColor(h, s, l, a);
  }

  deinterpolate(c: AnyColor): number {
    c = Color.hsl(c);
    const ch = (c as HslColor).h - this.h0;
    const cs = (c as HslColor).s - this.s0;
    const cl = (c as HslColor).l - this.l0;
    const ca = (c as HslColor).a - this.a0;
    const dp = ch * this.dh + cs * this.ds + cl * this.dl + ca * this.da;
    const lc = Math.sqrt(ch * ch + cs * cs + cl * cl + ca * ca);
    return lc ? dp / lc : lc;
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
}
ColorInterpolator.Hsl = HslColorInterpolator;
