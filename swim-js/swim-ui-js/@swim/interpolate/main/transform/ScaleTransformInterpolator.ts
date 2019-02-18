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

import {AnyTransform, Transform, ScaleTransform} from "@swim/transform";
import {TransformInterpolator} from "../TransformInterpolator";

export class ScaleTransformInterpolator extends TransformInterpolator<ScaleTransform> {
  private readonly x0: number;
  private readonly dx: number;
  private readonly y0: number;
  private readonly dy: number;

  constructor(f0: ScaleTransform | string | undefined, f1: ScaleTransform | string | undefined) {
    super();
    let x0: number | undefined;
    let y0: number | undefined;
    if (f0 !== void 0) {
      f0 = ScaleTransform.fromAny(f0);
      x0 = f0.x;
      y0 = f0.y;
    } else {
      x0 = void 0;
      y0 = void 0;
    }
    let x1: number | undefined;
    let y1: number | undefined;
    if (f1 !== void 0) {
      f1 = ScaleTransform.fromAny(f1);
      x1 = f1.x;
      y1 = f1.y;
    } else {
      x1 = void 0;
      y1 = void 0;
    }
    if (x0 === void 0 && !x1) {
      x1 = x0 = 1;
    } else if (x1 === void 0) {
      x1 = x0;
    } else if (x0 === void 0) {
      x0 = x1;
    }
    if (y0 === void 0 && y1 === void 0) {
      y1 = y0 = 1;
    } else if (y1 === void 0) {
      y1 = y0;
    } else if (y0 === void 0) {
      y0 = y1;
    }
    this.x0 = x0!;
    this.dx = x1! - this.x0;
    this.y0 = y0!;
    this.dy = y1! - this.y0;
  }

  interpolate(u: number): ScaleTransform {
    const x = this.x0 + this.dx * u;
    const y = this.y0 + this.dy * u;
    return new ScaleTransform(x, y);
  }

  deinterpolate(f: AnyTransform): number {
    f = Transform.fromAny(f);
    if (f instanceof ScaleTransform) {
      const fx = f.x - this.x0;
      const fy = f.y - this.y0;
      const dp = fx * this.dx + fy * this.dy;
      const lf = Math.sqrt(fx * fx + fy * fy);
      return lf ? dp / lf : lf;
    }
    return 0;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ScaleTransformInterpolator) {
      return this.x0 === that.x0 && this.dx === that.dx
          && this.y0 === that.y0 && this.dy === that.dy;
    }
    return false;
  }
}
TransformInterpolator.Scale = ScaleTransformInterpolator;
