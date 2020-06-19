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

import {Input, Output, Parser} from "@swim/codec";
import {DateTimeInit, DateTime} from "../DateTime";
import {DateTimeFormat} from "../DateTimeFormat";

/** @hidden */
export class Hour12Format extends DateTimeFormat {
  writeDate(date: DateTime, output: Output): void {
    DateTimeFormat.writeDateNumber2(date.hour() % 12 || 12, output);
  }

  parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return DateTimeFormat.Hour12Parser.parse(input, date);
  }
}
DateTimeFormat.Hour12 = Hour12Format;
