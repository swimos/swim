// Copyright 2015-2023 Nstream, inc.
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

/** @public */
export class DateTimeLocale {
  readonly periods: readonly string[];
  readonly weekdays: readonly string[];
  readonly shortWeekdays: readonly string[];
  readonly months: readonly string[];
  readonly shortMonths: readonly string[];

  constructor(periods: readonly string[] = DateTimeLocale.Periods,
              weekdays: readonly string[] = DateTimeLocale.Weekdays,
              shortWeekdays: readonly string[] = DateTimeLocale.ShortWeekdays,
              months: readonly string[] = DateTimeLocale.Months,
              shortMonths: readonly string[] = DateTimeLocale.ShortMonths) {
    this.periods = periods;
    this.weekdays = weekdays;
    this.shortWeekdays = shortWeekdays;
    this.months = months;
    this.shortMonths = shortMonths;
  }

  /** @internal */
  static readonly Periods: readonly string[] = [
    "AM",
    "PM",
  ];

  /** @internal */
  static readonly Weekdays: readonly string[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  /** @internal */
  static readonly ShortWeekdays: readonly string[] = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  /** @internal */
  static readonly Months: readonly string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  /** @internal */
  static readonly ShortMonths: readonly string[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  @Lazy
  static standard(): DateTimeLocale {
    return new DateTimeLocale();
  }
}
