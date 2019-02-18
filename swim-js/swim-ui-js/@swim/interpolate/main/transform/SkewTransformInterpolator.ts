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

import {AngleUnits, Angle} from "@swim/angle";
import {AnyTransform, Transform, SkewTransform} from "@swim/transform";
import {TransformInterpolator} from "../TransformInterpolator";

export class SkewTransformInterpolator extends TransformInterpolator<SkewTransform> {
  private readonly x0: number;
  private readonly dx: number;
  private readonly xUnits: AngleUnits;
  private readonly y0: number;
  private readonly dy: number;
  private readonly yUnits: AngleUnits;

  constructor(f0: SkewTransform | string | undefined, f1: SkewTransform | string | undefined) {
    super();
    let x0: Angle | undefined;
    let y0: Angle | undefined;
    if (f0 !== void 0) {
      f0 = SkewTransform.fromAny(f0);
      x0 = f0.x;
      y0 = f0.y;
    } else {
      x0 = void 0;
      y0 = void 0;
    }
    let x1: Angle | undefined;
    let y1: Angle | undefined;
    if (f1 !== void 0) {
      f1 = SkewTransform.fromAny(f1);
      x1 = f1.x;
      y1 = f1.y;
    } else {
      x1 = void 0;
      y1 = void 0;
    }
    if (!x0 && !x1) {
      x1 = x0 = Angle.zero();
    } else if (!x1) {
      x1 = x0;
    } else if (!x0) {
      x0 = x1;
    } else {
      x0 = x0.to(x1.units());
    }
    if (!y0 && !y1) {
      y1 = y0 = Angle.zero();
    } else if (!y1) {
      y1 = y0;
    } else if (!y0) {
      y0 = y1;
    } else {
      y0 = y0.to(y1.units());
    }
    this.x0 = x0!.value();
    this.dx = x1!.value() - this.x0;
    this.xUnits = x1!.units();
    this.y0 = y0!.value();
    this.dy = y1!.value() - this.y0;
    this.yUnits = y1!.units();
  }

  interpolate(u: number): SkewTransform {
    const x = Angle.from(this.x0 + this.dx * u, this.xUnits);
    const y = Angle.from(this.y0 + this.dy * u, this.yUnits);
    return new SkewTransform(x, y);
  }

  deinterpolate(f: AnyTransform): number {
    f = Transform.fromAny(f);
    if (f instanceof SkewTransform) {
      const units = f.x.units();
      const x0 = Angle.fromAny(this.x0, this.xUnits).toValue(units);
      const y0 = Angle.fromAny(this.y0, this.yUnits).toValue(units);
      const dx = Angle.fromAny(this.dx, this.xUnits).toValue(units);
      const dy = Angle.fromAny(this.dy, this.yUnits).toValue(units);
      const fx = f.x.toValue(units) - x0;
      const fy = f.y.toValue(units) - y0;
      const dp = fx * dx + fy * dy;
      const lf = Math.sqrt(fx * fx + fy * fy);
      return lf ? dp / lf : lf;
    }
    return 0;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof SkewTransformInterpolator) {
      return this.x0 === that.x0 && this.dx === that.dx && this.xUnits === that.xUnits
          && this.y0 === that.y0 && this.dy === that.dy && this.yUnits === that.yUnits;
    }
    return false;
  }
}
TransformInterpolator.Skew = SkewTransformInterpolator;
