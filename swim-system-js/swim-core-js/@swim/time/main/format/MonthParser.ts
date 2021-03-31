// Copyright 2015-2020 Swim inc.
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

import {Input, Output, Parser, Diagnostic} from "@swim/codec";
import type {DateTimeLocale} from "./DateTimeLocale";
import type {DateTimeInit} from "../DateTime";
import {DateTimeFormat} from "./DateTimeFormat";

/** @hidden */
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

  feed(input: Input): Parser<DateTimeInit> {
    return MonthParser.parse(input, this.locale, this.date, this.output);
  }

  static parse(input: Input, locale: DateTimeLocale, date?: DateTimeInit,
               output?: Output<string>): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateString(input, MonthParser, locale, date, output);
  }

  static bind(locale: DateTimeLocale, value: string, date: DateTimeInit, input: Input): Parser<DateTimeInit> {
    const month = locale.months.indexOf(value);
    if (month >= 0) {
      date.month = month;
      return Parser.done(date);
    } else {
      return Parser.error(Diagnostic.message("expected month, but found " + value, input));
    }
  }

  static cont(locale: DateTimeLocale, date: DateTimeInit, output: Output<string>): Parser<DateTimeInit> {
    return new MonthParser(locale, date, output);
  }
}
