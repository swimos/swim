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

import {AngleUnits, AnyAngle, Angle} from "@swim/angle";
import {Interpolator} from "./Interpolator";

export class AngleInterpolator extends Interpolator<Angle, AnyAngle> {
  private readonly v0: number;
  private readonly dv: number;
  private readonly units: AngleUnits;

  constructor(a0: AnyAngle | undefined, a1: AnyAngle | undefined) {
    super();
    if (a0 !== void 0) {
      a0 = Angle.fromAny(a0);
    }
    if (a1 !== void 0) {
      a1 = Angle.fromAny(a1);
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

  interpolate(u: number): Angle {
    return Angle.from(this.v0 + this.dv * u, this.units);
  }

  deinterpolate(a: AnyAngle): number {
    const v = Angle.fromAny(a).toValue(this.units);
    return this.dv ? (v - this.v0) / this.dv : this.dv;
  }

  range(): Angle[];
  range(as: ReadonlyArray<AnyAngle>): AngleInterpolator;
  range(a0: AnyAngle, a1?: AnyAngle): AngleInterpolator;
  range(a0?: ReadonlyArray<AnyAngle> | AnyAngle, a1?: AnyAngle): Angle[] | AngleInterpolator {
    if (a0 === void 0) {
      return [Angle.from(this.v0, this.units), Angle.from(this.v0 + this.dv, this.units)];
    } else if (a1 === void 0) {
      a0 = a0 as ReadonlyArray<AnyAngle>;
      return new AngleInterpolator(a0[0], a0[1]);
    } else {
      return new AngleInterpolator(a0 as AnyAngle, a1);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof AngleInterpolator) {
      return this.v0 === that.v0 && this.dv === that.dv && this.units === that.units;
    }
    return false;
  }
}
Interpolator.Angle = AngleInterpolator;
