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

import {Lazy} from "@swim/util";
import {AnyDateTime, DateTime} from "../DateTime";
import {FilterTimeInterval} from "../"; // forward import
import {YearInterval} from "../"; // forward import
import {MonthInterval} from "../"; // forward import
import {WeekInterval} from "../"; // forward import
import {DayInterval} from "../"; // forward import
import {HourInterval} from "../"; // forward import
import {MinuteInterval} from "../"; // forward import
import {SecondInterval} from "../"; // forward import
import {MillisecondInterval} from "../"; // forward import

export abstract class TimeInterval {
  abstract offset(d: AnyDateTime, k?: number): DateTime;

  next(d: AnyDateTime, k?: number): DateTime {
    return this.floor(this.offset(d, k));
  }

  abstract floor(d: AnyDateTime): DateTime;

  ceil(d: AnyDateTime): DateTime {
    if (d instanceof DateTime) {
      d = new DateTime(d.time - 1, d.zone);
    } else {
      d = DateTime.time(d) - 1;
    }
    return this.next(this.floor(d), 1);
  }

  round(t: AnyDateTime): DateTime {
    const d = DateTime.fromAny(t);
    const d0 = this.floor(d);
    const d1 = this.ceil(d);
    return d.time - d0.time < d1.time - d.time ? d0 : d1;
  }

  range(t0: AnyDateTime, t1: AnyDateTime, step?: number): DateTime[] {
    let d0 = this.ceil(t0);
    const d1 = DateTime.time(t1);
    const ds: DateTime[] = [];
    step = typeof step === "number" ? Math.floor(step) : 1;
    if (step > 0) {
      while (d0.isDefined() && d0.time < d1) {
        ds.push(d0);
        d0 = this.next(d0, step);
      }
    }
    return ds;
  }

  filter(predicate: (d: DateTime) => boolean): TimeInterval {
    return new FilterTimeInterval(this, predicate);
  }

  @Lazy
  static get year(): UnitTimeInterval {
    return new YearInterval();
  }

  @Lazy
  static get month(): UnitTimeInterval {
    return new MonthInterval();
  }

  @Lazy
  static get week(): TimeInterval {
    return new WeekInterval();
  }

  @Lazy
  static get day(): UnitTimeInterval {
    return new DayInterval();
  }

  @Lazy
  static get hour(): UnitTimeInterval {
    return new HourInterval();
  }

  @Lazy
  static get minute(): UnitTimeInterval {
    return new MinuteInterval();
  }

  @Lazy
  static get second(): UnitTimeInterval {
    return new SecondInterval();
  }

  @Lazy
  static get millisecond(): UnitTimeInterval {
    return new MillisecondInterval();
  }

  static years(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.year.range(d0, d1, step);
  }

  static months(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.month.range(d0, d1, step);
  }

  static weeks(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.week.range(d0, d1, step);
  }

  static days(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.day.range(d0, d1, step);
  }

  static hours(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.hour.range(d0, d1, step);
  }

  static minutes(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.minute.range(d0, d1, step);
  }

  static seconds(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.second.range(d0, d1, step);
  }

  static milliseconds(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.millisecond.range(d0, d1, step);
  }

  /** @hidden */
  static readonly MillisPerSecond: number = 1000;
  /** @hidden */
  static readonly MillisPerMinute: number = 60 * TimeInterval.MillisPerSecond;
  /** @hidden */
  static readonly MillisPerHour: number = 60 * TimeInterval.MillisPerMinute;
}

export abstract class UnitTimeInterval extends TimeInterval {
  abstract every(k: number): TimeInterval;
}
