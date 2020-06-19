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
import {AnySegmentR2, SegmentR2} from "./SegmentR2";
import {R2ShapeInterpolator} from "./R2ShapeInterpolator";

export class SegmentR2Interpolator extends R2ShapeInterpolator<SegmentR2, AnySegmentR2> {
  /** @hidden */
  readonly x0: number;
  /** @hidden */
  readonly dx0: number;
  /** @hidden */
  readonly y0: number;
  /** @hidden */
  readonly dy0: number;
  /** @hidden */
  readonly x1: number;
  /** @hidden */
  readonly dx1: number;
  /** @hidden */
  readonly y1: number;
  /** @hidden */
  readonly dy1: number;

  constructor(s0: SegmentR2, s1: SegmentR2) {
    super();
    this.x0 = s0.x0;
    this.dx0 = s1.x0 - this.x0;
    this.y0 = s0.y0;
    this.dy0 = s1.y0 - this.y0;
    this.x1 = s0.x1;
    this.dx1 = s1.x1 - this.x1;
    this.y1 = s0.y1;
    this.dy1 = s1.y1 - this.y1;
  }

  interpolate(u: number): SegmentR2 {
    const x0 = this.x0 + this.dx0 * u;
    const y0 = this.y0 + this.dy0 * u;
    const x1 = this.x1 + this.dx1 * u;
    const y1 = this.y1 + this.dy1 * u;
    return new SegmentR2(x0, y0, x1, y1);
  }

  deinterpolate(s: AnySegmentR2): number {
    return 0;
  }

  range(): readonly [SegmentR2, SegmentR2];
  range(ss: readonly [AnySegmentR2, AnySegmentR2]): SegmentR2Interpolator;
  range(s0: AnySegmentR2, s1: AnySegmentR2): SegmentR2Interpolator;
  range(s0?: readonly [AnySegmentR2, AnySegmentR2] | AnySegmentR2,
        s1?: AnySegmentR2): readonly [SegmentR2, SegmentR2] | SegmentR2Interpolator {
    if (s0 === void 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (s1 === void 0) {
      s0 = s0 as readonly [AnySegmentR2, AnySegmentR2];
      return SegmentR2Interpolator.between(s0[0], s0[1]);
    } else {
      return SegmentR2Interpolator.between(s0 as AnySegmentR2, s1);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof SegmentR2Interpolator) {
      return this.x0 === that.x0 && this.dx0 === that.dx0
          && this.y0 === that.y0 && this.dy0 === that.dy0
          && this.x1 === that.x1 && this.dx1 === that.dx1
          && this.y1 === that.y1 && this.dy1 === that.dy1;
    }
    return false;
  }

  static between(s0: AnySegmentR2, s1: AnySegmentR2): SegmentR2Interpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof SegmentR2 && b instanceof SegmentR2) {
      return new SegmentR2Interpolator(a, b);
    } else if (SegmentR2.isAny(a) && SegmentR2.isAny(b)) {
      return new SegmentR2Interpolator(SegmentR2.fromAny(a), SegmentR2.fromAny(b));
    }
    return R2ShapeInterpolator.between(a, b);
  }
}
R2ShapeInterpolator.SegmentR2 = SegmentR2Interpolator;
