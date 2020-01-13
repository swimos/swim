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

import {TimeZone, AnyDateTime, DateTime} from "@swim/time";
import {Interpolator} from "./Interpolator";

export class DateTimeInterpolator extends Interpolator<DateTime> {
  readonly t0: number;
  readonly dt: number;
  readonly zone: TimeZone;

  constructor(d0: AnyDateTime | undefined, d1: AnyDateTime | undefined, zone?: TimeZone) {
    super();
    if (d0 === void 0 && d1 === void 0) {
      d1 = d0 = 0;
    } else if (d1 === void 0) {
      d1 = d0;
    } else if (d0 === void 0) {
      d0 = d1;
    }
    d0 = DateTime.fromAny(d0!);
    d1 = DateTime.fromAny(d1!);
    this.t0 = d0.time();
    this.dt = d1.time() - this.t0;
    this.zone = zone || d0.zone();
  }

  interpolate(u: number): DateTime {
    return new DateTime(this.t0 + this.dt * u, this.zone);
  }

  deinterpolate(d: AnyDateTime): number {
    d = DateTime.time(d);
    return this.dt ? (d - this.t0) / this.dt : this.dt;
  }

  range(): DateTime[];
  range(ts: ReadonlyArray<AnyDateTime>): DateTimeInterpolator;
  range(t0: AnyDateTime, t1?: AnyDateTime): DateTimeInterpolator;
  range(t0?: ReadonlyArray<AnyDateTime> | AnyDateTime, t1?: AnyDateTime): DateTime[] | DateTimeInterpolator {
    if (t0 === void 0) {
      return [new DateTime(this.t0, this.zone), new DateTime(this.t0 + this.dt, this.zone)];
    } else if (t1 === void 0) {
      t0 = t0 as ReadonlyArray<AnyDateTime>;
      return new DateTimeInterpolator(t0[0], t0[1], this.zone);
    } else {
      return new DateTimeInterpolator(t0 as AnyDateTime, t1, this.zone);
    }
  }

  equals(that: any): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof DateTimeInterpolator) {
      return this.t0 === that.t0 && this.dt === that.dt;
    }
    return false;
  }
}
Interpolator.DateTime = DateTimeInterpolator;
