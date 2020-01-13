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

import {AnyShape, Shape, CircleR2} from "@swim/math";
import {ShapeInterpolator} from "../ShapeInterpolator";

export class CircleR2Interpolator extends ShapeInterpolator<CircleR2> {
  private readonly cx: number;
  private readonly dcx: number;
  private readonly cy: number;
  private readonly dcy: number;
  private readonly r: number;
  private readonly dr: number;

  constructor(s0: AnyShape | undefined, s1: AnyShape | undefined) {
    super();
    if (s0 !== void 0) {
      s0 = Shape.fromAny(s0);
    }
    if (s1 !== void 0) {
      s1 = Shape.fromAny(s1);
    }
    if (!s0 && !s1) {
      s1 = s0 = new CircleR2(0, 0, 0);
    } else if (!s1) {
      s1 = s0;
    } else if (!s0) {
      s0 = s1;
    }
    this.cx = (s0 as CircleR2).cx;
    this.dcx = (s1 as CircleR2).cx - this.cx;
    this.cy = (s0 as CircleR2).cy;
    this.dcy = (s1 as CircleR2).cy - this.cy;
    this.r = (s0 as CircleR2).r;
    this.dr = (s1 as CircleR2).r - this.r;
  }

  interpolate(u: number): CircleR2 {
    const cx = this.cx + this.dcx * u;
    const cy = this.cy + this.dcy * u;
    const r = this.r + this.dr * u;
    return new CircleR2(cx, cy, r);
  }

  deinterpolate(s: AnyShape): number {
    return 0;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof CircleR2Interpolator) {
      return this.cx === that.cx && this.dcx === that.dcx
          && this.cy === that.cy && this.dcy === that.dcy
          && this.r === that.r && this.dr === that.dr;
    }
    return false;
  }
}
ShapeInterpolator.CircleR2 = CircleR2Interpolator;
