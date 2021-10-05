// Copyright 2015-2021 Swim Inc.
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

import {Input, Parser} from "@swim/codec";
import type {DateTimeInit} from "../DateTime";
import {DateTimeFormat} from "./DateTimeFormat";

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
