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

import {Interpolator} from "@swim/interpolate";
import {AnyCircleR2, CircleR2} from "./CircleR2";
import {R2ShapeInterpolator} from "./R2ShapeInterpolator";

export class CircleR2Interpolator extends R2ShapeInterpolator<CircleR2, AnyCircleR2> {
  /** @hidden */
  readonly cx: number;
  /** @hidden */
  readonly dcx: number;
  /** @hidden */
  readonly cy: number;
  /** @hidden */
  readonly dcy: number;
  /** @hidden */
  readonly r: number;
  /** @hidden */
  readonly dr: number;

  constructor(s0: CircleR2, s1: CircleR2) {
    super();
    this.cx = s0.cx;
    this.dcx = s1.cx - this.cx;
    this.cy = s0.cy;
    this.dcy = s1.cy - this.cy;
    this.r = s0.r;
    this.dr = s1.r - this.r;
  }

  interpolate(u: number): CircleR2 {
    const cx = this.cx + this.dcx * u;
    const cy = this.cy + this.dcy * u;
    const r = this.r + this.dr * u;
    return new CircleR2(cx, cy, r);
  }

  deinterpolate(s: AnyCircleR2): number {
    return 0;
  }

  range(): readonly [CircleR2, CircleR2];
  range(ss: readonly [AnyCircleR2, AnyCircleR2]): CircleR2Interpolator;
  range(s0: AnyCircleR2, s1: AnyCircleR2): CircleR2Interpolator;
  range(s0?: readonly [AnyCircleR2, AnyCircleR2] | AnyCircleR2,
        s1?: AnyCircleR2): readonly [CircleR2, CircleR2] | CircleR2Interpolator {
    if (s0 === void 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (s1 === void 0) {
      s0 = s0 as readonly [AnyCircleR2, AnyCircleR2];
      return CircleR2Interpolator.between(s0[0], s0[1]);
    } else {
      return CircleR2Interpolator.between(s0 as AnyCircleR2, s1);
    }
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

  static between(s0: AnyCircleR2, s1: AnyCircleR2): CircleR2Interpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof CircleR2 && b instanceof CircleR2) {
      return new CircleR2Interpolator(a, b);
    } else if (CircleR2.isAny(a) && CircleR2.isAny(b)) {
      return new CircleR2Interpolator(CircleR2.fromAny(a), CircleR2.fromAny(b));
    }
    return R2ShapeInterpolator.between(a, b);
  }
}
R2ShapeInterpolator.CircleR2 = CircleR2Interpolator;
