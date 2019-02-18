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

import {AnyShape, Shape, PointR2} from "@swim/math";
import {ShapeInterpolator} from "../ShapeInterpolator";

export class PointR2Interpolator extends ShapeInterpolator<PointR2> {
  private readonly x: number;
  private readonly dx: number;
  private readonly y: number;
  private readonly dy: number;

  constructor(s0: AnyShape | undefined, s1: AnyShape | undefined) {
    super();
    if (s0 !== void 0) {
      s0 = Shape.fromAny(s0);
    }
    if (s1 !== void 0) {
      s1 = Shape.fromAny(s1);
    }
    if (!s0 && !s1) {
      s1 = s0 = PointR2.origin();
    } else if (!s1) {
      s1 = s0;
    } else if (!s0) {
      s0 = s1;
    }
    this.x = (s0 as PointR2).x;
    this.dx = (s1 as PointR2).x - this.x;
    this.y = (s0 as PointR2).y;
    this.dy = (s1 as PointR2).y - this.y;
  }

  interpolate(u: number): PointR2 {
    const x = this.x + this.dx * u;
    const y = this.y + this.dy * u;
    return new PointR2(x, y);
  }

  deinterpolate(s: AnyShape): number {
    s = Shape.fromAny(s);
    if (s instanceof PointR2) {
      const sx = s.x - this.x;
      const sy = s.y - this.y;
      const dp = sx * this.dx + sy * this.dy;
      const lf = Math.sqrt(sx * sx + sy * sy);
      return lf ? dp / lf : lf;
    }
    return 0;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof PointR2Interpolator) {
      return this.x === that.x && this.dx === that.dx
          && this.y === that.y && this.dy === that.dy;
    }
    return false;
  }
}
ShapeInterpolator.PointR2 = PointR2Interpolator;
