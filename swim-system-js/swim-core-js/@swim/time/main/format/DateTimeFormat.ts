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

/** @hidden */
export interface DateNumberFactory {
  term(value: number, date: DateTimeInit, input: Input): Parser<DateTimeInit>;
  cont(date: DateTimeInit, value: number, step: number, input: Input): Parser<DateTimeInit>;
}

/** @hidden */
export interface DateStringFactory {
  term(locale: DateTimeLocale, value: string, date: DateTimeInit, input: Input): Parser<DateTimeInit>;
  cont(locale: DateTimeLocale, date: DateTimeInit, output: Output, input: Input): Parser<DateTimeInit>;
}

export abstract class DateTimeFormat {
  withLocale(locale: DateTimeLocale): DateTimeFormat {
    return this;
  }

  format(date: AnyDateTime): string {
    date = DateTime.fromAny(date);
    const output = Unicode.stringOutput();
    this.writeDate(date as DateTime, output);
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
    return new DateTimeParser(dateParser);
  }

  /** @hidden */
  abstract parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit>;

  @Lazy
  static get year(): YearFormat {
    return new YearFormat();
  }

  @Lazy
  static get monthOfYear(): MonthOfYearFormat {
    return new MonthOfYearFormat();
  }

  @Lazy
  static get month(): MonthFormat {
    return new MonthFormat(DateTimeLocale.standard());
  }

  @Lazy
  static get shortMonth(): ShortMonthFormat {
    return new ShortMonthFormat(DateTimeLocale.standard());
  }

  @Lazy
  static get dayOfMonth(): DayOfMonthFormat {
    return new DayOfMonthFormat();
  }

  @Lazy
  static get weekday(): WeekdayFormat {
    return new WeekdayFormat(DateTimeLocale.standard());
  }

  @Lazy
  static get shortWeekday(): ShortWeekdayFormat {
    return new ShortWeekdayFormat(DateTimeLocale.standard());
  }

  @Lazy
  static get hour24(): Hour24Format {
    return new Hour24Format();
  }

  @Lazy
  static get hour12(): Hour12Format {
    return new Hour12Format();
  }

  @Lazy
  static get period(): PeriodFormat {
    return new PeriodFormat(DateTimeLocale.standard());
  }

  @Lazy
  static get minute(): MinuteFormat {
    return new MinuteFormat();
  }

  @Lazy
  static get second(): SecondFormat {
    return new SecondFormat();
  }

  @Lazy
  static get millisecond(): YearFormat {
    return new MillisecondFormat();
  }

  static pattern(pattern: string, specifiers?: DateTimeSpecifiers | DateTimeLocale): PatternFormat {
    if (specifiers === void 0 || specifiers instanceof DateTimeLocale) {
      specifiers = DateTimeSpecifiers.standard(specifiers);
    }
    return new PatternFormat(pattern, specifiers);
  }

  @Lazy
  static get iso8601(): DateTimeFormat {
    return new PatternFormat("%Y-%m-%dT%H:%M:%S.%LZ", DateTimeSpecifiers.standard());
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
        return factory.term(value, date || {}, input);
      } else {
        return Parser.error(Diagnostic.expected(desc, input));
      }
    }
    return factory.cont(date !== void 0 ? date : {}, value, step, input);
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
        return factory.term(locale, output.bind(), date || {}, input);
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
}
