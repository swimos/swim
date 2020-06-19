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
import {AngleUnits, Angle} from "@swim/angle";
import {AnyTransform, Transform} from "./Transform";
import {RotateTransform} from "./RotateTransform";
import {TransformInterpolator} from "./TransformInterpolator";

export class RotateTransformInterpolator extends TransformInterpolator<RotateTransform> {
  /** @hidden */
  readonly v0: number;
  /** @hidden */
  readonly dv: number;
  /** @hidden */
  readonly units: AngleUnits;

  constructor(f0: RotateTransform, f1: RotateTransform) {
    super();
    this.units = f1.angle.units;
    this.v0 = f0.angle.toValue(this.units);
    this.dv = f1.angle.value - this.v0;
  }

  interpolate(u: number): RotateTransform {
    const a = Angle.from(this.v0 + this.dv * u, this.units);
    return new RotateTransform(a);
  }

  deinterpolate(f: AnyTransform): number {
    f = Transform.fromAny(f);
    if (f instanceof RotateTransform) {
      const v = f.angle.toValue(this.units);
      return this.dv !== 0 ? (v - this.v0) / this.dv : this.dv;
    }
    return 0;
  }

  range(): readonly [RotateTransform, RotateTransform];
  range(fs: readonly [RotateTransform, RotateTransform]): RotateTransformInterpolator;
  range(f0: RotateTransform, f1: RotateTransform): RotateTransformInterpolator;
  range(fs: readonly [AnyTransform, AnyTransform]): TransformInterpolator;
  range(f0: AnyTransform, f1: AnyTransform): TransformInterpolator;
  range(f0?: readonly [AnyTransform, AnyTransform] | AnyTransform,
        f1?: AnyTransform): readonly [RotateTransform, RotateTransform] | TransformInterpolator {
    if (f0 === void 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (f1 === void 0) {
      f0 = f0 as readonly [AnyTransform, AnyTransform];
      return RotateTransformInterpolator.between(f0[0], f0[1]);
    } else {
      return RotateTransformInterpolator.between(f0 as AnyTransform, f1);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof RotateTransformInterpolator) {
      return this.v0 === that.v0 && this.dv === that.dv && this.units === that.units;
    }
    return false;
  }

  static between(f0: RotateTransform, f1: RotateTransform): RotateTransformInterpolator;
  static between(f0: AnyTransform, f1: AnyTransform): TransformInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof RotateTransform && b instanceof RotateTransform) {
      return new RotateTransformInterpolator(a, b);
    }
    return TransformInterpolator.between(a, b);
  }
}
TransformInterpolator.Rotate = RotateTransformInterpolator;
