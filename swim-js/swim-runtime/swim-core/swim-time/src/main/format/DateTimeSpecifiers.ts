// Copyright 2015-2022 Swim.inc
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
import {DateTimeFormat} from "../"; // forward import

/** @public */
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

/** @public */
export const DateTimeSpecifiers = (function () {
  const DateTimeSpecifiers = {} as {
    standard(locale?: DateTimeLocale): DateTimeSpecifiers;
  };

  let standard: DateTimeSpecifiers | null = null;

  DateTimeSpecifiers.standard = function (locale?: DateTimeLocale): DateTimeSpecifiers {
    let specifiers: DateTimeSpecifiers | null = null;
    if (locale === void 0) {
      locale = DateTimeLocale.standard();
    }
    if (locale === DateTimeLocale.standard()) {
      specifiers = standard;
    }
    if (specifiers === null) {
      specifiers = {
        Y: DateTimeFormat.year,
        m: DateTimeFormat.monthOfYear,
        B: DateTimeFormat.month.withLocale(locale),
        b: DateTimeFormat.shortMonth.withLocale(locale),
        d: DateTimeFormat.dayOfMonth,
        A: DateTimeFormat.weekday.withLocale(locale),
        a: DateTimeFormat.shortWeekday.withLocale(locale),
        H: DateTimeFormat.hour24,
        I: DateTimeFormat.hour12,
        p: DateTimeFormat.period.withLocale(locale),
        M: DateTimeFormat.minute,
        S: DateTimeFormat.second,
        L: DateTimeFormat.millisecond,
      };
      if (locale === DateTimeLocale.standard()) {
        standard = specifiers;
      }
    }
    return specifiers;
  };

  return DateTimeSpecifiers;
})();
