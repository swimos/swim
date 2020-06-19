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

import {AnyDateTime, DateTime} from "./DateTime";
import {FilterTimeInterval} from "./interval/FilterTimeInterval";
import {YearInterval} from "./interval/YearInterval";
import {YearsInterval} from "./interval/YearsInterval";
import {MonthInterval} from "./interval/MonthInterval";
import {WeekInterval} from "./interval/WeekInterval";
import {DayInterval} from "./interval/DayInterval";
import {HourInterval} from "./interval/HourInterval";
import {MinuteInterval} from "./interval/MinuteInterval";
import {SecondInterval} from "./interval/SecondInterval";
import {MillisecondInterval} from "./interval/MillisecondInterval";
import {MillisecondsInterval} from "./interval/MillisecondsInterval";

/** @hidden */
export const MILLIS_PER_SECOND: number = 1000;
/** @hidden */
export const MILLIS_PER_MINUTE: number = 60 * MILLIS_PER_SECOND;
/** @hidden */
export const MILLIS_PER_HOUR: number = 60 * MILLIS_PER_MINUTE;

export abstract class TimeInterval {
  abstract offset(d: AnyDateTime, k?: number): DateTime;

  next(d: AnyDateTime, k?: number): DateTime {
    return this.floor(this.offset(d, k));
  }

  abstract floor(d: AnyDateTime): DateTime;

  ceil(d: AnyDateTime): DateTime {
    if (d instanceof DateTime) {
      d = d.time(d.time() - 1);
    } else {
      d = DateTime.time(d) - 1;
    }
    return this.next(this.floor(d), 1);
  }

  round(d: AnyDateTime): DateTime {
    d = DateTime.fromAny(d);
    const d0 = this.floor(d);
    const d1 = this.ceil(d);
    return d.time() - d0.time() < d1.time() - d.time() ? d0 : d1;
  }

  range(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    d0 = this.ceil(d0);
    d1 = DateTime.time(d1);
    const ds = [];
    step = typeof step === "number" ? Math.floor(step) : 1;
    if (step > 0) {
      while (d0.isDefined() && d0.time() < d1) {
        ds.push(d0);
        d0 = this.next(d0, step);
      }
    }
    return ds;
  }

  filter(predicate: (d: DateTime) => boolean): TimeInterval {
    return new TimeInterval.Filter(this, predicate);
  }

  private static _year?: YearInterval;
  static year(): UnitTimeInterval;
  static year(k: number): TimeInterval;
  static year(k?: number): TimeInterval {
    if (TimeInterval._year === void 0) {
      TimeInterval._year = new TimeInterval.Year();
    }
    if (k === void 0) {
      return TimeInterval._year;
    } else {
      return TimeInterval._year.every(k);
    }
  }

  private static _month?: MonthInterval;
  static month(): UnitTimeInterval;
  static month(k: number): TimeInterval;
  static month(k?: number): TimeInterval {
    if (TimeInterval._month === void 0) {
      TimeInterval._month = new TimeInterval.Month();
    }
    if (k === void 0) {
      return TimeInterval._month;
    } else {
      return TimeInterval._month.every(k);
    }
  }

  private static _week?: WeekInterval;
  static week(): TimeInterval {
    if (TimeInterval._week === void 0) {
      TimeInterval._week = new TimeInterval.Week();
    }
    return TimeInterval._week;
  }

  private static _day?: DayInterval;
  static day(): UnitTimeInterval;
  static day(k: number): TimeInterval;
  static day(k?: number): TimeInterval {
    if (TimeInterval._day === void 0) {
      TimeInterval._day = new TimeInterval.Day();
    }
    if (k === void 0) {
      return TimeInterval._day;
    } else {
      return TimeInterval._day.every(k);
    }
  }

  private static _hour?: HourInterval;
  static hour(): UnitTimeInterval;
  static hour(k: number): TimeInterval;
  static hour(k?: number): TimeInterval {
    if (TimeInterval._hour === void 0) {
      TimeInterval._hour = new TimeInterval.Hour();
    }
    if (k === void 0) {
      return TimeInterval._hour;
    } else {
      return TimeInterval._hour.every(k);
    }
  }

  private static _minute?: MinuteInterval;
  static minute(): UnitTimeInterval;
  static minute(k: number): TimeInterval;
  static minute(k?: number): TimeInterval {
    if (TimeInterval._minute === void 0) {
      TimeInterval._minute = new TimeInterval.Minute();
    }
    if (k === void 0) {
      return TimeInterval._minute;
    } else {
      return TimeInterval._minute.every(k);
    }
  }

  private static _second?: SecondInterval;
  static second(): UnitTimeInterval;
  static second(k: number): TimeInterval;
  static second(k?: number): TimeInterval {
    if (TimeInterval._second === void 0) {
      TimeInterval._second = new TimeInterval.Second();
    }
    if (k === void 0) {
      return TimeInterval._second;
    } else {
      return TimeInterval._second.every(k);
    }
  }

  private static _millisecond?: MillisecondInterval;
  static millisecond(): UnitTimeInterval;
  static millisecond(k: number): TimeInterval;
  static millisecond(k?: number): TimeInterval {
    if (TimeInterval._millisecond === void 0) {
      TimeInterval._millisecond = new TimeInterval.Millisecond();
    }
    if (k === void 0) {
      return TimeInterval._millisecond;
    } else {
      return TimeInterval._millisecond.every(k);
    }
  }

  static years(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.year().range(d0, d1, step);
  }

  static months(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.month().range(d0, d1, step);
  }

  static weeks(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.week().range(d0, d1, step);
  }

  static days(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.day().range(d0, d1, step);
  }

  static hours(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.hour().range(d0, d1, step);
  }

  static minutes(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.minute().range(d0, d1, step);
  }

  static seconds(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.second().range(d0, d1, step);
  }

  static milliseconds(d0: AnyDateTime, d1: AnyDateTime, step?: number): DateTime[] {
    return TimeInterval.millisecond().range(d0, d1, step);
  }

  // Forward type declarations
  /** @hidden */
  static Filter: typeof FilterTimeInterval; // defined by FilterTimeInterval
  /** @hidden */
  static Year: typeof YearInterval; // defined by YearInterval
  /** @hidden */
  static Years: typeof YearsInterval; // defined by YearsInterval
  /** @hidden */
  static Month: typeof MonthInterval; // defined by MonthInterval
  /** @hidden */
  static Week: typeof WeekInterval; // defined by WeekInterval
  /** @hidden */
  static Day: typeof DayInterval; // defined by DayInterval
  /** @hidden */
  static Hour: typeof HourInterval; // defined by HourInterval
  /** @hidden */
  static Minute: typeof MinuteInterval; // defined by MinuteInterval
  /** @hidden */
  static Second: typeof SecondInterval; // defined by SecondInterval
  /** @hidden */
  static Millisecond: typeof MillisecondInterval; // defined by MillisecondInterval
  /** @hidden */
  static Milliseconds: typeof MillisecondsInterval; // defined by MillisecondsInterval
}

export abstract class UnitTimeInterval extends TimeInterval {
  abstract every(k: number): TimeInterval;
}
