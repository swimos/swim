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
import {AnyTransform, Transform} from "./Transform";
import {ScaleTransform} from "./ScaleTransform";
import {TransformInterpolator} from "./TransformInterpolator";

export class ScaleTransformInterpolator extends TransformInterpolator<ScaleTransform> {
  /** @hidden */
  readonly x0: number;
  /** @hidden */
  readonly dx: number;
  /** @hidden */
  readonly y0: number;
  /** @hidden */
  readonly dy: number;

  constructor(f0: ScaleTransform, f1: ScaleTransform) {
    super();
    this.x0 = f0.x;
    this.dx = f1.x - this.x0;
    this.y0 = f0.y;
    this.dy = f1.y - this.y0;
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
      return lf !== 0 ? dp / lf : lf;
    }
    return 0;
  }

  range(): readonly [ScaleTransform, ScaleTransform];
  range(fs: readonly [ScaleTransform, ScaleTransform]): ScaleTransformInterpolator;
  range(f0: ScaleTransform, f1: ScaleTransform): ScaleTransformInterpolator;
  range(fs: readonly [AnyTransform, AnyTransform]): TransformInterpolator;
  range(f0: AnyTransform, f1: AnyTransform): TransformInterpolator;
  range(f0?: readonly [AnyTransform, AnyTransform] | AnyTransform,
        f1?: AnyTransform): readonly [ScaleTransform, ScaleTransform] | TransformInterpolator {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (arguments.length === 1) {
      f0 = f0 as readonly [AnyTransform, AnyTransform];
      return ScaleTransformInterpolator.between(f0[0], f0[1]);
    } else {
      return ScaleTransformInterpolator.between(f0 as AnyTransform, f1 as AnyTransform);
    }
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

  static between(f0: ScaleTransform, f1: ScaleTransform): ScaleTransformInterpolator;
  static between(f0: AnyTransform, f1: AnyTransform): TransformInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof ScaleTransform && b instanceof ScaleTransform) {
      return new ScaleTransformInterpolator(a, b);
    }
    return TransformInterpolator.between(a, b);
  }
}
TransformInterpolator.Scale = ScaleTransformInterpolator;
