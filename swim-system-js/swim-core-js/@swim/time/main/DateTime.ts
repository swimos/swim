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

import {Comparable, HashCode, Murmur3} from "@swim/util";
import {Display, Output} from "@swim/codec";
import {Item, Value, Form} from "@swim/structure";
import {AnyTimeZone, TimeZone} from "./TimeZone";
import {DateTimeParser} from "./DateTimeParser";
import {DateTimeForm} from "./DateTimeForm";
import {DateTimeFormat} from "./DateTimeFormat";

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

export class DateTime implements Comparable<AnyDateTime>, HashCode, Display {
  /** @hidden */
  readonly _time: number;
  /** @hidden */
  readonly _zone: TimeZone;

  constructor(time: number, zone: TimeZone = TimeZone.utc()) {
    this._time = time;
    this._zone = zone;
  }

  isDefined(): boolean {
    return isFinite(new Date(this._time).getTime());
  }

  time(): number;
  time(time: number): DateTime;
  time(time?: number): number | DateTime {
    if (time === void 0) {
      return this._time;
    } else {
      return new DateTime(time, this._zone);
    }
  }

  zone(): TimeZone;
  zone(zone: TimeZone): DateTime;
  zone(zone?: TimeZone): TimeZone | DateTime {
    if (zone === void 0) {
      return this._zone;
    } else {
      return new DateTime(this._time, zone);
    }
  }

  year(): number;
  year(year: number, month?: number, day?: number, hour?: number, minute?: number,
       second?: number, millisecond?: number): DateTime;
  year(year?: number, month?: number, day?: number, hour?: number, minute?: number,
       second?: number, millisecond?: number): number | DateTime {
    const date = this.toUTCLocalDate();
    if (year === void 0) {
      return date.getUTCFullYear();
    } else {
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
      return DateTime.fromUTCLocalDate(date, this._zone);
    }
  }

  month(): number;
  month(month: number, day?: number, hour?: number, minute?: number,
        second?: number, millisecond?: number): DateTime;
  month(month?: number, day?: number, hour?: number, minute?: number,
        second?: number, millisecond?: number): number | DateTime {
    const date = this.toUTCLocalDate();
    if (month === void 0) {
      return date.getUTCMonth();
    } else {
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
      return DateTime.fromUTCLocalDate(date, this._zone);
    }
  }

  day(): number;
  day(day: number, hour?: number, minute?: number, second?: number,
      millisecond?: number): DateTime;
  day(day?: number, hour?: number, minute?: number, second?: number,
      millisecond?: number): number | DateTime {
    const date = this.toUTCLocalDate();
    if (day === void 0) {
      return date.getUTCDate();
    } else {
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
      return DateTime.fromUTCLocalDate(date, this._zone);
    }
  }

  hour(): number;
  hour(hour: number, minute?: number, second?: number, millisecond?: number): DateTime;
  hour(hour?: number, minute?: number, second?: number, millisecond?: number): number | DateTime {
    const date = this.toUTCLocalDate();
    if (hour === void 0) {
      return date.getUTCHours();
    } else {
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
      return DateTime.fromUTCLocalDate(date, this._zone);
    }
  }

  minute(): number;
  minute(minute: number, second?: number, millisecond?: number): DateTime;
  minute(minute?: number, second?: number, millisecond?: number): number | DateTime {
    const date = this.toUTCLocalDate();
    if (minute === void 0) {
      return date.getUTCMinutes();
    } else {
      date.setUTCMinutes(minute);
      if (second !== void 0) {
        date.setUTCSeconds(second);
      }
      if (millisecond !== void 0) {
        date.setUTCMilliseconds(millisecond);
      }
      return DateTime.fromUTCLocalDate(date, this._zone);
    }
  }

  second(): number;
  second(second: number, millisecond?: number): DateTime;
  second(second?: number, millisecond?: number): number | DateTime {
    const date = this.toUTCLocalDate();
    if (second === void 0) {
      return date.getUTCSeconds();
    } else {
      date.setUTCSeconds(second);
      if (millisecond !== void 0) {
        date.setUTCMilliseconds(millisecond);
      }
      return DateTime.fromUTCLocalDate(date, this._zone);
    }
  }

  millisecond(): number;
  millisecond(millisecond: number): DateTime;
  millisecond(millisecond?: number): number | DateTime {
    const date = this.toUTCLocalDate();
    if (millisecond === void 0) {
      return date.getUTCMilliseconds();
    } else {
      date.setUTCMilliseconds(millisecond);
      return DateTime.fromUTCLocalDate(date, this._zone);
    }
  }

  weekday(): number {
    return this.toUTCLocalDate().getUTCDay();
  }

  /**
   * Returns this date time shifted by the time zone offset.
   * @hidden
   */
  toUTCLocalDate(): Date {
    return new Date(this._time + 60000 * this._zone._offset);
  }

  toDate(): Date {
    return new Date(this._time);
  }

  valueOf(): number {
    return this._time;
  }

  compareTo(that: AnyDateTime): number {
    const x = this._time;
    const y = DateTime.time(that);
    return x < y ? -1 : x > y ? 1 : x === y ? 0 : NaN;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof DateTime) {
      return this._time === that._time && this._zone.equals(that._zone);
    }
    return false;
  }

  hashCode(): number {
    if (DateTime._hashSeed === void 0) {
      DateTime._hashSeed = Murmur3.seed(DateTime);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(DateTime._hashSeed,
        Murmur3.hash(this._time)), this._zone.hashCode()));
  }

  display(output: Output, format: DateTimeFormat = DateTime.Format.iso8601()): void {
    format.writeDate(this, output);
  }

  toString(format: DateTimeFormat = DateTime.Format.iso8601()): string {
    return format.format(this);
  }

  private static _hashSeed?: number;

  static current(zone?: AnyTimeZone): DateTime {
    zone = zone !== void 0 ? TimeZone.fromAny(zone) : TimeZone.local();
    return new DateTime(Date.now(), zone);
  }

  /**
   * Returns this date time shifted back by the time zone offset.
   * @hidden
   */
  static fromUTCLocalDate(date: Date, zone: TimeZone): DateTime {
    return new DateTime(date.getTime() - 60000 * zone._offset, zone);
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
      time += 60000 * zone._offset;
    } else {
      zone = TimeZone.utc();
    }
    return new DateTime(time, zone);
  }

  static fromAny(date: AnyDateTime, zone?: AnyTimeZone): DateTime {
    if (date instanceof DateTime) {
      return date;
    } else if (date instanceof Date) {
      zone = zone !== void 0 ? TimeZone.fromAny(zone) : TimeZone.utc();
      return new DateTime(date.getTime(), zone);
    } else if (typeof date === "number") {
      zone = zone !== void 0 ? TimeZone.fromAny(zone) : TimeZone.utc();
      return new DateTime(date, zone);
    } else if (typeof date === "string") {
      return DateTime.parse(date, zone);
    } else if (DateTime.isInit(date)) {
      return DateTime.fromInit(date, zone);
    }
    throw new TypeError("" + date);
  }

  static fromValue(value: Value): DateTime | undefined {
    let positional: boolean;
    const header = value.header("date");
    if (header.isDefined()) {
      value = header;
      positional = true;
    } else {
      positional = false;
    }
    const init = {} as DateTimeInit;
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
    return void 0;
  }

  static parse(date: string, zone?: AnyTimeZone): DateTime {
    return DateTime.Format.iso8601().parse(date);
  }

  static time(date: AnyDateTime): number {
    if (date instanceof DateTime) {
      return date._time;
    } else if (date instanceof Date) {
      return date.getTime();
    } else if (typeof date === "number") {
      return date;
    } else if (typeof date === "string") {
      return DateTime.parse(date).time();
    } else if (DateTime.isInit(date)) {
      return DateTime.fromInit(date).time();
    }
    throw new TypeError("" + date);
  }

  static zone(date: AnyDateTime): TimeZone {
    if (date instanceof DateTime) {
      return date._zone;
    } else {
      return TimeZone.utc();
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

  private static _form: Form<DateTime, AnyDateTime>;
  static form(unit?: AnyDateTime): Form<DateTime, AnyDateTime> {
    if (unit !== void 0) {
      unit = DateTime.fromAny(unit);
    }
    if (unit !== void 0) {
      return new DateTime.Form(unit);
    } else {
      if (DateTime._form === void 0) {
        DateTime._form = new DateTime.Form();
      }
      return DateTime._form;
    }
  }

  // Forward type declarations
  /** @hidden */
  static Parser: typeof DateTimeParser; // defined by DateTimeParser
  /** @hidden */
  static Form: typeof DateTimeForm; // defined by DateTimeForm
  /** @hidden */
  static Format: typeof DateTimeFormat; // defined by DateTimeFormat
}
