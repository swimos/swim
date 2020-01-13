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

import {AngleUnits, Angle} from "@swim/angle";
import {AnyTransform, Transform, RotateTransform} from "@swim/transform";
import {TransformInterpolator} from "../TransformInterpolator";

export class RotateTransformInterpolator extends TransformInterpolator<RotateTransform> {
  private readonly v0: number;
  private readonly dv: number;
  private readonly units: AngleUnits;

  constructor(f0: RotateTransform | string | undefined, f1: RotateTransform | string | undefined) {
    super();
    let a0: Angle | undefined;
    if (f0 !== void 0) {
      f0 = RotateTransform.fromAny(f0);
      a0 = f0.angle;
    } else {
      a0 = void 0;
    }
    let a1: Angle | undefined;
    if (f1 !== void 0) {
      f1 = RotateTransform.fromAny(f1);
      a1 = f1.angle;
    } else {
      a1 = void 0;
    }
    if (!a0 && !a1) {
      a1 = a0 = Angle.zero();
    } else if (!a1) {
      a1 = a0;
    } else if (!a0) {
      a0 = a1;
    } else {
      a0 = a0.to(a1.units());
    }
    this.v0 = a0!.value();
    this.dv = a1!.value() - this.v0;
    this.units = a1!.units();
  }

  interpolate(u: number): RotateTransform {
    const a = Angle.from(this.v0 + this.dv * u, this.units);
    return new RotateTransform(a);
  }

  deinterpolate(f: AnyTransform): number {
    f = Transform.fromAny(f);
    if (f instanceof RotateTransform) {
      const v = f.angle.toValue(this.units);
      return this.dv ? (v - this.v0) / this.dv : this.dv;
    }
    return 0;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof RotateTransformInterpolator) {
      return this.v0 === that.v0 && this.dv === that.dv && this.units === that.units;
    }
    return false;
  }
}
TransformInterpolator.Rotate = RotateTransformInterpolator;
