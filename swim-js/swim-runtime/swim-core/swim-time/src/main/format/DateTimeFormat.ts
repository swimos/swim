// Copyright 2015-2021 Swim.inc
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

  @Lazy
  static get year(): DateTimeFormat {
    return new YearFormat();
  }

  @Lazy
  static get monthOfYear(): DateTimeFormat {
    return new MonthOfYearFormat();
  }

  @Lazy
  static get month(): DateTimeFormat {
    return new MonthFormat(DateTimeLocale.standard());
  }

  @Lazy
  static get shortMonth(): DateTimeFormat {
    return new ShortMonthFormat(DateTimeLocale.standard());
  }

  @Lazy
  static get dayOfMonth(): DateTimeFormat {
    return new DayOfMonthFormat();
  }

  @Lazy
  static get weekday(): DateTimeFormat {
    return new WeekdayFormat(DateTimeLocale.standard());
  }

  @Lazy
  static get shortWeekday(): DateTimeFormat {
    return new ShortWeekdayFormat(DateTimeLocale.standard());
  }

  @Lazy
  static get hour24(): DateTimeFormat {
    return new Hour24Format();
  }

  @Lazy
  static get hour12(): DateTimeFormat {
    return new Hour12Format();
  }

  @Lazy
  static get period(): DateTimeFormat {
    return new PeriodFormat(DateTimeLocale.standard());
  }

  @Lazy
  static get minute(): DateTimeFormat {
    return new MinuteFormat();
  }

  @Lazy
  static get second(): DateTimeFormat {
    return new SecondFormat();
  }

  @Lazy
  static get millisecond(): DateTimeFormat {
    return new MillisecondFormat();
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
  static writeDateNumber2<T>(output: Output<T>, value: number): Output<T> {
    const c1 = 48/*'0'*/ + value % 10;
    value /= 10;
    const c0 = 48/*'0'*/ + value % 10;
    output = output.write(c0).write(c1);
    return output;
  }

  /** @internal */
  static writeDateNumber3<T>(output: Output<T>, value: number): Output<T> {
    const c2 = 48/*'0'*/ + value % 10;
    value /= 10;
    const c1 = 48/*'0'*/ + value % 10;
    value /= 10;
    const c0 = 48/*'0'*/ + value % 10;
    output = output.write(c0).write(c1).write(c2);
    return output;
  }

  /** @internal */
  static writeDateNumber4<T>(output: Output<T>, value: number): Output<T> {
    const c3 = 48/*'0'*/ + value % 10;
    value /= 10;
    const c2 = 48/*'0'*/ + value % 10;
    value /= 10;
    const c1 = 48/*'0'*/ + value % 10;
    value /= 10;
    const c0 = 48/*'0'*/ + value % 10;
    output = output.write(c0).write(c1).write(c2).write(c3);
    return output;
  }
}
