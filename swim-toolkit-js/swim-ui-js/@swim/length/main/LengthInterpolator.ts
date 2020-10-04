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
import {LengthUnits, AnyLength, Length} from "./Length";

export class LengthInterpolator extends Interpolator<Length, AnyLength> {
  /** @hidden */
  readonly v0: number;
  /** @hidden */
  readonly dv: number;
  /** @hidden */
  readonly units: LengthUnits;

  constructor(l0: Length, l1: Length) {
    super();
    this.units = l1.units;
    this.v0 = l0.toValue(this.units);
    this.dv = l1.value - this.v0;
  }

  interpolate(u: number): Length {
    return Length.from(this.v0 + this.dv * u, this.units);
  }

  deinterpolate(l: AnyLength): number {
    const v = Length.fromAny(l).toValue(this.units);
    return this.dv !== 0 ? (v - this.v0) / this.dv : this.dv;
  }

  range(): readonly [Length, Length];
  range(ts: readonly [AnyLength, AnyLength]): LengthInterpolator;
  range(t0: AnyLength, t1: AnyLength): LengthInterpolator;
  range(l0?: readonly [AnyLength, AnyLength] | AnyLength,
        l1?: AnyLength): readonly [Length, Length] | LengthInterpolator {
    if (arguments.length === 0) {
      return [Length.from(this.v0, this.units), Length.from(this.v0 + this.dv, this.units)];
    } else if (arguments.length === 1) {
      l0 = l0 as readonly [AnyLength, AnyLength];
      return LengthInterpolator.between(l0[0], l0[1]);
    } else {
      return LengthInterpolator.between(l0 as AnyLength, l1 as AnyLength);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LengthInterpolator) {
      return this.v0 === that.v0 && this.dv === that.dv && this.units === that.units;
    }
    return false;
  }

  static between(l0: AnyLength, l1: AnyLength): LengthInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof Length && b instanceof Length) {
      return new LengthInterpolator(a, b);
    } else if (Length.isAny(a) && Length.isAny(b)) {
      return new LengthInterpolator(Length.fromAny(a), Length.fromAny(b));
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): LengthInterpolator | null {
    if (a instanceof Length && b instanceof Length) {
      return new LengthInterpolator(a, b);
    }
    return null;
  }
}
Interpolator.registerFactory(LengthInterpolator);
