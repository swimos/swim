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

import {AnyShape, Shape, SegmentR2} from "@swim/math";
import {ShapeInterpolator} from "../ShapeInterpolator";

export class SegmentR2Interpolator extends ShapeInterpolator<SegmentR2> {
  private readonly x0: number;
  private readonly dx0: number;
  private readonly y0: number;
  private readonly dy0: number;
  private readonly x1: number;
  private readonly dx1: number;
  private readonly y1: number;
  private readonly dy1: number;

  constructor(s0: AnyShape | undefined, s1: AnyShape | undefined) {
    super();
    if (s0 !== void 0) {
      s0 = Shape.fromAny(s0);
    }
    if (s1 !== void 0) {
      s1 = Shape.fromAny(s1);
    }
    if (!s0 && !s1) {
      s1 = s0 = new SegmentR2(0, 0, 0, 0);
    } else if (!s1) {
      s1 = s0;
    } else if (!s0) {
      s0 = s1;
    }
    this.x0 = (s0 as SegmentR2).x0;
    this.dx0 = (s1 as SegmentR2).x0 - this.x0;
    this.y0 = (s0 as SegmentR2).y0;
    this.dy0 = (s1 as SegmentR2).y0 - this.y0;
    this.x1 = (s0 as SegmentR2).x1;
    this.dx1 = (s1 as SegmentR2).x1 - this.x1;
    this.y1 = (s0 as SegmentR2).y1;
    this.dy1 = (s1 as SegmentR2).y1 - this.y1;
  }

  interpolate(u: number): SegmentR2 {
    const x0 = this.x0 + this.dx0 * u;
    const y0 = this.y0 + this.dy0 * u;
    const x1 = this.x1 + this.dx1 * u;
    const y1 = this.y1 + this.dy1 * u;
    return new SegmentR2(x0, y0, x1, y1);
  }

  deinterpolate(s: AnyShape): number {
    return 0;
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
}
ShapeInterpolator.SegmentR2 = SegmentR2Interpolator;
