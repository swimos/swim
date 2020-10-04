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
import {AnyPointR2, PointR2} from "./PointR2";
import {R2ShapeInterpolator} from "./R2ShapeInterpolator";

export class PointR2Interpolator extends R2ShapeInterpolator<PointR2, AnyPointR2> {
  /** @hidden */
  readonly x: number;
  /** @hidden */
  readonly dx: number;
  /** @hidden */
  readonly y: number;
  /** @hidden */
  readonly dy: number;

  constructor(p0: PointR2, p1: PointR2) {
    super();
    this.x = p0.x;
    this.dx = p1.x - this.x;
    this.y = p0.y;
    this.dy = p1.y - this.y;
  }

  interpolate(u: number): PointR2 {
    const x = this.x + this.dx * u;
    const y = this.y + this.dy * u;
    return new PointR2(x, y);
  }

  deinterpolate(p: AnyPointR2): number {
    p = PointR2.fromAny(p);
    const x = p.x - this.x;
    const y = p.y - this.y;
    const dp = x * this.dx + y * this.dy;
    const l = Math.sqrt(x * x + y * y);
    return l !== 0 ? dp / l : l;
  }

  range(): readonly [PointR2, PointR2];
  range(ps: readonly [AnyPointR2, AnyPointR2]): PointR2Interpolator;
  range(p0: AnyPointR2, p1: AnyPointR2): PointR2Interpolator;
  range(p0?: readonly [AnyPointR2, AnyPointR2] | AnyPointR2,
        p1?: AnyPointR2): readonly [PointR2, PointR2] | PointR2Interpolator {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (arguments.length === 1) {
      p0 = p0 as readonly [AnyPointR2, AnyPointR2];
      return PointR2Interpolator.between(p0[0], p0[1]);
    } else {
      return PointR2Interpolator.between(p0 as AnyPointR2, p1 as AnyPointR2);
    }
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

  static between(p0: AnyPointR2, p1: AnyPointR2): PointR2Interpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof PointR2 && b instanceof PointR2) {
      return new PointR2Interpolator(a, b);
    } else if (PointR2.isAny(a) && PointR2.isAny(b)) {
      return new PointR2Interpolator(PointR2.fromAny(a), PointR2.fromAny(b));
    }
    return R2ShapeInterpolator.between(a, b);
  }
}
R2ShapeInterpolator.PointR2 = PointR2Interpolator;
