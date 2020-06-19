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
import {AnyBoxR2, BoxR2} from "./BoxR2";
import {R2ShapeInterpolator} from "./R2ShapeInterpolator";

export class BoxR2Interpolator extends R2ShapeInterpolator<BoxR2, AnyBoxR2> {
  /** @hidden */
  readonly xMin: number;
  /** @hidden */
  readonly dxMin: number;
  /** @hidden */
  readonly yMin: number;
  /** @hidden */
  readonly dyMin: number;
  /** @hidden */
  readonly xMax: number;
  /** @hidden */
  readonly dxMax: number;
  /** @hidden */
  readonly yMax: number;
  /** @hidden */
  readonly dyMax: number;

  constructor(s0: BoxR2, s1: BoxR2) {
    super();
    this.xMin = s0.xMin;
    this.dxMin = s1.xMin - this.xMin;
    this.yMin = s0.yMin;
    this.dyMin = s1.yMin - this.yMin;
    this.xMax = s0.xMax;
    this.dxMax = s1.xMax - this.xMax;
    this.yMax = s0.yMax;
    this.dyMax = s1.yMax - this.yMax;
  }

  interpolate(u: number): BoxR2 {
    const xMin = this.xMin + this.dxMin * u;
    const yMin = this.yMin + this.dyMin * u;
    const xMax = this.xMax + this.dxMax * u;
    const yMax = this.yMax + this.dyMax * u;
    return new BoxR2(xMin, yMin, xMax, yMax);
  }

  deinterpolate(b: AnyBoxR2): number {
    return 0;
  }

  range(): readonly [BoxR2, BoxR2];
  range(ss: readonly [AnyBoxR2, AnyBoxR2]): BoxR2Interpolator;
  range(s0: AnyBoxR2, s1: AnyBoxR2): BoxR2Interpolator;
  range(s0?: readonly [AnyBoxR2, AnyBoxR2] | AnyBoxR2,
        s1?: AnyBoxR2): readonly [BoxR2, BoxR2] | BoxR2Interpolator {
    if (s0 === void 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (s1 === void 0) {
      s0 = s0 as readonly [AnyBoxR2, AnyBoxR2];
      return BoxR2Interpolator.between(s0[0], s0[1]);
    } else {
      return BoxR2Interpolator.between(s0 as AnyBoxR2, s1);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BoxR2Interpolator) {
      return this.xMin === that.xMin && this.dxMin === that.dxMin
          && this.yMin === that.yMin && this.dyMin === that.dyMin
          && this.xMax === that.xMax && this.dxMax === that.dxMax
          && this.yMax === that.yMax && this.dyMax === that.dyMax;
    }
    return false;
  }

  static between(s0: AnyBoxR2, s1: AnyBoxR2): BoxR2Interpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof BoxR2 && b instanceof BoxR2) {
      return new BoxR2Interpolator(a, b);
    } else if (BoxR2.isAny(a) && BoxR2.isAny(b)) {
      return new BoxR2Interpolator(BoxR2.fromAny(a), BoxR2.fromAny(b));
    }
    return R2ShapeInterpolator.between(a, b);
  }
}
R2ShapeInterpolator.BoxR2 = BoxR2Interpolator;
