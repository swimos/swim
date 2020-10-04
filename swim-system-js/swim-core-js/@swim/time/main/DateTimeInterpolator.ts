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

import {AnyTimeZone, TimeZone} from "./TimeZone";
import {AnyDateTime, DateTime} from "./DateTime";
import {Interpolator} from "@swim/interpolate";

export class DateTimeInterpolator extends Interpolator<DateTime, AnyDateTime> {
  /** @hidden */
  readonly t0: number;
  /** @hidden */
  readonly dt: number;
  /** @hidden */
  readonly zone: TimeZone;

  constructor(t0: number, t1: number, zone: TimeZone) {
    super();
    this.t0 = t0;
    this.dt = t1 - this.t0;
    this.zone = zone;
  }

  interpolate(u: number): DateTime {
    return new DateTime(this.t0 + this.dt * u, this.zone);
  }

  deinterpolate(t: AnyDateTime): number {
    t = DateTime.time(t);
    return this.dt !== 0 ? (t - this.t0) / this.dt : this.dt;
  }

  range(): readonly [DateTime, DateTime];
  range(ts: readonly [AnyDateTime, AnyDateTime]): DateTimeInterpolator;
  range(t0: AnyDateTime, t1: AnyDateTime): DateTimeInterpolator;
  range(t0?: readonly [AnyDateTime, AnyDateTime] | AnyDateTime,
        t1?: AnyDateTime): readonly [DateTime, DateTime] | DateTimeInterpolator {
    if (arguments.length === 0) {
      return [new DateTime(this.t0, this.zone), new DateTime(this.t0 + this.dt, this.zone)];
    } else if (arguments.length === 1) {
      t0 = t0 as readonly [AnyDateTime, AnyDateTime];
      return DateTimeInterpolator.between(t0[0], t0[1], this.zone);
    } else {
      return DateTimeInterpolator.between(t0 as AnyDateTime, t1 as AnyDateTime, this.zone);
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

  static between(t0: AnyDateTime, t1: AnyDateTime, zone?: AnyTimeZone): DateTimeInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown, zone?: AnyTimeZone): Interpolator<unknown> {
    if (DateTime.isAny(a) && DateTime.isAny(b)) {
      if (zone === void 0) {
        if (a instanceof DateTime) {
          zone = a.zone();
        } else if (b instanceof DateTime) {
          zone = b.zone();
        } else {
          zone = TimeZone.utc();
        }
      } else {
        zone = TimeZone.fromAny(zone);
      }
      return new DateTimeInterpolator(DateTime.time(a), DateTime.time(b), zone);
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): DateTimeInterpolator | null {
    if (a instanceof DateTime && b instanceof DateTime) {
      return new DateTimeInterpolator(a.time(), b.time(), a.zone());
    }
    return null;
  }

  static tryBetweenAny(a: unknown, b: unknown): DateTimeInterpolator | null {
    if ((a instanceof DateTime || a instanceof Date || DateTime.isInit(a)) &&
        (b instanceof DateTime || b instanceof Date || DateTime.isInit(b))) {
      let zone: TimeZone;
      if (a instanceof DateTime) {
        zone = a.zone();
      } else if (b instanceof DateTime) {
        zone = b.zone();
      } else {
        zone = TimeZone.utc();
      }
      return new DateTimeInterpolator(DateTime.time(a), DateTime.time(b), zone);
    }
    return null;
  }
}
Interpolator.registerFactory(DateTimeInterpolator);
