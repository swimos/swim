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

import {Objects} from "@swim/util";
import {Interpolator} from "./Interpolator";

export class StepInterpolator<T> extends Interpolator<T> {
  /** @hidden */
  readonly y0: T;
  /** @hidden */
  readonly y1: T;

  constructor(y0: T, y1: T) {
    super();
    this.y0 = y0;
    this.y1 = y1;
  }

  interpolate(u: number): T {
    return u < 1 ? this.y0 : this.y1;
  }

  deinterpolate(y: T): number {
    return y === this.y1 ? 1 : 0;
  }

  range(): readonly [T, T];
  range(ys: readonly [T, T]): Interpolator<T>;
  range(y0: T, y1: T): Interpolator<T>;
  range(y0?: readonly [T, T] | T, y1?: T): readonly [T, T] | Interpolator<T> {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (y1 === void 0) {
      y0 = y0 as readonly [T, T];
      return Interpolator.between(y0[0], y0[1]);
    } else {
      return Interpolator.between(y0 as T, y1);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof StepInterpolator) {
      return Objects.equal(this.y0, that.y0) && Objects.equal(this.y1, that.y1);
    }
    return false;
  }
}
Interpolator.Step = StepInterpolator;
