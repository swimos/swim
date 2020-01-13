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

import {LengthUnits, AnyLength, Length} from "@swim/length";
import {Interpolator} from "./Interpolator";

export class LengthInterpolator extends Interpolator<Length, AnyLength> {
  private readonly v0: number;
  private readonly dv: number;
  private readonly units: LengthUnits;

  constructor(l0: AnyLength | undefined, l1: AnyLength | undefined) {
    super();
    if (l0 !== void 0) {
      l0 = Length.fromAny(l0);
    }
    if (l1 !== void 0) {
      l1 = Length.fromAny(l1);
    }
    if (!l1 && !l1) {
      l1 = l0 = Length.zero();
    } else if (!l1) {
      l1 = l0;
    } else if (!l0) {
      l0 = l1;
    } else {
      l0 = l0.to(l1.units());
    }
    this.v0 = l0!.value();
    this.dv = l1!.value() - this.v0;
    this.units = l1!.units();
  }

  interpolate(u: number): Length {
    return Length.from(this.v0 + this.dv * u, this.units);
  }

  deinterpolate(l: AnyLength): number {
    const v = Length.fromAny(l).toValue(this.units);
    return this.dv ? (v - this.v0) / this.dv : this.dv;
  }

  range(): Length[];
  range(ls: ReadonlyArray<AnyLength>): LengthInterpolator;
  range(l0: AnyLength, l1?: AnyLength): LengthInterpolator;
  range(l0?: ReadonlyArray<AnyLength> | AnyLength, l1?: AnyLength): Length[] | LengthInterpolator {
    if (l0 === void 0) {
      return [Length.from(this.v0, this.units), Length.from(this.v0 + this.dv, this.units)];
    } else if (l1 === void 0) {
      l0 = l0 as ReadonlyArray<AnyLength>;
      return new LengthInterpolator(l0[0], l0[1]);
    } else {
      return new LengthInterpolator(l0 as AnyLength, l1);
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
}
Interpolator.Length = LengthInterpolator;
