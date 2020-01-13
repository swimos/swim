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

import {AnyDateTime, DateTime} from "@swim/time";
import {NumberInterpolator, InterpolatorInterpolator} from "@swim/interpolate";
import {ContinuousScale} from "./ContinuousScale";
import {TimeScale} from "./TimeScale";
import {ScaleInterpolator} from "./ScaleInterpolator";

export class TimeScaleInterpolator<R extends RU, RU = R> extends ScaleInterpolator<DateTime, R, AnyDateTime, RU, TimeScale<R>> {
  readonly t0: NumberInterpolator;
  readonly dt: NumberInterpolator;
  readonly ft: InterpolatorInterpolator<R>;

  constructor(s0?: TimeScale<R>, s1?: TimeScale<R>) {
    super();
    if (!s0 && !s1) {
      throw new Error();
    } else if (!s1) {
      s1 = s0;
    } else if (!s0) {
      s0 = s1;
    }
    this.t0 = new NumberInterpolator(s0!.t0, s1!.t0);
    this.dt = new NumberInterpolator(s0!.dt, s1!.dt);
    this.ft = new InterpolatorInterpolator(s0!.ft, s1!.ft);
  }

  interpolate(u: number): TimeScale<R> {
    const t0 = this.t0.interpolate(u);
    const dt = this.dt.interpolate(u);
    const ft = this.ft.interpolate(u);
    return new TimeScale(t0, t0 + dt, ft);
  }

  deinterpolate(s: ContinuousScale<DateTime, R, AnyDateTime, RU>): number {
    return 0; // not implemented
  }

  equals(that: any): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof TimeScaleInterpolator) {
      return this.t0.equals(that.t0) && this.dt.equals(that.dt) && this.ft.equals(that.ft);
    }
    return false;
  }
}
ScaleInterpolator.Time = TimeScaleInterpolator;
