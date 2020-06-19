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

import {NumberInterpolator, InterpolatorInterpolator} from "@swim/interpolate";
import {ContinuousScale} from "./ContinuousScale";
import {LinearScale} from "./LinearScale";
import {ScaleInterpolator} from "./ScaleInterpolator";

export class LinearScaleInterpolator<R extends RU, RU = R> extends ScaleInterpolator<number, R, number, RU, LinearScale<R, RU>> {
  /** @hidden */
  readonly x0: NumberInterpolator;
  /** @hidden */
  readonly dx: NumberInterpolator;
  /** @hidden */
  readonly fx: InterpolatorInterpolator<R>;

  constructor(s0: LinearScale<R, RU>, s1: LinearScale<R, RU>) {
    super();
    this.x0 = new NumberInterpolator(s0.x0, s1.x0);
    this.dx = new NumberInterpolator(s0.dx, s1.dx);
    this.fx = new InterpolatorInterpolator(s0.fx, s1.fx);
  }

  interpolate(u: number): LinearScale<R, RU> {
    const x0 = this.x0.interpolate(u);
    const dx = this.dx.interpolate(u);
    const fx = this.fx.interpolate(u);
    return new LinearScale(x0, x0 + dx, fx);
  }

  deinterpolate(s: ContinuousScale<number, R, number, RU>): number {
    return 0; // not implemented
  }

  equals(that: any): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LinearScaleInterpolator) {
      return this.x0.equals(that.x0) && this.dx.equals(that.dx) && this.fx.equals(that.fx);
    }
    return false;
  }
}
ScaleInterpolator.Linear = LinearScaleInterpolator;
