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

import type {Input, Output, Parser} from "@swim/codec";
import type {DateTimeInit, DateTime} from "../DateTime";
import {DateTimeFormat} from "./DateTimeFormat";
import {MillisecondParser} from "../"; // forward import

/** @hidden */
export class MillisecondFormat extends DateTimeFormat {
  writeDate(date: DateTime, output: Output): void {
    DateTimeFormat.writeDateNumber3(date.millisecond, output);
  }

  parseDateTime(input: Input, date: DateTimeInit): Parser<DateTimeInit> {
    return MillisecondParser.parse(input, date);
  }
}
