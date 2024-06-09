// Copyright 2015-2024 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import type {Mutable} from "@swim/util";
import {Murmur3} from "@swim/util";
import {Lazy} from "@swim/util";
import type {HashCode} from "@swim/util";
import type {Equivalent} from "@swim/util";
import type {Compare} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import {Objects} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import type {Display} from "@swim/codec";
import type {Item} from "@swim/structure";
import {Value} from "@swim/structure";
import {Text} from "@swim/structure";
import {Form} from "@swim/structure";
import type {TimeZoneLike} from "./TimeZone";
import {TimeZone} from "./TimeZone";
import {DateTimeFormat} from "./"; // forward import

/** @public */
export type DateTimeLike = DateTime | DateTimeInit | Date | string | number;

/** @public */
export const DateTimeLike = {
  [Symbol.hasInstance](instance: unknown): instance is DateTimeLike {
    return instance instanceof DateTime
        || instance instanceof Date
        || DateTimeInit[Symbol.hasInstance](instance)
        || typeof instance === "string"
        || typeof instance === "number";
  },
};

/** @public */
export interface DateTimeInit {
  /** @internal */
  readonly typeid?: "DateTimeInit";
  time?: number,
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
  zone?: TimeZoneLike;
}

/** @public */
export const DateTimeInit = {
  [Symbol.hasInstance](instance: unknown): instance is DateTimeInit {
    return Objects.hasAnyKey<DateTimeInit>(instance, "time", "year", "month", "day", "hour", "minute", "second", "millisecond");
  },
};

/** @public */
export class DateTime implements Interpolate<DateTime>, HashCode, Equivalent, Compare, Display {
  constructor(time: number, zone: TimeZone = TimeZone.utc()) {
    this.time = time;
    this.zone = zone;
  }

  /** @internal */
  declare readonly typeid?: "DateTime";

  likeType?(like: DateTimeInit | Date | string | number): void;

  isDefined(): boolean {
    return isFinite(new Date(this.time).getTime());
  }

  readonly time: number;

  readonly zone: TimeZone;

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
   * @internal
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

  /** @override */
  interpolateTo(that: DateTime): Interpolator<DateTime>;
  interpolateTo(that: unknown): Interpolator<DateTime> | null;
  interpolateTo(that: unknown): Interpolator<DateTime> | null {
    if (that instanceof DateTime) {
      return DateTimeInterpolator(this, that);
    }
    return null;
  }

  /** @override */
  compareTo(that: unknown): number {
    if (that instanceof DateTime) {
      const x = this.time;
      const y = that.time;
      return x < y ? -1 : x > y ? 1 : x === y ? 0 : NaN;
    }
    return NaN;
  }

  /** @override */
  equivalentTo(that: DateTimeLike, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof DateTime) {
      return Numbers.equivalent(this.time, that.time, epsilon);
    }
    return false;
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof DateTime) {
      return this.time === that.time && this.zone.equals(that.zone);
    }
    return false;
  }

  /** @override */
  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(DateTime),
        Numbers.hash(this.time)), this.zone.hashCode()));
  }

  /** @override */
  display<T>(output: Output<T>, format: DateTimeFormat = DateTimeFormat.iso8601()): Output<T> {
    output = format.writeDate(output, this);
    return output;
  }

  /** @override */
  toString(format: DateTimeFormat = DateTimeFormat.iso8601()): string {
    return format.format(this);
  }

  static current(zone?: TimeZoneLike): DateTime {
    zone = zone !== void 0 ? TimeZone.fromLike(zone) : TimeZone.local();
    return new DateTime(Date.now(), zone);
  }

  /**
   * Returns this date time shifted back by the time zone offset.
   * @internal
   */
  static fromUTCLocalDate(date: Date, zone: TimeZone): DateTime {
    return new DateTime(date.getTime() - 60000 * zone.offset, zone);
  }

  static fromLike<T extends DateTimeLike | null | undefined>(value: T, zone?: TimeZoneLike): DateTime | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof DateTime) {
      return value as DateTime | Uninitable<T>;
    } else if (value instanceof Date) {
      zone = zone !== void 0 ? TimeZone.fromLike(zone) : TimeZone.utc();
      return new DateTime(value.getTime(), zone);
    } else if (typeof value === "number") {
      zone = zone !== void 0 ? TimeZone.fromLike(zone) : TimeZone.utc();
      return new DateTime(value, zone);
    } else if (typeof value === "string") {
      return DateTime.parse(value, zone);
    } else if (DateTimeInit[Symbol.hasInstance](value)) {
      return DateTime.fromInit(value, zone);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: DateTimeInit, zone?: TimeZoneLike): DateTime {
    let time = init.time;
    if (time === void 0) {
      time = Date.UTC(init.year !== void 0 ? init.year : 1970,
                      init.month !== void 0 ? init.month : 0,
                      init.day !== void 0 ? init.day : 1,
                      init.hour !== void 0 ? init.hour : 0,
                      init.minute !== void 0 ? init.minute : 0,
                      init.second !== void 0 ? init.second : 0,
                      init.millisecond !== void 0 ? init.millisecond : 0);
    }
    zone = TimeZone.fromLike(init.zone);
    if (zone === void 0) {
      zone = TimeZone.utc();
    } else {
      time += 60000 * zone.offset;
    }
    return new DateTime(time, zone);
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
    if (DateTimeInit[Symbol.hasInstance](init)) {
      return DateTime.fromInit(init);
    }
    return null;
  }

  static parse(date: string, zone?: TimeZoneLike): DateTime {
    return DateTimeFormat.iso8601().parse(date);
  }

  static time(date: DateTimeLike): number {
    if (date instanceof DateTime) {
      return date.time;
    } else if (date instanceof Date) {
      return date.getTime();
    } else if (typeof date === "number") {
      return date;
    } else if (typeof date === "string") {
      return DateTime.parse(date).time;
    } else if (DateTimeInit[Symbol.hasInstance](date)) {
      return DateTime.fromInit(date).time;
    }
    throw new TypeError("" + date);
  }

  static zone(date: DateTimeLike): TimeZone {
    if (date instanceof DateTime) {
      return date.zone;
    }
    return TimeZone.utc();
  }

  @Lazy
  static form(): Form<DateTime, DateTimeLike> {
    return new DateTimeForm(new DateTime(0));
  }
}

/** @internal */
export const DateTimeInterpolator = (function (_super: typeof Interpolator) {
  const DateTimeInterpolator = function (d0: DateTime, d1: DateTime): Interpolator<DateTime> {
    const interpolator = function (u: number): DateTime {
      const d0 = interpolator[0];
      const d1 = interpolator[1];
      return new DateTime(d0.time + u * (d1.time - d0.time), d1.zone);
    } as Interpolator<DateTime>;
    Object.setPrototypeOf(interpolator, DateTimeInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = d0;
    (interpolator as Mutable<typeof interpolator>)[1] = d1;
    return interpolator;
  } as {
    (d0: DateTime, d1: DateTime): Interpolator<DateTime>;

    /** @internal */
    prototype: Interpolator<DateTime>;
  };

  DateTimeInterpolator.prototype = Object.create(_super.prototype);
  DateTimeInterpolator.prototype.constructor = DateTimeInterpolator;

  return DateTimeInterpolator;
})(Interpolator);

/** @internal */
export class DateTimeForm extends Form<DateTime, DateTimeLike> {
  constructor(unit: DateTime | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly unit: DateTime | undefined;

  override withUnit(unit: DateTime | undefined): Form<DateTime, DateTimeLike> {
    if (unit === this.unit) {
      return this;
    }
    return new DateTimeForm(unit);
  }

  override mold(date: DateTimeLike): Item {
    date = DateTime.fromLike(date);
    return Text.from(date.toString());
  }

  override cast(value: Value): DateTime | undefined {
    let date: DateTime | null = null;
    try {
      date = DateTime.fromValue(value);
      if (date === void 0) {
        const millis = value.numberValue(void 0);
        if (millis !== void 0) {
          date = new DateTime(millis);
        } else {
          const string = value.stringValue(void 0);
          if (string !== void 0) {
            date = DateTime.parse(string);
          }
        }
      }
    } catch (e) {
      // swallow
    }
    return date !== null ? date : void 0;
  }
}

/** @internal */
export class DateTimeParser extends Parser<DateTime> {
  private readonly dateParser: Parser<DateTimeInit>;

  constructor(dateParser: Parser<DateTimeInit>) {
    super();
    this.dateParser = dateParser;
  }

  override feed(input: Input): Parser<DateTime> {
    return DateTimeParser.parse(input, this.dateParser);
  }

  static parse(input: Input, dateParser: Parser<DateTimeInit>): Parser<DateTime> {
    dateParser = dateParser.feed(input);
    if (dateParser.isDone()) {
      return Parser.done(DateTime.fromLike(dateParser.bind()));
    } else if (dateParser.isError()) {
      return dateParser.asError();
    }
    return new DateTimeParser(dateParser);
  }
}
