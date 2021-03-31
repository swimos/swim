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
import {DateTimeInit, DateTime} from "./DateTime";

/** @hidden */
export class DateTimeParser extends Parser<DateTime> {
  private readonly dateParser: Parser<DateTimeInit>;

  constructor(dateParser: Parser<DateTimeInit>) {
    super();
    this.dateParser = dateParser;
  }

  feed(input: Input): Parser<DateTime> {
    return DateTimeParser.parse(input, this.dateParser);
  }

  static parse(input: Input, dateParser: Parser<DateTimeInit>): Parser<DateTime> {
    dateParser = dateParser.feed(input);
    if (dateParser.isDone()) {
      return Parser.done(DateTime.fromAny(dateParser.bind()));
    } else if (dateParser.isError()) {
      return dateParser.asError();
    }
    return new DateTimeParser(dateParser);
  }
}
