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

import {DateTimeLocale} from "./DateTimeLocale";
import {DateTimeFormat} from "./DateTimeFormat";

export interface DateTimeSpecifiers {
  [symbol: string]: DateTimeFormat | undefined;
  Y: DateTimeFormat;
  m: DateTimeFormat;
  B: DateTimeFormat;
  b: DateTimeFormat;
  d: DateTimeFormat;
  A: DateTimeFormat;
  a: DateTimeFormat;
  H: DateTimeFormat;
  I: DateTimeFormat;
  p: DateTimeFormat;
  M: DateTimeFormat;
  S: DateTimeFormat;
  L: DateTimeFormat;
}

export const DateTimeSpecifiers = {
  /** @hidden */
  _standard: void 0 as DateTimeSpecifiers | undefined,
  standard(locale: DateTimeLocale = DateTimeLocale.standard()): DateTimeSpecifiers {
    let specifiers: DateTimeSpecifiers | undefined;
    if (locale === DateTimeLocale.standard()) {
      specifiers = DateTimeSpecifiers._standard;
    }
    if (specifiers === void 0) {
      specifiers = {
        Y: DateTimeFormat.year(),
        m: DateTimeFormat.monthOfYear(),
        B: DateTimeFormat.month(locale),
        b: DateTimeFormat.shortMonth(locale),
        d: DateTimeFormat.dayOfMonth(),
        A: DateTimeFormat.weekday(locale),
        a: DateTimeFormat.shortWeekday(locale),
        H: DateTimeFormat.hour24(),
        I: DateTimeFormat.hour12(),
        p: DateTimeFormat.period(locale),
        M: DateTimeFormat.minute(),
        S: DateTimeFormat.second(),
        L: DateTimeFormat.millisecond(),
      };
      if (locale === DateTimeLocale.standard()) {
        DateTimeSpecifiers._standard = specifiers;
      }
    }
    return specifiers;
  },
};
