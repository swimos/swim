// Copyright 2015-2022 Swim.inc
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
import {Input, Output, Parser, Diagnostic, Unicode, Base10} from "@swim/codec";
import {AnyDateTime, DateTimeInit, DateTime} from "../DateTime";
import {DateTimeParser} from "../DateTimeParser";
import {DateTimeLocale} from "./DateTimeLocale";
import {DateTimeSpecifiers} from "./DateTimeSpecifiers";
import {YearFormat} from "../"; // forward import
import {MonthOfYearFormat} from "../"; // forward import
import {MonthFormat} from "../"; // forward import
import {ShortMonthFormat} from "../"; // forward import
import {DayOfMonthFormat} from "../"; // forward import
import {WeekdayFormat} from "../"; // forward import
import {ShortWeekdayFormat} from "../"; // forward import
import {Hour24Format} from "../"; // forward import
import {Hour12Format} from "../"; // forward import
import {PeriodFormat} from "../"; // forward import
import {MinuteFormat} from "../"; // forward import
import {SecondFormat} from "../"; // forward import
import {MillisecondFormat} from "../"; // forward import
import {PatternFormat} from "../"; // forward import

/** @internal */
export interface DateNumberFactory {
  term(value: number, date: DateTimeInit, input: Input): Parser<DateTimeInit>;
  cont(date: DateTimeInit, value: number, step: number, input: Input): Parser<DateTimeInit>;
}

/** @internal */
export interface DateStringFactory {
  term(locale: DateTimeLocale, value: string, date: DateTimeInit, input: Input): Parser<DateTimeInit>;
  cont(locale: DateTimeLocale, date: DateTimeInit, output: Output, input: Input): Parser<DateTimeInit>;
}

/** @public */
export abstract class DateTimeFormat {
  withLocale(locale: DateTimeLocale): DateTimeFormat {
    return this;
  }

  format(date: AnyDateTime): string {
    date = DateTime.fromAny(date);
    let output = Unicode.stringOutput();
    output = this.writeDate(output, date as DateTime);
    return output.bind();
  }

  abstract writeDate<T>(output: Output<T>, date: DateTime): Output<T>;

  parse(input: Input | string): DateTime {
    if (typeof input === "string") {
      input = Unicode.stringInput(input);
    }
    while (input.isCont() && Unicode.isSpace(input.head())) {
      input = input.step();
    }
    let parser = this.parseDate(input, {});
    if (parser.isDone()) {
      while (input.isCont() && Unicode.isSpace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  /** @internal */
  parseDate(input: Input, date: DateTimeInit): Parser<DateTime> {
    const dateParser = this.parseDateTime(input, date);
    if (dateParser.isDone()) {
      return Parser.done(DateTime.fromAny(dateParser.bind()));
    } else if (dateParser.isError()) {
      return dateParser.asError();
    }
    return new DateTimeParser(dateParser);
  }

  /** @internal */
  abstract parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit>;

  /** @internal */
  static Year: DateTimeFormat | null = null;
  static year(): DateTimeFormat {
    let year = this.Year;
    if (year === null) {
      year = new YearFormat();
      this.Year = year;
    }
    return year;
  }

  /** @internal */
  static MonthOfYear: DateTimeFormat | null = null;
  static monthOfYear(): DateTimeFormat {
    let monthOfYear = this.MonthOfYear;
    if (monthOfYear === null) {
      monthOfYear = new MonthOfYearFormat();
      this.MonthOfYear = monthOfYear;
    }
    return monthOfYear;
  }

  /** @internal */
  static Month: DateTimeFormat | null = null;
  static month(locale?: DateTimeLocale): DateTimeFormat {
    let month: DateTimeFormat | null;
    if (locale === void 0 || locale === DateTimeLocale.standard()) {
      month = this.Month;
      if (month === null) {
        month = new MonthFormat(DateTimeLocale.standard());
        this.Month = month;
      }
    } else {
      month = new MonthFormat(locale);
    }
    return month;
  }

  /** @internal */
  static ShortMonth: DateTimeFormat | null = null;
  static shortMonth(locale?: DateTimeLocale): DateTimeFormat {
    let shortMonth: DateTimeFormat | null;
    if (locale === void 0 || locale === DateTimeLocale.standard()) {
      shortMonth = this.ShortMonth;
      if (shortMonth === null) {
        shortMonth = new ShortMonthFormat(DateTimeLocale.standard());
        this.ShortMonth = shortMonth;
      }
    } else {
      shortMonth = new ShortMonthFormat(locale);
    }
    return shortMonth;
  }

  /** @internal */
  static DayOfMonthZeroPadded: DateTimeFormat | null = null;
  /** @internal */
  static DayOfMonthSpacePadded: DateTimeFormat | null = null;
  static dayOfMonth(padChar?: number): DateTimeFormat {
    let dayOfMonth: DateTimeFormat | null;
    if (padChar === void 0 || padChar === 48/*'0'*/) {
      dayOfMonth = this.DayOfMonthZeroPadded;
      if (dayOfMonth === null) {
        dayOfMonth = new DayOfMonthFormat(48/*'0'*/);
        this.DayOfMonthZeroPadded = dayOfMonth;
      }
    } else if (padChar === 32/*' '*/) {
      dayOfMonth = this.DayOfMonthSpacePadded;
      if (dayOfMonth === null) {
        dayOfMonth = new DayOfMonthFormat(32/*' '*/);
        this.DayOfMonthSpacePadded = dayOfMonth;
      }
    } else {
      dayOfMonth = new DayOfMonthFormat(padChar);
    }
    return dayOfMonth;
  }

  /** @internal */
  static Weekday: DateTimeFormat | null = null;
  static weekday(locale?: DateTimeLocale): DateTimeFormat {
    let weekday: DateTimeFormat | null;
    if (locale === void 0 || locale === DateTimeLocale.standard()) {
      weekday = this.Weekday;
      if (weekday === null) {
        weekday = new WeekdayFormat(DateTimeLocale.standard());
        this.Weekday = weekday;
      }
    } else {
      weekday = new WeekdayFormat(locale);
    }
    return weekday;
  }

  /** @internal */
  static ShortWeekday: DateTimeFormat | null = null;
  static shortWeekday(locale?: DateTimeLocale): DateTimeFormat {
    let shortWeekday: DateTimeFormat | null;
    if (locale === void 0 || locale === DateTimeLocale.standard()) {
      shortWeekday = this.ShortWeekday;
      if (shortWeekday === null) {
        shortWeekday = new ShortWeekdayFormat(DateTimeLocale.standard());
        this.ShortWeekday = shortWeekday;
      }
    } else {
      shortWeekday = new ShortWeekdayFormat(locale);
    }
    return shortWeekday;
  }

  /** @internal */
  static Hour24: DateTimeFormat | null = null;
  static hour24(): DateTimeFormat {
    let hour24 = this.Hour24;
    if (hour24 === null) {
      hour24 = new Hour24Format();
      this.Hour24 = hour24;
    }
    return hour24;
  }

  /** @internal */
  static Hour12ZeroPadded: DateTimeFormat | null = null;
  /** @internal */
  static Hour12SpacePadded: DateTimeFormat | null = null;
  static hour12(padChar?: number): DateTimeFormat {
    let hour12: DateTimeFormat | null;
    if (padChar === void 0 || padChar === 48/*'0'*/) {
      hour12 = this.Hour12ZeroPadded;
      if (hour12 === null) {
        hour12 = new Hour12Format(48/*'0'*/);
        this.Hour12ZeroPadded = hour12;
      }
    } else if (padChar === 32/*' '*/) {
      hour12 = this.Hour12SpacePadded;
      if (hour12 === null) {
        hour12 = new Hour12Format(32/*' '*/);
        this.Hour12SpacePadded = hour12;
      }
    } else {
      hour12 = new Hour12Format(padChar);
    }
    return hour12;
  }

  /** @internal */
  static Period: DateTimeFormat | null = null;
  static period(locale?: DateTimeLocale): DateTimeFormat {
    let period: DateTimeFormat | null;
    if (locale === void 0 || locale === DateTimeLocale.standard()) {
      period = this.Period;
      if (period === null) {
        period = new PeriodFormat(DateTimeLocale.standard());
        this.Period = period;
      }
    } else {
      period = new PeriodFormat(locale);
    }
    return period;
  }

  /** @internal */
  static Minute: DateTimeFormat | null = null;
  static minute(): DateTimeFormat {
    let minute = this.Minute;
    if (minute === null) {
      minute = new MinuteFormat();
      this.Minute = minute;
    }
    return minute;
  }

  /** @internal */
  static Second: DateTimeFormat | null = null;
  static second(): DateTimeFormat {
    let second = this.Second;
    if (second === null) {
      second = new SecondFormat();
      this.Second = second;
    }
    return second;
  }

  /** @internal */
  static Millisecond: DateTimeFormat | null = null;
  static millisecond(): DateTimeFormat {
    let millisecond = this.Millisecond;
    if (millisecond === null) {
      millisecond = new MillisecondFormat();
      this.Millisecond = millisecond;
    }
    return millisecond;
  }

  static pattern(pattern: string, specifiers?: DateTimeSpecifiers | DateTimeLocale): DateTimeFormat {
    if (specifiers === void 0 || specifiers instanceof DateTimeLocale) {
      specifiers = DateTimeSpecifiers.standard(specifiers);
    }
    return new PatternFormat(pattern, specifiers);
  }

  @Lazy
  static get iso8601(): DateTimeFormat {
    return new PatternFormat("%Y-%m-%dT%H:%M:%S.%LZ", DateTimeSpecifiers.standard());
  }

  /** @internal */
  static parseDateNumber(input: Input, factory: DateNumberFactory, desc: string,
                         minDigits: number, maxDigits: number, date: DateTimeInit | undefined,
                         value: number = 0, step: number = 0): Parser<DateTimeInit> {
    let c = 0;
    while (step < maxDigits) {
      if (input.isCont() && (c = input.head(), Base10.isDigit(c))) {
        input.step();
        value = 10 * value + Base10.decodeDigit(c);
        step += 1;
        continue;
      }
      break;
    }
    if (!input.isEmpty()) {
      if (step >= minDigits) {
        return factory.term(value, date || {}, input);
      } else {
        return Parser.error(Diagnostic.expected(desc, input));
      }
    }
    return factory.cont(date !== void 0 ? date : {}, value, step, input);
  }

  /** @internal */
  static parseDateString(input: Input, factory: DateStringFactory, locale: DateTimeLocale,
                         date?: DateTimeInit, output?: Output<string>): Parser<DateTimeInit> {
    let c = 0;
    output = output !== void 0 ? output : Unicode.stringOutput();
    do {
      if (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
        input.step();
        output.write(c);
        continue;
      } else if (!input.isEmpty()) {
        return factory.term(locale, output.bind(), date !== void 0 ? date : {}, input);
      }
      break;
    } while (true);
    return factory.cont(locale, date !== void 0 ? date : {}, output, input);
  }

  /** @internal */
  static writeDateNumber2<T>(output: Output<T>, value: number, padChar?: number): Output<T> {
    if (padChar === void 0) {
      padChar = 48/*'0'*/;
    }
    const c1 = Math.floor(value % 10);
    value /= 10;
    const c0 = Math.floor(value % 10);
    output = output.write(c0 !== 0 ? 48/*'0'*/ + c0 : padChar);
    output = output.write(48/*'0'*/ + c1);
    return output;
  }

  /** @internal */
  static writeDateNumber3<T>(output: Output<T>, value: number, padChar?: number): Output<T> {
    if (padChar === void 0) {
      padChar = 48/*'0'*/;
    }
    const c2 = Math.floor(value % 10);
    value /= 10;
    const c1 = Math.floor(value % 10);
    value /= 10;
    const c0 = Math.floor(value % 10);
    output = output.write(c0 !== 0 ? 48/*'0'*/ + c0 : padChar);
    output = output.write(c1 !== 0 ? 48/*'0'*/ + c1 : padChar);
    output = output.write(48/*'0'*/ + c2);
    return output;
  }

  /** @internal */
  static writeDateNumber4<T>(output: Output<T>, value: number, padChar?: number): Output<T> {
    if (padChar === void 0) {
      padChar = 48/*'0'*/;
    }
    const c3 = Math.floor(value % 10);
    value /= 10;
    const c2 = Math.floor(value % 10);
    value /= 10;
    const c1 = Math.floor(value % 10);
    value /= 10;
    const c0 = Math.floor(value % 10);
    output = output.write(c0 !== 0 ? 48/*'0'*/ + c0 : padChar);
    output = output.write(c1 !== 0 ? 48/*'0'*/ + c1 : padChar);
    output = output.write(c2 !== 0 ? 48/*'0'*/ + c2 : padChar);
    output = output.write(48/*'0'*/ + c3);
    return output;
  }
}
