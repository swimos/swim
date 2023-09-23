// Copyright 2015-2023 Nstream, inc.
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

import type {DateTimeLike} from "./DateTime";
import {DateTime} from "./DateTime";

/** @public */
export abstract class TimeInterval {
  abstract offset(d: DateTimeLike, k?: number): DateTime;

  next(d: DateTimeLike, k?: number): DateTime {
    return this.floor(this.offset(d, k));
  }

  abstract floor(d: DateTimeLike): DateTime;

  ceil(d: DateTimeLike): DateTime {
    if (d instanceof DateTime) {
      d = new DateTime(d.time - 1, d.zone);
    } else {
      d = DateTime.time(d) - 1;
    }
    return this.next(this.floor(d), 1);
  }

  round(t: DateTimeLike): DateTime {
    const d = DateTime.fromLike(t);
    const d0 = this.floor(d);
    const d1 = this.ceil(d);
    return d.time - d0.time < d1.time - d.time ? d0 : d1;
  }

  range(t0: DateTimeLike, t1: DateTimeLike, step?: number): DateTime[] {
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

  /** @internal */
  static Year: YearInterval | null = null;
  static get year(): UnitTimeInterval {
    if (this.Year === null) {
      this.Year = new YearInterval();
    }
    return this.Year;
  }

  /** @internal */
  static Month: MonthInterval | null = null;
  static get month(): UnitTimeInterval {
    if (this.Month === null) {
      this.Month = new MonthInterval();
    }
    return this.Month;
  }

  /** @internal */
  static Week: WeekInterval | null = null;
  static get week(): TimeInterval {
    if (this.Week === null) {
      this.Week = new WeekInterval();
    }
    return this.Week;
  }

  /** @internal */
  static Day: DayInterval | null = null;
  static get day(): UnitTimeInterval {
    if (this.Day === null) {
      this.Day = new DayInterval();
    }
    return this.Day;
  }

  /** @internal */
  static Hour: HourInterval | null = null;
  static get hour(): UnitTimeInterval {
    if (this.Hour === null) {
      this.Hour = new HourInterval();
    }
    return this.Hour;
  }

  /** @internal */
  static Minute: MinuteInterval | null = null;
  static get minute(): UnitTimeInterval {
    if (this.Minute === null) {
      this.Minute = new MinuteInterval();
    }
    return this.Minute;
  }

  /** @internal */
  static Second: SecondInterval | null = null;
  static get second(): UnitTimeInterval {
    if (this.Second === null) {
      this.Second = new SecondInterval();
    }
    return this.Second;
  }

  /** @internal */
  static Millisecond: MillisecondInterval | null = null;
  static get millisecond(): UnitTimeInterval {
    if (this.Millisecond === null) {
      this.Millisecond = new MillisecondInterval();
    }
    return this.Millisecond;
  }

  static years(d0: DateTimeLike, d1: DateTimeLike, step?: number): DateTime[] {
    return TimeInterval.year.range(d0, d1, step);
  }

  static months(d0: DateTimeLike, d1: DateTimeLike, step?: number): DateTime[] {
    return TimeInterval.month.range(d0, d1, step);
  }

  static weeks(d0: DateTimeLike, d1: DateTimeLike, step?: number): DateTime[] {
    return TimeInterval.week.range(d0, d1, step);
  }

  static days(d0: DateTimeLike, d1: DateTimeLike, step?: number): DateTime[] {
    return TimeInterval.day.range(d0, d1, step);
  }

  static hours(d0: DateTimeLike, d1: DateTimeLike, step?: number): DateTime[] {
    return TimeInterval.hour.range(d0, d1, step);
  }

  static minutes(d0: DateTimeLike, d1: DateTimeLike, step?: number): DateTime[] {
    return TimeInterval.minute.range(d0, d1, step);
  }

  static seconds(d0: DateTimeLike, d1: DateTimeLike, step?: number): DateTime[] {
    return TimeInterval.second.range(d0, d1, step);
  }

  static milliseconds(d0: DateTimeLike, d1: DateTimeLike, step?: number): DateTime[] {
    return TimeInterval.millisecond.range(d0, d1, step);
  }

  /** @internal */
  static readonly MillisPerSecond: number = 1000;
  /** @internal */
  static readonly MillisPerMinute: number = 60 * this.MillisPerSecond;
  /** @internal */
  static readonly MillisPerHour: number = 60 * this.MillisPerMinute;
}

/** @public */
export abstract class UnitTimeInterval extends TimeInterval {
  abstract every(k: number): TimeInterval;
}

/** @internal */
export class FilterTimeInterval extends TimeInterval {
  constructor(unit: TimeInterval, predicate: (d: DateTime) => boolean) {
    super();
    this.unit = unit;
    this.predicate = predicate;
  }

  /** @internal */
  readonly unit: TimeInterval;
  /** @internal */
  readonly predicate: (d: DateTime) => boolean;

  override offset(t: DateTimeLike, k?: number): DateTime {
    let d = DateTime.fromLike(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    while (k < 0) {
      do {
        d = this.unit.offset(d, -1);
      } while (d.isDefined() && !this.predicate(d));
      k += 1;
    }
    while (k > 0) {
      do {
        d = this.unit.offset(d, 1);
      } while (d.isDefined() && !this.predicate(d));
      k -= 1;
    }
    return d;
  }

  override floor(t: DateTimeLike): DateTime {
    let d = DateTime.fromLike(t);
    while (d = this.unit.floor(d), d.isDefined() && !this.predicate(d)) {
      d = new DateTime(d.time - 1, d.zone);
    }
    return d;
  }
}

/** @internal */
export class YearInterval extends UnitTimeInterval {
  override offset(t: DateTimeLike, k?: number): DateTime {
    let d = DateTime.fromLike(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d = d.withYear(d.year + k);
    return d;
  }

  override next(t: DateTimeLike, k?: number): DateTime {
    const d = DateTime.fromLike(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.withYear(d.year + k).withMonth(0, 1).withHour(0, 0, 0, 0);
  }

  override floor(t: DateTimeLike): DateTime {
    const d = DateTime.fromLike(t);
    return d.withMonth(0, 1).withHour(0, 0, 0, 0);
  }

  override ceil(t: DateTimeLike): DateTime {
    let d = DateTime.fromLike(t);
    d = new DateTime(d.time - 1, d.zone);
    d = d.withMonth(0, 1).withHour(0, 0, 0, 0);
    d = d.withYear(d.year + 1);
    return d.withMonth(0, 1).withHour(0, 0, 0, 0);
  }

  override every(k: number): TimeInterval {
    if (k === 1) {
      return this;
    } else if (isFinite(k) && k >= 1) {
      return new YearsInterval(k);
    }
    throw new Error("" + k);
  }
}

/** @internal */
export class YearsInterval extends TimeInterval {
  private readonly stride: number;

  constructor(stride: number) {
    super();
    this.stride = stride;
  }

  override offset(t: DateTimeLike, k?: number): DateTime {
    const d = DateTime.fromLike(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.withYear(d.year + k * this.stride);
  }

  override next(t: DateTimeLike, k?: number): DateTime {
    let d = DateTime.fromLike(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d = d.withYear(Math.floor((d.year + k * this.stride) / this.stride) * this.stride);
    return d.withMonth(0, 1).withHour(0, 0, 0, 0);
  }

  override floor(t: DateTimeLike): DateTime {
    let d = DateTime.fromLike(t);
    d = d.withYear(Math.floor(d.year / this.stride) * this.stride);
    return d.withMonth(0, 1).withHour(0, 0, 0, 0);
  }

  override ceil(t: DateTimeLike): DateTime {
    let d = DateTime.fromLike(t);
    d = new DateTime(d.time - 1, d.zone);
    d = d.withYear(Math.floor(d.year / this.stride) * this.stride);
    d = d.withMonth(0, 1).withHour(0, 0, 0, 0);
    d = d.withYear(Math.floor((d.year + this.stride) / this.stride) * this.stride);
    return d.withMonth(0, 1).withHour(0, 0, 0, 0);
  }
}

/** @internal */
export class MonthInterval extends UnitTimeInterval {
  override offset(t: DateTimeLike, k?: number): DateTime {
    const d = DateTime.fromLike(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.withMonth(d.month + k);
  }

  override next(t: DateTimeLike, k?: number): DateTime {
    let d = DateTime.fromLike(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d = d.withMonth(d.month + k);
    return d.withDay(1).withHour(0, 0, 0, 0);
  }

  override floor(t: DateTimeLike): DateTime {
    const d = DateTime.fromLike(t);
    return d.withDay(1).withHour(0, 0, 0, 0);
  }

  override ceil(t: DateTimeLike): DateTime {
    let d = DateTime.fromLike(t);
    d = new DateTime(d.time - 1, d.zone);
    d = d.withDay(1).withHour(0, 0, 0, 0);
    d = d.withMonth(d.month + 1);
    return d.withDay(1).withHour(0, 0, 0, 0);
  }

  override every(k: number): TimeInterval {
    if (k === 1) {
      return this;
    } else if (isFinite(k) && k >= 1) {
      return new FilterTimeInterval(this, MonthInterval.modulo.bind(void 0, k));
    }
    throw new Error("" + k);
  }

  /** @internal */
  static modulo(k: number, d: DateTime): boolean {
    const month = d.month;
    return isFinite(month) && month % k === 0;
  }
}

/** @internal */
export class WeekInterval extends TimeInterval {
  readonly day: number;

  constructor(day: number = 0) {
    super();
    this.day = day;
  }

  override offset(t: DateTimeLike, k?: number): DateTime {
    const d = DateTime.fromLike(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.withDay(d.day + 7 * k);
  }

  override next(t: DateTimeLike, k?: number): DateTime {
    let d = DateTime.fromLike(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d = d.withDay(d.day + 7 * k);
    d = d.withDay(d.day - (d.weekday + 7 - this.day) % 7);
    return d.withHour(0, 0, 0, 0);
  }

  override floor(t: DateTimeLike): DateTime {
    let d = DateTime.fromLike(t);
    d = d.withDay(d.day - (d.weekday + 7 - this.day) % 7);
    return d.withHour(0, 0, 0, 0);
  }

  override ceil(t: DateTimeLike): DateTime {
    let d = DateTime.fromLike(t);
    d = new DateTime(d.time - 1, d.zone);
    d = d.withDay(d.day - (d.weekday + 7 - this.day) % 7);
    d = d.withHour(0, 0, 0, 0);
    d = d.withDay(d.day + 7);
    return d.withHour(0, 0, 0, 0);
  }
}

/** @internal */
export class DayInterval extends UnitTimeInterval {
  override offset(t: DateTimeLike, k?: number): DateTime {
    const d = DateTime.fromLike(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.withDay(d.day + k);
  }

  override next(t: DateTimeLike, k?: number): DateTime {
    let d = DateTime.fromLike(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d = d.withDay(d.day + k);
    return d.withHour(0, 0, 0, 0);
  }

  override floor(t: DateTimeLike): DateTime {
    const d = DateTime.fromLike(t);
    return d.withHour(0, 0, 0, 0);
  }

  override ceil(t: DateTimeLike): DateTime {
    let d = DateTime.fromLike(t);
    d = new DateTime(d.time - 1, d.zone);
    d = d.withHour(0, 0, 0, 0);
    d = d.withDay(d.day + 1);
    return d.withHour(0, 0, 0, 0);
  }

  override every(k: number): TimeInterval {
    if (k === 1) {
      return this;
    } else if (isFinite(k) && k >= 1) {
      return new FilterTimeInterval(this, DayInterval.modulo.bind(void 0, k));
    }
    throw new Error("" + k);
  }

  /** @internal */
  static modulo(k: number, d: DateTime): boolean {
    const day = d.day;
    return isFinite(day) && day % k === 0;
  }
}

/** @internal */
export class HourInterval extends UnitTimeInterval {
  override offset(d: DateTimeLike, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d += k * TimeInterval.MillisPerHour;
    return new DateTime(d, z);
  }

  override next(d: DateTimeLike, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d += k * TimeInterval.MillisPerHour;
    let dtz = z.offset * TimeInterval.MillisPerMinute % TimeInterval.MillisPerHour;
    if (dtz < 0) {
      dtz += TimeInterval.MillisPerHour;
    }
    d = Math.floor((d - dtz) / TimeInterval.MillisPerHour) * TimeInterval.MillisPerHour + dtz;
    return new DateTime(d, z);
  }

  override floor(d: DateTimeLike): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    let dtz = z.offset * TimeInterval.MillisPerMinute % TimeInterval.MillisPerHour;
    if (dtz < 0) {
      dtz += TimeInterval.MillisPerHour;
    }
    d = Math.floor((d - dtz) / TimeInterval.MillisPerHour) * TimeInterval.MillisPerHour + dtz;
    return new DateTime(d, z);
  }

  override ceil(d: DateTimeLike): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    d -= 1;
    let dtz = z.offset * TimeInterval.MillisPerMinute % TimeInterval.MillisPerHour;
    if (dtz < 0) {
      dtz += TimeInterval.MillisPerHour;
    }
    d = (Math.floor((d - dtz) / TimeInterval.MillisPerHour) * TimeInterval.MillisPerHour + dtz) + TimeInterval.MillisPerHour;
    d = Math.floor((d - dtz) / TimeInterval.MillisPerHour) * TimeInterval.MillisPerHour + dtz;
    return new DateTime(d, z);
  }

  override every(k: number): TimeInterval {
    if (k === 1) {
      return this;
    } else if (isFinite(k) && k >= 1) {
      return new FilterTimeInterval(this, HourInterval.modulo.bind(void 0, k));
    }
    throw new Error("" + k);
  }

  /** @internal */
  static modulo(k: number, d: DateTime): boolean {
    const hour = d.hour;
    return isFinite(hour) && hour % k === 0;
  }
}

/** @internal */
export class MinuteInterval extends UnitTimeInterval {
  override offset(d: DateTimeLike, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d += k * TimeInterval.MillisPerMinute;
    return new DateTime(d, z);
  }

  override next(d: DateTimeLike, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d = Math.floor((d + k * TimeInterval.MillisPerMinute) / TimeInterval.MillisPerMinute) * TimeInterval.MillisPerMinute;
    return new DateTime(d, z);
  }

  override floor(d: DateTimeLike): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    d = Math.floor(d / TimeInterval.MillisPerMinute) * TimeInterval.MillisPerMinute;
    return new DateTime(d, z);
  }

  override ceil(d: DateTimeLike): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    d = Math.floor(((Math.floor((d - 1) / TimeInterval.MillisPerMinute) * TimeInterval.MillisPerMinute) + TimeInterval.MillisPerMinute) / TimeInterval.MillisPerMinute) * TimeInterval.MillisPerMinute;
    return new DateTime(d, z);
  }

  override every(k: number): TimeInterval {
    if (k === 1) {
      return this;
    } else if (isFinite(k) && k >= 1) {
      return new FilterTimeInterval(this, MinuteInterval.modulo.bind(void 0, k));
    }
    throw new Error("" + k);
  }

  /** @internal */
  static modulo(k: number, d: DateTime): boolean {
    const minute = d.minute;
    return isFinite(minute) && minute % k === 0;
  }
}

/** @internal */
export class SecondInterval extends UnitTimeInterval {
  override offset(d: DateTimeLike, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d += k * TimeInterval.MillisPerSecond;
    return new DateTime(d, z);
  }

  override next(d: DateTimeLike, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d += k * TimeInterval.MillisPerSecond;
    d = Math.floor(d / TimeInterval.MillisPerSecond) * TimeInterval.MillisPerSecond;
    return new DateTime(d, z);
  }

  override floor(d: DateTimeLike): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    d = Math.floor(d / TimeInterval.MillisPerSecond) * TimeInterval.MillisPerSecond;
    return new DateTime(d, z);
  }

  override ceil(d: DateTimeLike): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    d = Math.floor(((Math.floor((d - 1) / TimeInterval.MillisPerSecond) * TimeInterval.MillisPerSecond) + TimeInterval.MillisPerSecond) / TimeInterval.MillisPerSecond) * TimeInterval.MillisPerSecond;
    return new DateTime(d, z);
  }

  override every(k: number): TimeInterval {
    if (k === 1) {
      return this;
    } else if (isFinite(k) && k >= 1) {
      return new FilterTimeInterval(this, SecondInterval.modulo.bind(void 0, k));
    }
    throw new Error('' + k);
  }

  /** @internal */
  static modulo(k: number, d: DateTime): boolean {
    const second = d.second;
    return isFinite(second) && second % k === 0;
  }
}

/** @internal */
export class MillisecondInterval extends UnitTimeInterval {
  override offset(d: DateTimeLike, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d += k;
    return new DateTime(d, z);
  }

  override next(d: DateTimeLike, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d += k;
    return new DateTime(d, z);
  }

  override floor(d: DateTimeLike): DateTime {
    return DateTime.fromLike(d);
  }

  override ceil(d: DateTimeLike): DateTime {
    return DateTime.fromLike(d);
  }

  override every(k: number): TimeInterval {
    if (k === 1) {
      return this;
    } else if (isFinite(k) && k >= 1) {
      return new MillisecondsInterval(k);
    }
    throw new Error("" + k);
  }
}

/** @internal */
export class MillisecondsInterval extends TimeInterval {
  private readonly stride: number;

  constructor(stride: number) {
    super();
    if (!isFinite(stride)) {
      stride = 1;
    }
    this.stride = stride;
  }

  override offset(d: DateTimeLike, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d += k * this.stride;
    return new DateTime(d, z);
  }

  override next(d: DateTimeLike, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    const stride = this.stride;
    d = Math.floor((d + k * stride) / stride) * stride;
    return new DateTime(d, z);
  }

  override floor(d: DateTimeLike): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    const stride = this.stride;
    d = Math.floor(d / stride) * stride;
    return new DateTime(d, z);
  }

  override ceil(d: DateTimeLike): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    const stride = this.stride;
    d = Math.floor(((Math.floor((d - 1) / stride) * stride) + stride) / stride) * stride;
    return new DateTime(d, z);
  }
}
