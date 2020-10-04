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
import {AngleUnits, AnyAngle, Angle} from "./Angle";

export class AngleInterpolator extends Interpolator<Angle, AnyAngle> {
  /** @hidden */
  readonly v0: number;
  /** @hidden */
  readonly dv: number;
  /** @hidden */
  readonly units: AngleUnits;

  constructor(a0: Angle, a1: Angle) {
    super();
    this.units = a1.units;
    this.v0 = a0.toValue(this.units);
    this.dv = a1.value - this.v0;
  }

  interpolate(u: number): Angle {
    return Angle.from(this.v0 + this.dv * u, this.units);
  }

  deinterpolate(a: AnyAngle): number {
    const v = Angle.fromAny(a).toValue(this.units);
    return this.dv !== 0 ? (v - this.v0) / this.dv : this.dv;
  }

  range(): readonly [Angle, Angle];
  range(ts: readonly [AnyAngle, AnyAngle]): AngleInterpolator;
  range(t0: AnyAngle, t1: AnyAngle): AngleInterpolator;
  range(a0?: readonly [AnyAngle, AnyAngle] | AnyAngle,
        a1?: AnyAngle): readonly [Angle, Angle] | AngleInterpolator {
    if (arguments.length === 0) {
      return [Angle.from(this.v0, this.units), Angle.from(this.v0 + this.dv, this.units)];
    } else if (arguments.length === 1) {
      a0 = a0 as readonly [AnyAngle, AnyAngle];
      return AngleInterpolator.between(a0[0], a0[1]);
    } else {
      return AngleInterpolator.between(a0 as AnyAngle, a1 as AnyAngle);
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

  static between(a0: AnyAngle, a1: AnyAngle): AngleInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof Angle && b instanceof Angle) {
      return new AngleInterpolator(a, b);
    } else if (Angle.isAny(a) && Angle.isAny(b)) {
      return new AngleInterpolator(Angle.fromAny(a), Angle.fromAny(b));
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): AngleInterpolator | null {
    if (a instanceof Angle && b instanceof Angle) {
      return new AngleInterpolator(a, b);
    }
    return null;
  }
}
Interpolator.registerFactory(AngleInterpolator);
