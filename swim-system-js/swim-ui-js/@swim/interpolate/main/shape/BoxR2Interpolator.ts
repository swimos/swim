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

import {AnyShape, Shape, BoxR2} from "@swim/math";
import {ShapeInterpolator} from "../ShapeInterpolator";

export class BoxR2Interpolator extends ShapeInterpolator<BoxR2> {
  private readonly xMin: number;
  private readonly dxMin: number;
  private readonly yMin: number;
  private readonly dyMin: number;
  private readonly xMax: number;
  private readonly dxMax: number;
  private readonly yMax: number;
  private readonly dyMax: number;

  constructor(s0: AnyShape | undefined, s1: AnyShape | undefined) {
    super();
    if (s0 !== void 0) {
      s0 = Shape.fromAny(s0);
    }
    if (s1 !== void 0) {
      s1 = Shape.fromAny(s1);
    }
    if (!s0 && !s1) {
      s1 = s0 = new BoxR2(0, 0, 0, 0);
    } else if (!s1) {
      s1 = s0;
    } else if (!s0) {
      s0 = s1;
    }
    this.xMin = (s0 as BoxR2).xMin;
    this.dxMin = (s1 as BoxR2).xMin - this.xMin;
    this.yMin = (s0 as BoxR2).yMin;
    this.dyMin = (s1 as BoxR2).yMin - this.yMin;
    this.xMax = (s0 as BoxR2).xMax;
    this.dxMax = (s1 as BoxR2).xMax - this.xMax;
    this.yMax = (s0 as BoxR2).yMax;
    this.dyMax = (s1 as BoxR2).yMax - this.yMax;
  }

  interpolate(u: number): BoxR2 {
    const xMin = this.xMin + this.dxMin * u;
    const yMin = this.yMin + this.dyMin * u;
    const xMax = this.xMax + this.dxMax * u;
    const yMax = this.yMax + this.dyMax * u;
    return new BoxR2(xMin, yMin, xMax, yMax);
  }

  deinterpolate(s: AnyShape): number {
    return 0;
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
}
ShapeInterpolator.BoxR2 = BoxR2Interpolator;
