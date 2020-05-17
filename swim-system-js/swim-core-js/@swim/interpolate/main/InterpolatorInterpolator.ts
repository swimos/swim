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

import {Interpolator} from "./Interpolator";

export class InterpolatorInterpolator<T extends U, U = T> extends Interpolator<Interpolator<T, U>> {
  /** @hidden */
  readonly i0: Interpolator<T, U>;
  /** @hidden */
  readonly i1: Interpolator<T, U>;
  /** @hidden */
  readonly i00: Interpolator<T, U>;
  /** @hidden */
  readonly i11: Interpolator<T, U>;

  constructor(i0: Interpolator<T, U>, i1: Interpolator<T, U>) {
    super();
    this.i0 = i0;
    this.i1 = i1;
    this.i00 = this.i1.range(this.i0.interpolate(0), this.i1.interpolate(0));
    this.i11 = this.i1.range(this.i0.interpolate(1), this.i1.interpolate(1));
  }

  interpolate(u: number): Interpolator<T, U> {
    if (u === 0) {
      return this.i0;
    } else if (u === 1) {
      return this.i1;
    } else {
      return this.i1.range(this.i00.interpolate(u), this.i11.interpolate(u));
    }
  }

  deinterpolate(i: Interpolator<T, U>): number {
    return 0; // not implemented
  }

  range(): ReadonlyArray<Interpolator<T, U>>;
  range(is: ReadonlyArray<Interpolator<T, U>>): InterpolatorInterpolator<T, U>;
  range(i0: Interpolator<T, U>, i1: Interpolator<T, U>): InterpolatorInterpolator<T, U>;
  range(i0?: ReadonlyArray<Interpolator<T, U>> | Interpolator<T, U>,
        i1?: Interpolator<T, U>): ReadonlyArray<Interpolator<T, U>> | InterpolatorInterpolator<T, U> {
    if (i0 === void 0) {
      return [this.i0, this.i1];
    } else if (i1 === void 0) {
      i0 = i0 as ReadonlyArray<Interpolator<T, U>>;
      return InterpolatorInterpolator.between(i0[0], i0[1]);
    } else {
      return InterpolatorInterpolator.between(i0 as Interpolator<T, U>, i1);
    }
  }

  equals(that: any): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof InterpolatorInterpolator) {
      return this.i0.equals(that.i0) && this.i1.equals(that.i1);
    }
    return false;
  }

  static between<T extends U, U = T>(i0: Interpolator<T, U>, i1: Interpolator<T, U>): InterpolatorInterpolator<T, U>;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof Interpolator && b instanceof Interpolator) {
      return new InterpolatorInterpolator(a, b);
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): InterpolatorInterpolator<unknown> | null {
    if (a instanceof Interpolator && b instanceof Interpolator) {
      return new InterpolatorInterpolator(a, b);
    }
    return null;
  }
}
Interpolator.Interpolator = InterpolatorInterpolator;
