// Copyright 2015-2021 Swim inc.
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

import {HashCode, Equivalent, Compare, Lazy, Murmur3, Numbers, Constructors} from "@swim/util";
import type {Display, Output} from "@swim/codec";
import type {Interpolate, Interpolator} from "@swim/mapping";
import {Item, Value, Form} from "@swim/structure";
import {AnyTimeZone, TimeZone} from "./TimeZone";
import {DateTimeInterpolator} from "./"; // forward import
import {DateTimeForm} from "./"; // forward import
import {DateTimeFormat} from "./"; // forward import

export type AnyDateTime = DateTime | DateTimeInit | Date | string | number;

export interface DateTimeInit {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
  zone?: AnyTimeZone;
}

export class DateTime implements Interpolate<DateTime>, HashCode, Equivalent, Compare, Display {
  constructor(time: number, zone: TimeZone = TimeZone.utc) {
    Object.defineProperty(this, "time", {
      value: time,
      enumerable: true,
    });
    Object.defineProperty(this, "zone", {
      value: zone,
      enumerable: true,
    });
  }

  isDefined(): boolean {
    return isFinite(new Date(this.time).getTime());
  }

  readonly time!: number;

  readonly zone!: TimeZone;

  get year(): number {
    return this.toUTCLocalDate().getUTCFullYear();
  }

  withYear(year: number, month?: number, day?: number, hour?: number, minute?: number,
           second?: number, millisecond?: number): DateTime {
    const date = this.toUTCLocalDate();
    date.setUTCFullYear(year);
    if (month !== void 0) {
      date.setUTCMonth(month);
    }
    if (day !== void 0) {
      date.setUTCDate(day);
    }
    if (hour !== void 0) {
      date.setUTCHours(hour);
    }
    if (minute !== void 0) {
      date.setUTCMinutes(minute);
    }
    if (second !== void 0) {
      date.setUTCSeconds(second);
    }
    if (millisecond !== void 0) {
      date.setUTCMilliseconds(millisecond);
    }
    return DateTime.fromUTCLocalDate(date, this.zone);
  }

  get month(): number {
    return this.toUTCLocalDate().getUTCMonth();
  }

  withMonth(month: number, day?: number, hour?: number, minute?: number,
            second?: number, millisecond?: number): DateTime {
    const date = this.toUTCLocalDate();
    date.setUTCMonth(month);
    if (day !== void 0) {
      date.setUTCDate(day);
    }
    if (hour !== void 0) {
      date.setUTCHours(hour);
    }
    if (minute !== void 0) {
      date.setUTCMinutes(minute);
    }
    if (second !== void 0) {
      date.setUTCSeconds(second);
    }
    if (millisecond !== void 0) {
      date.setUTCMilliseconds(millisecond);
    }
    return DateTime.fromUTCLocalDate(date, this.zone);
  }

  get day(): number {
    return this.toUTCLocalDate().getUTCDate();
  }

  withDay(day: number, hour?: number, minute?: number, second?: number,
          millisecond?: number): DateTime {
    const date = this.toUTCLocalDate();
    date.setUTCDate(day);
    if (hour !== void 0) {
      date.setUTCHours(hour);
    }
    if (minute !== void 0) {
      date.setUTCMinutes(minute);
    }
    if (second !== void 0) {
      date.setUTCSeconds(second);
    }
    if (millisecond !== void 0) {
      date.setUTCMilliseconds(millisecond);
    }
    return DateTime.fromUTCLocalDate(date, this.zone);
  }

  get hour(): number {
    return this.toUTCLocalDate().getUTCHours();
  }

  withHour(hour: number, minute?: number, second?: number, millisecond?: number): DateTime {
    const date = this.toUTCLocalDate();
    date.setUTCHours(hour);
    if (minute !== void 0) {
      date.setUTCMinutes(minute);
    }
    if (second !== void 0) {
      date.setUTCSeconds(second);
    }
    if (millisecond !== void 0) {
      date.setUTCMilliseconds(millisecond);
    }
    return DateTime.fromUTCLocalDate(date, this.zone);
  }

  get minute(): number {
    return this.toUTCLocalDate().getUTCMinutes();
  }

  withMinute(minute: number, second?: number, millisecond?: number): DateTime {
    const date = this.toUTCLocalDate();
    date.setUTCMinutes(minute);
    if (second !== void 0) {
      date.setUTCSeconds(second);
    }
    if (millisecond !== void 0) {
      date.setUTCMilliseconds(millisecond);
    }
    return DateTime.fromUTCLocalDate(date, this.zone);
  }

  get second(): number {
    return this.toUTCLocalDate().getUTCSeconds();
  }

  withSecond(second: number, millisecond?: number): DateTime {
    const date = this.toUTCLocalDate();
    date.setUTCSeconds(second);
    if (millisecond !== void 0) {
      date.setUTCMilliseconds(millisecond);
    }
    return DateTime.fromUTCLocalDate(date, this.zone);
  }

  get millisecond(): number {
    return this.toUTCLocalDate().getUTCMilliseconds();
  }

  withMillisecond(millisecond: number): DateTime {
    const date = this.toUTCLocalDate();
    date.setUTCMilliseconds(millisecond);
    return DateTime.fromUTCLocalDate(date, this.zone);
  }

  get weekday(): number {
    return this.toUTCLocalDate().getUTCDay();
  }

  /**
   * Returns this date time shifted by the time zone offset.
   * @hidden
   */
  toUTCLocalDate(): Date {
    return new Date(this.time + 60000 * this.zone.offset);
  }

  toDate(): Date {
    return new Date(this.time);
  }

  valueOf(): number {
    return this.time;
  }

  interpolateTo(that: DateTime): Interpolator<DateTime>;
  interpolateTo(that: unknown): Interpolator<DateTime> | null;
  interpolateTo(that: unknown): Interpolator<DateTime> | null {
    if (that instanceof DateTime) {
      return DateTimeInterpolator(this, that);
    } else {
      return null;
    }
  }

  compareTo(that: unknown): number {
    if (that instanceof DateTime) {
      const x = this.time;
      const y = that.time;
      return x < y ? -1 : x > y ? 1 : x === y ? 0 : NaN;
    }
    return NaN;
  }

  equivalentTo(that: AnyDateTime, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof DateTime) {
      return Numbers.equivalent(this.time, that.time, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof DateTime) {
      return this.time === that.time && this.zone.equals(that.zone);
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(DateTime),
        Numbers.hash(this.time)), this.zone.hashCode()));
  }

  display(output: Output, format: DateTimeFormat = DateTimeFormat.iso8601): void {
    format.writeDate(this, output);
  }

  toString(format: DateTimeFormat = DateTimeFormat.iso8601): string {
    return format.format(this);
  }

  static current(zone?: AnyTimeZone): DateTime {
    zone = zone !== void 0 ? TimeZone.fromAny(zone) : TimeZone.local;
    return new DateTime(Date.now(), zone);
  }

  /**
   * Returns this date time shifted back by the time zone offset.
   * @hidden
   */
  static fromUTCLocalDate(date: Date, zone: TimeZone): DateTime {
    return new DateTime(date.getTime() - 60000 * zone.offset, zone);
  }

  static fromInit(init: DateTimeInit, zone?: AnyTimeZone): DateTime {
    let time = Date.UTC(init.year !== void 0 ? init.year : 1970,
                        init.month !== void 0 ? init.month : 0,
                        init.day !== void 0 ? init.day : 1,
                        init.hour !== void 0 ? init.hour : 0,
                        init.minute !== void 0 ? init.minute : 0,
                        init.second !== void 0 ? init.second : 0,
                        init.millisecond !== void 0 ? init.millisecond : 0);
    if (init.zone !== void 0) {
      zone = TimeZone.fromAny(init.zone);
    }
    if (zone !== void 0) {
      zone = TimeZone.fromAny(zone);
      time += 60000 * zone.offset;
    } else {
      zone = TimeZone.utc;
    }
    return new DateTime(time, zone);
  }

  static fromAny(value: AnyDateTime, zone?: AnyTimeZone): DateTime {
    if (value === void 0 || value === null || value instanceof DateTime) {
      return value;
    } else if (value instanceof Date) {
      zone = zone !== void 0 ? TimeZone.fromAny(zone) : TimeZone.utc;
      return new DateTime(value.getTime(), zone);
    } else if (typeof value === "number") {
      zone = zone !== void 0 ? TimeZone.fromAny(zone) : TimeZone.utc;
      return new DateTime(value, zone);
    } else if (typeof value === "string") {
      return DateTime.parse(value, zone);
    } else if (DateTime.isInit(value)) {
      return DateTime.fromInit(value, zone);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): DateTime | null {
    let positional: boolean;
    const header = value.header("date");
    if (header.isDefined()) {
      value = header;
      positional = true;
    } else {
      positional = false;
    }
    const init: DateTimeInit = {};
    value.forEach(function (item: Item, index: number) {
      const key = item.key.stringValue(void 0);
      if (key !== void 0) {
        if (key === "year") {
          init.year = item.toValue().numberValue(init.year);
        } else if (key === "month") {
          init.month = item.toValue().numberValue(init.month);
        } else if (key === "day") {
          init.day = item.toValue().numberValue(init.day);
        } else if (key === "hour") {
          init.hour = item.toValue().numberValue(init.hour);
        } else if (key === "minute") {
          init.minute = item.toValue().numberValue(init.minute);
        } else if (key === "second") {
          init.second = item.toValue().numberValue(init.second);
        } else if (key === "millisecond") {
          init.millisecond = item.toValue().numberValue(init.millisecond);
        } else if (key === "zone") {
          init.zone = item.toValue().cast(TimeZone.form(), init.zone);
        }
      } else if (item instanceof Value && positional) {
        if (index === 0) {
          init.year = item.numberValue(init.year);
        } else if (index === 1) {
          init.month = item.numberValue(init.month);
        } else if (index === 2) {
          init.day = item.numberValue(init.day);
        } else if (index === 3) {
          init.hour = item.numberValue(init.hour);
        } else if (index === 4) {
          init.minute = item.numberValue(init.minute);
        } else if (index === 5) {
          init.second = item.numberValue(init.second);
        } else if (index === 6) {
          init.millisecond = item.numberValue(init.millisecond);
        } else if (index === 7) {
          init.zone = item.cast(TimeZone.form(), init.zone);
        }
      }
    });
    if (DateTime.isInit(init)) {
      return DateTime.fromInit(init);
    }
    return null;
  }

  static parse(date: string, zone?: AnyTimeZone): DateTime {
    return DateTimeFormat.iso8601.parse(date);
  }

  static time(date: AnyDateTime): number {
    if (date instanceof DateTime) {
      return date.time;
    } else if (date instanceof Date) {
      return date.getTime();
    } else if (typeof date === "number") {
      return date;
    } else if (typeof date === "string") {
      return DateTime.parse(date).time;
    } else if (DateTime.isInit(date)) {
      return DateTime.fromInit(date).time;
    }
    throw new TypeError("" + date);
  }

  static zone(date: AnyDateTime): TimeZone {
    if (date instanceof DateTime) {
      return date.zone;
    } else {
      return TimeZone.utc;
    }
  }

  /** @hidden */
  static isInit(value: unknown): value is DateTimeInit {
    if (typeof value === "object" && value !== null) {
      const init = value as DateTimeInit;
      return (typeof init.year === "undefined" || typeof init.year === "number")
          && (typeof init.month === "undefined" || typeof init.month === "number")
          && (typeof init.day === "undefined" || typeof init.day === "number")
          && (typeof init.hour === "undefined" || typeof init.hour === "number")
          && (typeof init.minute === "undefined" || typeof init.minute === "number")
          && (typeof init.second === "undefined" || typeof init.second === "number")
          && (typeof init.millisecond === "undefined" || typeof init.millisecond === "number")
          && (typeof init.zone === "undefined" || TimeZone.isAny(init.zone))
          && (typeof init.year === "number"
           || typeof init.month === "number"
           || typeof init.day === "number"
           || typeof init.hour === "number"
           || typeof init.minute === "number"
           || typeof init.second === "number"
           || typeof init.millisecond === "number");
    }
    return false;
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyDateTime {
    return value instanceof DateTime
        || value instanceof Date
        || typeof value === "number"
        || typeof value === "string"
        || DateTime.isInit(value);
  }

  @Lazy
  static form(): Form<DateTime, AnyDateTime> {
    return new DateTimeForm(new DateTime(0));
  }
}
