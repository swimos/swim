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

import {Input, Parser} from "@swim/codec";
import type {DateTimeInit} from "../DateTime";
import {DateTimeFormat} from "./DateTimeFormat";

/** @hidden */
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

  feed(input: Input): Parser<DateTimeInit> {
    return MillisecondParser.parse(input, this.date, this.millisecond, this.step);
  }

  static parse(input: Input, date?: DateTimeInit, millisecond?: number, step?: number): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateNumber(input, MillisecondParser, "millisecond", 1, 3, date, millisecond, step);
  }

  static bind(millisecond: number, date: DateTimeInit): Parser<DateTimeInit> {
    date.millisecond = millisecond;
    return Parser.done(date);
  }

  static cont(date: DateTimeInit, millisecond: number, step: number): Parser<DateTimeInit> {
    return new MillisecondParser(date, millisecond, step);
  }
}
