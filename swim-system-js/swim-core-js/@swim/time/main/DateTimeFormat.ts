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

import {Input, Output, Parser, Diagnostic, Unicode, Base10} from "@swim/codec";
import {DateTimeLocale} from "./DateTimeLocale";
import {AnyDateTime, DateTimeInit, DateTime} from "./DateTime";
import {DateTimeSpecifiers} from "./DateTimeSpecifiers";
import {YearFormat} from "./format/YearFormat";
import {MonthOfYearFormat} from "./format/MonthOfYearFormat";
import {MonthFormat} from "./format/MonthFormat";
import {ShortMonthFormat} from "./format/ShortMonthFormat";
import {DayOfMonthFormat} from "./format/DayOfMonthFormat";
import {WeekdayFormat} from "./format/WeekdayFormat";
import {ShortWeekdayFormat} from "./format/ShortWeekdayFormat";
import {Hour24Format} from "./format/Hour24Format";
import {Hour12Format} from "./format/Hour12Format";
import {PeriodFormat} from "./format/PeriodFormat";
import {MinuteFormat} from "./format/MinuteFormat";
import {SecondFormat} from "./format/SecondFormat";
import {MillisecondFormat} from "./format/MillisecondFormat";
import {PatternFormat} from "./format/PatternFormat";
import {YearParser} from "./format/YearParser";
import {MonthOfYearParser} from "./format/MonthOfYearParser";
import {MonthParser} from "./format/MonthParser";
import {ShortMonthParser} from "./format/ShortMonthParser";
import {DayOfMonthParser} from "./format/DayOfMonthParser";
import {WeekdayParser} from "./format/WeekdayParser";
import {ShortWeekdayParser} from "./format/ShortWeekdayParser";
import {Hour24Parser} from "./format/Hour24Parser";
import {Hour12Parser} from "./format/Hour12Parser";
import {PeriodParser} from "./format/PeriodParser";
import {MinuteParser} from "./format/MinuteParser";
import {SecondParser} from "./format/SecondParser";
import {MillisecondParser} from "./format/MillisecondParser";
import {PatternParser} from "./format/PatternParser";

/** @hidden */
export interface DateNumberFactory {
  bind(value: number, date: DateTimeInit, input: Input): Parser<DateTimeInit>;
  cont(date: DateTimeInit, value: number, step: number, input: Input): Parser<DateTimeInit>;
}

/** @hidden */
export interface DateStringFactory {
  bind(locale: DateTimeLocale, value: string, date: DateTimeInit, input: Input): Parser<DateTimeInit>;
  cont(locale: DateTimeLocale, date: DateTimeInit, output: Output, input: Input): Parser<DateTimeInit>;
}

export abstract class DateTimeFormat {
  format(date: AnyDateTime): string {
    date = DateTime.fromAny(date);
    const output = Unicode.stringOutput();
    this.writeDate(date, output);
    return output.bind();
  }

  abstract writeDate(date: DateTime, output: Output): void;

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

  /** @hidden */
  parseDate(input: Input, date: DateTimeInit): Parser<DateTime> {
    const dateParser = this.parseDateTime(input, date);
    if (dateParser.isDone()) {
      return Parser.done(DateTime.fromAny(dateParser.bind()));
    } else if (dateParser.isError()) {
      return dateParser.asError();
    }
    return new DateTime.Parser(dateParser);
  }

  /** @hidden */
  abstract parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit>;

  private static _year?: YearFormat;
  static year(): YearFormat {
    if (!DateTimeFormat._year) {
      DateTimeFormat._year = new DateTimeFormat.Year();
    }
    return DateTimeFormat._year;
  }

  private static _monthOfYear?: MonthOfYearFormat;
  static monthOfYear(): MonthOfYearFormat {
    if (!DateTimeFormat._monthOfYear) {
      DateTimeFormat._monthOfYear = new DateTimeFormat.MonthOfYear();
    }
    return DateTimeFormat._monthOfYear;
  }

  private static _month?: MonthFormat;
  static month(locale: DateTimeLocale = DateTimeLocale.standard()): MonthFormat {
    if (locale !== DateTimeLocale.standard()) {
      return new DateTimeFormat.Month(locale);
    } else {
      if (!DateTimeFormat._month) {
        DateTimeFormat._month = new DateTimeFormat.Month(locale);
      }
      return DateTimeFormat._month;
    }
  }

  private static _shortMonth?: ShortMonthFormat;
  static shortMonth(locale: DateTimeLocale = DateTimeLocale.standard()): ShortMonthFormat {
    if (locale !== DateTimeLocale.standard()) {
      return new DateTimeFormat.ShortMonth(locale);
    } else {
      if (!DateTimeFormat._shortMonth) {
        DateTimeFormat._shortMonth = new DateTimeFormat.ShortMonth(locale);
      }
      return DateTimeFormat._shortMonth;
    }
  }

  private static _dayOfMonth?: DayOfMonthFormat;
  static dayOfMonth(): DayOfMonthFormat {
    if (!DateTimeFormat._dayOfMonth) {
      DateTimeFormat._dayOfMonth = new DateTimeFormat.DayOfMonth();
    }
    return DateTimeFormat._dayOfMonth;
  }

  private static _weekday?: WeekdayFormat;
  static weekday(locale: DateTimeLocale = DateTimeLocale.standard()): WeekdayFormat {
    if (locale !== DateTimeLocale.standard()) {
      return new DateTimeFormat.Weekday(locale);
    } else {
      if (!DateTimeFormat._weekday) {
        DateTimeFormat._weekday = new DateTimeFormat.Weekday(locale);
      }
      return DateTimeFormat._weekday;
    }
  }

  private static _shortWeekday?: ShortWeekdayFormat;
  static shortWeekday(locale: DateTimeLocale = DateTimeLocale.standard()): ShortWeekdayFormat {
    if (locale !== DateTimeLocale.standard()) {
      return new DateTimeFormat.ShortWeekday(locale);
    } else {
      if (!DateTimeFormat._shortWeekday) {
        DateTimeFormat._shortWeekday = new DateTimeFormat.ShortWeekday(locale);
      }
      return DateTimeFormat._shortWeekday;
    }
  }

  private static _hour24?: Hour24Format;
  static hour24(): Hour24Format {
    if (!DateTimeFormat._hour24) {
      DateTimeFormat._hour24 = new DateTimeFormat.Hour24();
    }
    return DateTimeFormat._hour24;
  }

  private static _hour12?: Hour12Format;
  static hour12(): Hour12Format {
    if (!DateTimeFormat._hour12) {
      DateTimeFormat._hour12 = new DateTimeFormat.Hour12();
    }
    return DateTimeFormat._hour12;
  }

  private static _period?: PeriodFormat;
  static period(locale: DateTimeLocale = DateTimeLocale.standard()): PeriodFormat {
    if (locale !== DateTimeLocale.standard()) {
      return new DateTimeFormat.Period(locale);
    } else {
      if (!DateTimeFormat._period) {
        DateTimeFormat._period = new DateTimeFormat.Period(locale);
      }
      return DateTimeFormat._period;
    }
  }

  private static _minute?: MinuteFormat;
  static minute(): MinuteFormat {
    if (!DateTimeFormat._minute) {
      DateTimeFormat._minute = new DateTimeFormat.Minute();
    }
    return DateTimeFormat._minute;
  }

  private static _second?: SecondFormat;
  static second(): SecondFormat {
    if (!DateTimeFormat._second) {
      DateTimeFormat._second = new DateTimeFormat.Second();
    }
    return DateTimeFormat._second;
  }

  private static _millisecond?: YearFormat;
  static millisecond(): YearFormat {
    if (!DateTimeFormat._millisecond) {
      DateTimeFormat._millisecond = new DateTimeFormat.Millisecond();
    }
    return DateTimeFormat._millisecond;
  }

  static pattern(pattern: string, specifiers?: DateTimeSpecifiers | DateTimeLocale): PatternFormat {
    if (!specifiers || specifiers instanceof DateTimeLocale) {
      specifiers = DateTimeSpecifiers.standard(specifiers);
    }
    return new DateTimeFormat.Pattern(pattern, specifiers);
  }

  private static _iso8601?: DateTimeFormat;
  static iso8601(): DateTimeFormat {
    if (!DateTimeFormat._iso8601) {
      DateTimeFormat._iso8601 = new DateTimeFormat.Pattern("%Y-%m-%dT%H:%M:%S.%LZ", DateTimeSpecifiers.standard());
    }
    return DateTimeFormat._iso8601;
  }

  /** @hidden */
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
        return factory.bind(value, date || {}, input);
      } else {
        return Parser.error(Diagnostic.expected(desc, input));
      }
    }
    return factory.cont(date || {}, value, step, input);
  }

  /** @hidden */
  static parseDateString(input: Input, factory: DateStringFactory, locale: DateTimeLocale,
                         date?: DateTimeInit, output?: Output<string>): Parser<DateTimeInit> {
    let c = 0;
    output = output || Unicode.stringOutput();
    do {
      if (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
        input.step();
        output.write(c);
        continue;
      } else if (!input.isEmpty()) {
        return factory.bind(locale, output.bind(), date || {}, input);
      }
      break;
    } while (true);
    return factory.cont(locale, date || {}, output, input);
  }

  /** @hidden */
  static writeDateNumber2(value: number, output: Output): void {
    const c1 = 48/*'0'*/ + value % 10;
    value /= 10;
    const c0 = 48/*'0'*/ + value % 10;
    output = output.write(c0).write(c1);
  }

  /** @hidden */
  static writeDateNumber3(value: number, output: Output): void {
    const c2 = 48/*'0'*/ + value % 10;
    value /= 10;
    const c1 = 48/*'0'*/ + value % 10;
    value /= 10;
    const c0 = 48/*'0'*/ + value % 10;
    output = output.write(c0).write(c1).write(c2);
  }

  /** @hidden */
  static writeDateNumber4(value: number, output: Output): void {
    const c3 = 48/*'0'*/ + value % 10;
    value /= 10;
    const c2 = 48/*'0'*/ + value % 10;
    value /= 10;
    const c1 = 48/*'0'*/ + value % 10;
    value /= 10;
    const c0 = 48/*'0'*/ + value % 10;
    output = output.write(c0).write(c1).write(c2).write(c3);
  }

  // Forward type declarations
  /** @hidden */
  static Year: typeof YearFormat; // defined by YearFormat
  /** @hidden */
  static MonthOfYear: typeof MonthOfYearFormat; // defined by MonthOfYearFormat
  /** @hidden */
  static Month: typeof MonthFormat; // defined by MonthFormat
  /** @hidden */
  static ShortMonth: typeof ShortMonthFormat; // defined by ShortMonthFormat
  /** @hidden */
  static DayOfMonth: typeof DayOfMonthFormat; // defined by DayOfMonthFormat
  /** @hidden */
  static Weekday: typeof WeekdayFormat; // defined by WeekdayFormat
  /** @hidden */
  static ShortWeekday: typeof ShortWeekdayFormat; // defined by ShortWeekdayFormat
  /** @hidden */
  static Hour24: typeof Hour24Format; // defined by Hour24Format
  /** @hidden */
  static Hour12: typeof Hour12Format; // defined by Hour12Format
  /** @hidden */
  static Period: typeof PeriodFormat; // defined by PeriodFormat
  /** @hidden */
  static Minute: typeof MinuteFormat; // defined by MinuteFormat
  /** @hidden */
  static Second: typeof SecondFormat; // defined by SecondFormat
  /** @hidden */
  static Millisecond: typeof MillisecondFormat; // defined by MillisecondFormat
  /** @hidden */
  static Pattern: typeof PatternFormat; // defined by PatternFormat
  /** @hidden */
  static YearParser: typeof YearParser; // defined by YearParser
  /** @hidden */
  static MonthOfYearParser: typeof MonthOfYearParser; // defined by MonthOfYearParser
  /** @hidden */
  static MonthParser: typeof MonthParser; // defined by MonthParser
  /** @hidden */
  static ShortMonthParser: typeof ShortMonthParser; // defined by ShortMonthParser
  /** @hidden */
  static DayOfMonthParser: typeof DayOfMonthParser; // defined by DayOfMonthParser
  /** @hidden */
  static WeekdayParser: typeof WeekdayParser; // defined by WeekdayParser
  /** @hidden */
  static ShortWeekdayParser: typeof ShortWeekdayParser; // defined by ShortWeekdayParser
  /** @hidden */
  static Hour24Parser: typeof Hour24Parser; // defined by Hour24Parser
  /** @hidden */
  static Hour12Parser: typeof Hour12Parser; // defined by Hour12Parser
  /** @hidden */
  static PeriodParser: typeof PeriodParser; // defined by PeriodParser
  /** @hidden */
  static MinuteParser: typeof MinuteParser; // defined by MinuteParser
  /** @hidden */
  static SecondParser: typeof SecondParser; // defined by SecondParser
  /** @hidden */
  static MillisecondParser: typeof MillisecondParser; // defined by MillisecondParser
  /** @hidden */
  static PatternParser: typeof PatternParser; // defined by PatternParser
}
DateTime.Format = DateTimeFormat;
