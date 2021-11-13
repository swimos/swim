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

import {Lazy} from "@swim/util";

export class DateTimeLocale {
  readonly periods: ReadonlyArray<string>;
  readonly weekdays: ReadonlyArray<string>;
  readonly shortWeekdays: ReadonlyArray<string>;
  readonly months: ReadonlyArray<string>;
  readonly shortMonths: ReadonlyArray<string>;

  constructor(periods: ReadonlyArray<string> = DateTimeLocale.Periods,
              weekdays: ReadonlyArray<string> = DateTimeLocale.Weekdays,
              shortWeekdays: ReadonlyArray<string> = DateTimeLocale.ShortWeekdays,
              months: ReadonlyArray<string> = DateTimeLocale.Months,
              shortMonths: ReadonlyArray<string> = DateTimeLocale.ShortMonths) {
    this.periods = periods;
    this.weekdays = weekdays;
    this.shortWeekdays = shortWeekdays;
    this.months = months;
    this.shortMonths = shortMonths;
  }

  @Lazy
  static standard(): DateTimeLocale {
    return new DateTimeLocale();
  }

  private static readonly Periods: ReadonlyArray<string> = [
    "AM",
    "PM",
  ];
  private static readonly Weekdays: ReadonlyArray<string> = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  private static readonly ShortWeekdays: ReadonlyArray<string> = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];
  private static readonly Months: ReadonlyArray<string> = [
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
  private static readonly ShortMonths: ReadonlyArray<string> = [
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
}
