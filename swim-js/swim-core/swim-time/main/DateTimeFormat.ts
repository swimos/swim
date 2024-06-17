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

import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import {Unicode} from "@swim/codec";
import {Base10} from "@swim/codec";
import type {DateTimeLike} from "./DateTime";
import type {DateTimeInit} from "./DateTime";
import {DateTime} from "./DateTime";
import {DateTimeParser} from "./DateTime";
import {DateTimeLocale} from "./DateTimeLocale";
import {DateTimeSpecifiers} from "./DateTimeSpecifiers";

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

  format(date: DateTimeLike): string {
    date = DateTime.fromLike(date);
    let output = Unicode.stringOutput();
    output = this.writeDate(output, date);
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
      return Parser.done(DateTime.fromLike(dateParser.bind()));
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
    if (this.Year === null) {
      this.Year = new YearFormat();
    }
    return this.Year;
  }

  /** @internal */
  static MonthOfYear: DateTimeFormat | null = null;
  static monthOfYear(): DateTimeFormat {
    if (this.MonthOfYear === null) {
      this.MonthOfYear = new MonthOfYearFormat();
    }
    return this.MonthOfYear;
  }

  /** @internal */
  static Month: DateTimeFormat | null = null;
  static month(locale?: DateTimeLocale): DateTimeFormat {
    if (locale !== void 0 && locale !== DateTimeLocale.standard()) {
      return new MonthFormat(locale);
    } else if (this.Month === null) {
      this.Month = new MonthFormat(DateTimeLocale.standard());
    }
    return this.Month;
  }

  /** @internal */
  static ShortMonth: DateTimeFormat | null = null;
  static shortMonth(locale?: DateTimeLocale): DateTimeFormat {
    if (locale !== void 0 && locale !== DateTimeLocale.standard()) {
      return new ShortMonthFormat(locale);
    } else if (this.ShortMonth === null) {
      this.ShortMonth = new ShortMonthFormat(DateTimeLocale.standard());
    }
    return this.ShortMonth;
  }

  /** @internal */
  static DayOfMonthZeroPadded: DateTimeFormat | null = null;
  /** @internal */
  static DayOfMonthSpacePadded: DateTimeFormat | null = null;
  static dayOfMonth(padChar?: number): DateTimeFormat {
    if (padChar === void 0 || padChar === 48/*'0'*/) {
      if (this.DayOfMonthZeroPadded === null) {
        this.DayOfMonthZeroPadded = new DayOfMonthFormat(48/*'0'*/);
      }
      return this.DayOfMonthZeroPadded;
    } else if (padChar === 32/*' '*/) {
      if (this.DayOfMonthSpacePadded === null) {
        this.DayOfMonthSpacePadded = new DayOfMonthFormat(32/*' '*/);
      }
      return this.DayOfMonthSpacePadded;
    }
    return new DayOfMonthFormat(padChar);
  }

  /** @internal */
  static Weekday: DateTimeFormat | null = null;
  static weekday(locale?: DateTimeLocale): DateTimeFormat {
    if (locale !== void 0 && locale !== DateTimeLocale.standard()) {
      return new WeekdayFormat(locale);
    } else if (this.Weekday === null) {
      this.Weekday = new WeekdayFormat(DateTimeLocale.standard());
    }
    return this.Weekday;
  }

  /** @internal */
  static ShortWeekday: DateTimeFormat | null = null;
  static shortWeekday(locale?: DateTimeLocale): DateTimeFormat {
    if (locale !== void 0 && locale !== DateTimeLocale.standard()) {
      return new ShortWeekdayFormat(locale);
    } else if (this.ShortWeekday === null) {
      this.ShortWeekday = new ShortWeekdayFormat(DateTimeLocale.standard());
    }
    return this.ShortWeekday;
  }

  /** @internal */
  static Hour24: DateTimeFormat | null = null;
  static hour24(): DateTimeFormat {
    if (this.Hour24 === null) {
      this.Hour24 = new Hour24Format();
    }
    return this.Hour24;
  }

  /** @internal */
  static Hour12ZeroPadded: DateTimeFormat | null = null;
  /** @internal */
  static Hour12SpacePadded: DateTimeFormat | null = null;
  static hour12(padChar?: number): DateTimeFormat {
    if (padChar === void 0 || padChar === 48/*'0'*/) {
      if (this.Hour12ZeroPadded === null) {
        this.Hour12ZeroPadded = new Hour12Format(48/*'0'*/);
      }
      return this.Hour12ZeroPadded;
    } else if (padChar === 32/*' '*/) {
      if (this.Hour12SpacePadded === null) {
        this.Hour12SpacePadded = new Hour12Format(32/*' '*/);
      }
      return this.Hour12SpacePadded;
    }
    return new Hour12Format(padChar);
  }

  /** @internal */
  static Period: DateTimeFormat | null = null;
  static period(locale?: DateTimeLocale): DateTimeFormat {
    if (locale !== void 0 && locale !== DateTimeLocale.standard()) {
      return new PeriodFormat(locale);
    } else if (this.Period === null) {
      this.Period = new PeriodFormat(DateTimeLocale.standard());
    }
    return this.Period;
  }

  /** @internal */
  static Minute: DateTimeFormat | null = null;
  static minute(): DateTimeFormat {
    if (this.Minute === null) {
      this.Minute = new MinuteFormat();
    }
    return this.Minute;
  }

  /** @internal */
  static Second: DateTimeFormat | null = null;
  static second(): DateTimeFormat {
    if (this.Second === null) {
      this.Second = new SecondFormat();
    }
    return this.Second;
  }

  /** @internal */
  static Millisecond: DateTimeFormat | null = null;
  static millisecond(): DateTimeFormat {
    if (this.Millisecond === null) {
      this.Millisecond = new MillisecondFormat();
    }
    return this.Millisecond;
  }

  static pattern(pattern: string, specifiers?: DateTimeSpecifiers | DateTimeLocale): DateTimeFormat {
    if (specifiers === void 0 || specifiers instanceof DateTimeLocale) {
      specifiers = DateTimeSpecifiers.standard(specifiers);
    }
    return new PatternFormat(pattern, specifiers);
  }

  /** @internal */
  static Iso8601: DateTimeFormat | null = null;

  static iso8601(): DateTimeFormat {
    if (this.Iso8601 === null) {
      this.Iso8601 = new PatternFormat("%Y-%m-%dT%H:%M:%S.%LZ", DateTimeSpecifiers.standard());
    }
    return this.Iso8601;
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

/** @internal */
export class YearFormat extends DateTimeFormat {
  override writeDate<T>(output: Output<T>, date: DateTime): Output<T> {
    output = DateTimeFormat.writeDateNumber4(output, date.year);
    return output;
  }

  override parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return YearParser.parse(input, date);
  }
}

/** @internal */
export class MonthOfYearFormat extends DateTimeFormat {
  override writeDate<T>(output: Output<T>, date: DateTime): Output<T> {
    output = DateTimeFormat.writeDateNumber2(output, date.month + 1);
    return output;
  }

  override parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return MonthOfYearParser.parse(input, date);
  }
}

/** @internal */
export class MonthFormat extends DateTimeFormat {
  private readonly locale: DateTimeLocale;

  constructor(locale: DateTimeLocale) {
    super();
    this.locale = locale;
  }

  override withLocale(locale: DateTimeLocale): DateTimeFormat {
    if (locale === this.locale) {
      return this;
    }
    return new MonthFormat(locale);
  }

  override writeDate<T>(output: Output<T>, date: DateTime): Output<T> {
    output = output.write(this.locale.months[date.month]!);
    return output;
  }

  override parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return MonthParser.parse(input, this.locale, date);
  }
}

/** @internal */
export class ShortMonthFormat extends DateTimeFormat {
  private readonly locale: DateTimeLocale;

  constructor(locale: DateTimeLocale) {
    super();
    this.locale = locale;
  }

  override withLocale(locale: DateTimeLocale): DateTimeFormat {
    if (locale === this.locale) {
      return this;
    }
    return new ShortMonthFormat(locale);
  }

  override writeDate<T>(output: Output<T>, date: DateTime): Output<T> {
    output = output.write(this.locale.shortMonths[date.month]!);
    return output;
  }

  override parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return ShortMonthParser.parse(input, this.locale, date);
  }
}

/** @internal */
export class DayOfMonthFormat extends DateTimeFormat {
  constructor(padChar: number) {
    super();
    this.padChar = padChar;
  }

  readonly padChar: number;

  override writeDate<T>(output: Output<T>, date: DateTime): Output<T> {
    output = DateTimeFormat.writeDateNumber2(output, date.day, this.padChar);
    return output;
  }

  override parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return DayOfMonthParser.parse(input, date);
  }
}

/** @internal */
export class WeekdayFormat extends DateTimeFormat {
  private readonly locale: DateTimeLocale;

  constructor(locale: DateTimeLocale) {
    super();
    this.locale = locale;
  }

  override withLocale(locale: DateTimeLocale): DateTimeFormat {
    if (locale === this.locale) {
      return this;
    }
    return new WeekdayFormat(locale);
  }

  override writeDate<T>(output: Output<T>, date: DateTime): Output<T> {
    output = output.write(this.locale.weekdays[date.weekday]!);
    return output;
  }

  override parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return WeekdayParser.parse(input, this.locale, date);
  }
}

/** @internal */
export class ShortWeekdayFormat extends DateTimeFormat {
  private readonly locale: DateTimeLocale;

  constructor(locale: DateTimeLocale) {
    super();
    this.locale = locale;
  }

  override withLocale(locale: DateTimeLocale): DateTimeFormat {
    if (locale === this.locale) {
      return this;
    }
    return new ShortWeekdayFormat(locale);
  }

  override writeDate<T>(output: Output<T>, date: DateTime): Output<T> {
    output = output.write(this.locale.shortWeekdays[date.weekday]!);
    return output;
  }

  override parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return ShortWeekdayParser.parse(input, this.locale, date);
  }
}

/** @internal */
export class Hour24Format extends DateTimeFormat {
  override writeDate<T>(output: Output<T>, date: DateTime): Output<T> {
    output = DateTimeFormat.writeDateNumber2(output, date.hour);
    return output;
  }

  override parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return Hour24Parser.parse(input, date);
  }
}

/** @internal */
export class Hour12Format extends DateTimeFormat {
  constructor(padChar: number) {
    super();
    this.padChar = padChar;
  }

  readonly padChar: number;

  override writeDate<T>(output: Output<T>, date: DateTime): Output<T> {
    let hour = date.hour % 12;
    if (hour === 0) {
      hour = 12;
    }
    output = DateTimeFormat.writeDateNumber2(output, hour, this.padChar);
    return output;
  }

  override parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return Hour12Parser.parse(input, date);
  }
}

/** @internal */
export class PeriodFormat extends DateTimeFormat {
  private readonly locale: DateTimeLocale;

  constructor(locale: DateTimeLocale) {
    super();
    this.locale = locale;
  }

  override withLocale(locale: DateTimeLocale): DateTimeFormat {
    if (locale === this.locale) {
      return this;
    }
    return new PeriodFormat(locale);
  }

  override writeDate<T>(output: Output<T>, date: DateTime): Output<T> {
    output = output.write(this.locale.periods[date.hour >= 12 ? 1 : 0]!);
    return output;
  }

  override parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return PeriodParser.parse(input, this.locale, date);
  }
}

/** @internal */
export class MinuteFormat extends DateTimeFormat {
  override writeDate<T>(output: Output<T>, date: DateTime): Output<T> {
    output = DateTimeFormat.writeDateNumber2(output, date.minute);
    return output;
  }

  override parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return MinuteParser.parse(input, date);
  }
}

/** @internal */
export class SecondFormat extends DateTimeFormat {
  override writeDate<T>(output: Output<T>, date: DateTime): Output<T> {
    output = DateTimeFormat.writeDateNumber2(output, date.second);
    return output;
  }

  override parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return SecondParser.parse(input, date);
  }
}

/** @internal */
export class MillisecondFormat extends DateTimeFormat {
  override writeDate<T>(output: Output<T>, date: DateTime): Output<T> {
    output = DateTimeFormat.writeDateNumber3(output, date.millisecond);
    return output;
  }

  override parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return MillisecondParser.parse(input, date);
  }
}

/** @internal */
export class PatternFormat extends DateTimeFormat {
  private readonly pattern: string;
  private readonly specifiers: DateTimeSpecifiers;

  constructor(pattern: string, specifiers: DateTimeSpecifiers) {
    super();
    this.pattern = pattern;
    this.specifiers = specifiers;
  }

  override writeDate<T>(output: Output<T>, date: DateTime): Output<T> {
    const pattern = this.pattern;
    const specifiers = this.specifiers;
    let i = 0;
    let j = 0;
    while (j < pattern.length) {
      if (pattern.charCodeAt(j) !== 37/*'%'*/) {
        j += 1;
        continue;
      } else if (i !== j) {
        output = output.write(pattern.slice(i, j));
      }
      const s = pattern.charAt(j + 1);
      const f = specifiers[s];
      if (f !== void 0) {
        output = f.writeDate(output, date);
      }
      j += 2;
      i = j;
    }
    if (i !== j) {
      output = output.write(pattern.slice(i, j));
    }
    return output;
  }

  override parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return PatternParser.parse(input, this.pattern, this.specifiers, date);
  }
}

/** @internal */
export class YearParser extends Parser<DateTimeInit> {
  private readonly date: DateTimeInit | undefined;
  private readonly year: number | undefined;
  private readonly step: number | undefined;

  constructor(date?: DateTimeInit, year?: number, step?: number) {
    super();
    this.date = date;
    this.year = year;
    this.step = step;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return YearParser.parse(input, this.date, this.year, this.step);
  }

  static parse(input: Input, date?: DateTimeInit, year?: number, step?: number): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateNumber(input, YearParser, "full year", 4, 4, date, year, step);
  }

  static term(year: number, date: DateTimeInit): Parser<DateTimeInit> {
    date.year = year;
    return Parser.done(date);
  }

  static cont(date: DateTimeInit, year: number, step: number): Parser<DateTimeInit> {
    return new YearParser(date, year, step);
  }
}

/** @internal */
export class MonthOfYearParser extends Parser<DateTimeInit> {
  private readonly date: DateTimeInit | undefined;
  private readonly month: number | undefined;
  private readonly step: number | undefined;

  constructor(date?: DateTimeInit, month?: number, step?: number) {
    super();
    this.date = date;
    this.month = month;
    this.step = step;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return MonthOfYearParser.parse(input, this.date, this.month, this.step);
  }

  static parse(input: Input, date?: DateTimeInit, month?: number, step?: number): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateNumber(input, MonthOfYearParser, "month number", 2, 2, date, month, step);
  }

  static term(month: number, date: DateTimeInit): Parser<DateTimeInit> {
    date.month = month - 1;
    return Parser.done(date);
  }

  static cont(date: DateTimeInit, month: number, step: number): Parser<DateTimeInit> {
    return new MonthOfYearParser(date, month, step);
  }
}

/** @internal */
export class MonthParser extends Parser<DateTimeInit> {
  private readonly locale: DateTimeLocale;
  private readonly date: DateTimeInit | undefined;
  private readonly output: Output<string> | undefined;

  constructor(locale: DateTimeLocale, date?: DateTimeInit, output?: Output<string>) {
    super();
    this.locale = locale;
    this.date = date;
    this.output = output;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return MonthParser.parse(input, this.locale, this.date, this.output);
  }

  static parse(input: Input, locale: DateTimeLocale, date?: DateTimeInit,
               output?: Output<string>): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateString(input, MonthParser, locale, date, output);
  }

  static term(locale: DateTimeLocale, value: string, date: DateTimeInit, input: Input): Parser<DateTimeInit> {
    const month = locale.months.indexOf(value);
    if (month < 0) {
      return Parser.error(Diagnostic.message("expected month, but found " + value, input));
    }
    date.month = month;
    return Parser.done(date);
  }

  static cont(locale: DateTimeLocale, date: DateTimeInit, output: Output<string>): Parser<DateTimeInit> {
    return new MonthParser(locale, date, output);
  }
}

/** @internal */
export class ShortMonthParser extends Parser<DateTimeInit> {
  private readonly locale: DateTimeLocale;
  private readonly date: DateTimeInit | undefined;
  private readonly output: Output<string> | undefined;

  constructor(locale: DateTimeLocale, date?: DateTimeInit, output?: Output<string>) {
    super();
    this.locale = locale;
    this.date = date;
    this.output = output;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return ShortMonthParser.parse(input, this.locale, this.date, this.output);
  }

  static parse(input: Input, locale: DateTimeLocale, date?: DateTimeInit,
               output?: Output<string>): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateString(input, ShortMonthParser, locale, date, output);
  }

  static term(locale: DateTimeLocale, value: string, date: DateTimeInit, input: Input): Parser<DateTimeInit> {
    const month = locale.shortMonths.indexOf(value);
    if (month < 0) {
      return Parser.error(Diagnostic.message("expected short month, but found " + value, input));
    }
    date.month = month;
    return Parser.done(date);
  }

  static cont(locale: DateTimeLocale, date: DateTimeInit, output: Output<string>): Parser<DateTimeInit> {
    return new ShortMonthParser(locale, date, output);
  }
}

/** @internal */
export class DayOfMonthParser extends Parser<DateTimeInit> {
  private readonly date: DateTimeInit | undefined;
  private readonly day: number | undefined;
  private readonly step: number | undefined;

  constructor(date?: DateTimeInit, day?: number, step?: number) {
    super();
    this.date = date;
    this.day = day;
    this.step = step;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return DayOfMonthParser.parse(input, this.date, this.day, this.step);
  }

  static parse(input: Input, date?: DateTimeInit, day?: number, step?: number): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateNumber(input, DayOfMonthParser, "day of month", 2, 2, date, day, step);
  }

  static term(day: number, date: DateTimeInit): Parser<DateTimeInit> {
    date.day = day;
    return Parser.done(date);
  }

  static cont(date: DateTimeInit, month: number, step: number): Parser<DateTimeInit> {
    return new DayOfMonthParser(date, month, step);
  }
}

/** @internal */
export class WeekdayParser extends Parser<DateTimeInit> {
  private readonly locale: DateTimeLocale;
  private readonly date: DateTimeInit | undefined;
  private readonly output: Output<string> | undefined;

  constructor(locale: DateTimeLocale, date?: DateTimeInit, output?: Output<string>) {
    super();
    this.locale = locale;
    this.date = date;
    this.output = output;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return WeekdayParser.parse(input, this.locale, this.date, this.output);
  }

  static parse(input: Input, locale: DateTimeLocale, date?: DateTimeInit,
               output?: Output<string>): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateString(input, WeekdayParser, locale, date, output);
  }

  static term(locale: DateTimeLocale, value: string, date: DateTimeInit, input: Input): Parser<DateTimeInit> {
    const day = locale.weekdays.indexOf(value);
    if (day < 0) {
      return Parser.error(Diagnostic.message("expected weekday, but found " + value, input));
    }
    return Parser.done(date);
  }

  static cont(locale: DateTimeLocale, date: DateTimeInit, output: Output<string>): Parser<DateTimeInit> {
    return new WeekdayParser(locale, date, output);
  }
}

/** @internal */
export class ShortWeekdayParser extends Parser<DateTimeInit> {
  private readonly locale: DateTimeLocale;
  private readonly date: DateTimeInit | undefined;
  private readonly output: Output<string> | undefined;

  constructor(locale: DateTimeLocale, date?: DateTimeInit, output?: Output<string>) {
    super();
    this.locale = locale;
    this.date = date;
    this.output = output;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return ShortWeekdayParser.parse(input, this.locale, this.date, this.output);
  }

  static parse(input: Input, locale: DateTimeLocale, date?: DateTimeInit,
               output?: Output<string>): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateString(input, ShortWeekdayParser, locale, date, output);
  }

  static term(locale: DateTimeLocale, value: string, date: DateTimeInit, input: Input): Parser<DateTimeInit> {
    const day = locale.shortWeekdays.indexOf(value);
    if (day < 0) {
      return Parser.error(Diagnostic.message("expected short weekday, but found " + value, input));
    }
    return Parser.done(date);
  }

  static cont(locale: DateTimeLocale, date: DateTimeInit, output: Output<string>): Parser<DateTimeInit> {
    return new ShortWeekdayParser(locale, date, output);
  }
}

/** @internal */
export class Hour24Parser extends Parser<DateTimeInit> {
  private readonly date: DateTimeInit | undefined;
  private readonly hour: number | undefined;
  private readonly step: number | undefined;

  constructor(date?: DateTimeInit, hour?: number, step?: number) {
    super();
    this.date = date;
    this.hour = hour;
    this.step = step;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return Hour24Parser.parse(input, this.date, this.hour, this.step);
  }

  static parse(input: Input, date?: DateTimeInit, hour?: number, step?: number): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateNumber(input, Hour24Parser, "hour (24)", 2, 2, date, hour, step);
  }

  static term(hour: number, date: DateTimeInit): Parser<DateTimeInit> {
    date.hour = hour;
    return Parser.done(date);
  }

  static cont(date: DateTimeInit, hour: number, step: number): Parser<DateTimeInit> {
    return new Hour24Parser(date, hour, step);
  }
}

/** @internal */
export class Hour12Parser extends Parser<DateTimeInit> {
  private readonly date: DateTimeInit | undefined;
  private readonly hour: number | undefined;
  private readonly step: number | undefined;

  constructor(date?: DateTimeInit, hour?: number, step?: number) {
    super();
    this.date = date;
    this.hour = hour;
    this.step = step;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return Hour12Parser.parse(input, this.date, this.hour, this.step);
  }

  static parse(input: Input, date?: DateTimeInit, hour?: number, step?: number): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateNumber(input, Hour12Parser, "hour (12)", 2, 2, date, hour, step);
  }

  static term(hour: number, date: DateTimeInit): Parser<DateTimeInit> {
    date.hour = (date.hour !== void 0 ? date.hour : 0) + hour;
    return Parser.done(date);
  }

  static cont(date: DateTimeInit, hour: number, step: number): Parser<DateTimeInit> {
    return new Hour12Parser(date, hour, step);
  }
}

/** @internal */
export class PeriodParser extends Parser<DateTimeInit> {
  private readonly locale: DateTimeLocale;
  private readonly date: DateTimeInit | undefined;
  private readonly output: Output<string> | undefined;

  constructor(locale: DateTimeLocale, date?: DateTimeInit, output?: Output<string>) {
    super();
    this.locale = locale;
    this.date = date;
    this.output = output;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return PeriodParser.parse(input, this.locale, this.date, this.output);
  }

  static parse(input: Input, locale: DateTimeLocale, date?: DateTimeInit,
               output?: Output<string>): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateString(input, PeriodParser, locale, date, output);
  }

  static term(locale: DateTimeLocale, value: string, date: DateTimeInit, input: Input): Parser<DateTimeInit> {
    const period = locale.months.indexOf(value);
    if (period < 0) {
      return Parser.error(Diagnostic.message("expected period of day, but found " + value, input));
    }
    date.hour = (date.hour || 0) + 12 * period;
    return Parser.done(date);
  }

  static cont(locale: DateTimeLocale, date: DateTimeInit, output: Output<string>): Parser<DateTimeInit> {
    return new PeriodParser(locale, date, output);
  }
}

/** @internal */
export class MinuteParser extends Parser<DateTimeInit> {
  private readonly date: DateTimeInit | undefined;
  private readonly minute: number | undefined;
  private readonly step: number | undefined;

  constructor(date?: DateTimeInit, minute?: number, step?: number) {
    super();
    this.date = date;
    this.minute = minute;
    this.step = step;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return MinuteParser.parse(input, this.date, this.minute, this.step);
  }

  static parse(input: Input, date?: DateTimeInit, minute?: number, step?: number): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateNumber(input, MinuteParser, "minute", 2, 2, date, minute, step);
  }

  static term(minute: number, date: DateTimeInit): Parser<DateTimeInit> {
    date.minute = minute;
    return Parser.done(date);
  }

  static cont(date: DateTimeInit, minute: number, step: number): Parser<DateTimeInit> {
    return new MinuteParser(date, minute, step);
  }
}

/** @internal */
export class SecondParser extends Parser<DateTimeInit> {
  private readonly date: DateTimeInit | undefined;
  private readonly second: number | undefined;
  private readonly step: number | undefined;

  constructor(date?: DateTimeInit, second?: number, step?: number) {
    super();
    this.date = date;
    this.second = second;
    this.step = step;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return SecondParser.parse(input, this.date, this.second, this.step);
  }

  static parse(input: Input, date?: DateTimeInit, second?: number, step?: number): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateNumber(input, SecondParser, "second", 2, 2, date, second, step);
  }

  static term(second: number, date: DateTimeInit): Parser<DateTimeInit> {
    date.second = second;
    return Parser.done(date);
  }

  static cont(date: DateTimeInit, second: number, step: number): Parser<DateTimeInit> {
    return new SecondParser(date, second, step);
  }
}

/** @internal */
export class MillisecondParser extends Parser<DateTimeInit> {
  private readonly date: DateTimeInit | undefined;
  private readonly millisecond: number | undefined;
  private readonly step: number | undefined;

  constructor(date?: DateTimeInit, millisecond?: number, step?: number) {
    super();
    this.date = date;
    this.millisecond = millisecond;
    this.step = step;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return MillisecondParser.parse(input, this.date, this.millisecond, this.step);
  }

  static parse(input: Input, date?: DateTimeInit, millisecond?: number, step?: number): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateNumber(input, MillisecondParser, "millisecond", 1, 3, date, millisecond, step);
  }

  static term(millisecond: number, date: DateTimeInit): Parser<DateTimeInit> {
    date.millisecond = millisecond;
    return Parser.done(date);
  }

  static cont(date: DateTimeInit, millisecond: number, step: number): Parser<DateTimeInit> {
    return new MillisecondParser(date, millisecond, step);
  }
}

/** @internal */
export class PatternParser extends Parser<DateTimeInit> {
  private readonly pattern: string;
  private readonly specifiers: DateTimeSpecifiers;
  private readonly date: DateTimeInit | undefined;
  private readonly dateParser: Parser<DateTimeInit> | undefined;
  private readonly step: number | undefined;

  constructor(pattern: string, specifiers: DateTimeSpecifiers, date?: DateTimeInit,
              dateParser?: Parser<DateTimeInit>, step?: number) {
    super();
    this.pattern = pattern;
    this.specifiers = specifiers;
    this.date = date;
    this.dateParser = dateParser;
    this.step = step;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return PatternParser.parse(input, this.pattern, this.specifiers, this.date,
                                     this.dateParser, this.step);
  }

  static parse(input: Input, pattern: string, specifiers: DateTimeSpecifiers,
               date: DateTimeInit = {}, dateParser?: Parser<DateTimeInit>,
               step: number = 0): Parser<DateTimeInit> {
    let c = 0;
    const n = pattern.length;
    while (step < n) {
      const p = pattern.charCodeAt(step);
      if (p === 37/*'%'*/) {
        if (dateParser === void 0) {
          const s = pattern.charAt(step + 1);
          const format = specifiers[s];
          if (format !== void 0) {
            dateParser = format.parseDateTime(input, date);
          } else {
            return Parser.error(Diagnostic.message("unknown format specifier: " + s, input));
          }
        } else {
          dateParser = dateParser.feed(input);
        }
        if (dateParser.isDone()) {
          date = dateParser.bind();
          dateParser = void 0;
          step += 2;
          continue;
        } else if (dateParser.isError()) {
          return dateParser.asError();
        }
      } else if (input.isCont()) {
        c = input.head();
        if (c === p) {
          input.step();
          step += 1;
          continue;
        } else {
          return Parser.error(Diagnostic.expected(p, input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
      break;
    }
    if (step === n) {
      return Parser.done(date);
    }
    return new PatternParser(pattern, specifiers, date, dateParser, step);
  }
}
