// Copyright 2015-2020 SWIM.AI inc.
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

import {Spec, Test, Exam} from "@swim/unit";
import {DateTime, TimeInterval} from "@swim/time";

export class TimeIntervalSpec extends Spec {
  @Test
  testRoundYearFloor(exam: Exam): void {
    exam.equal(TimeInterval.year().floor(DateTime.from({year: 2018})).toString(), "2018-01-01T00:00:00.000Z");
  }

  @Test
  testRoundYearCeil(exam: Exam): void {
    exam.equal(TimeInterval.year().ceil(DateTime.from({year: 2018})).toString(), "2018-01-01T00:00:00.000Z");
  }

  @Test
  testRoundMonthYearCeil(exam: Exam): void {
    exam.equal(TimeInterval.year().ceil(DateTime.from({year: 2018, month: 0, day: 2})).toString(), "2019-01-01T00:00:00.000Z");
  }

  @Test
  testRoundMonthFloor(exam: Exam): void {
    exam.equal(TimeInterval.month().floor(DateTime.from({year: 2018, month: 8})).toString(), "2018-09-01T00:00:00.000Z");
  }

  @Test
  testRoundMonthCeil(exam: Exam): void {
    exam.equal(TimeInterval.month().ceil(DateTime.from({year: 2018, month: 8, day: 2})).toString(), "2018-10-01T00:00:00.000Z");
    // ceil() fail with round month()
  }

  @Test
  testRoundDayFloor(exam: Exam): void {
    exam.equal(TimeInterval.day().floor(DateTime.from({year: 2018, month: 8, day: 15})).toString(), "2018-09-15T00:00:00.000Z");
  }

  @Test
  testRoundDayCeil(exam: Exam): void {
    exam.equal(TimeInterval.day().ceil(DateTime.from({year: 2018, month: 8, day: 15, hour: 1})).toString(), "2018-09-16T00:00:00.000Z");
  }

  @Test
  testYearFloor(exam: Exam): void {
    exam.equal(TimeInterval.year().floor(DateTime.from({year: 2018, month: 5, day: 30})).toString(), "2018-01-01T00:00:00.000Z");
  }

  @Test
  testYearCeil(exam: Exam): void {
    exam.equal(TimeInterval.year().ceil(DateTime.from({year: 2018, month: 5, day: 30})).toString(), "2019-01-01T00:00:00.000Z");
  }

  @Test
  testMonthFloorHalf(exam: Exam): void {
    exam.equal(TimeInterval.month().floor(DateTime.from({year: 2018, month: 5, day: 15})).toString(), "2018-06-01T00:00:00.000Z");
  }

  @Test
  testMonthFloor(exam: Exam): void {
    exam.equal(TimeInterval.month().floor(DateTime.from({year: 2018, month: 5, day: 30})).toString(), "2018-06-01T00:00:00.000Z");
  }

  @Test
  testMonthCeil(exam: Exam): void {
    exam.equal(TimeInterval.month().ceil(DateTime.from({year: 2018, month: 5, day: 30})).toString(), "2018-07-01T00:00:00.000Z");
  }

  @Test
  testWeekFloor(exam: Exam): void {
    exam.equal(TimeInterval.week().floor(DateTime.from({year: 2018, month: 6, day: 16})).toString(), "2018-07-15T00:00:00.000Z");
  }

  @Test
  testWeekCeil(exam: Exam): void {
    exam.equal(TimeInterval.week().ceil(DateTime.from({year: 2018, month: 6, day: 16})).toString(), "2018-07-22T00:00:00.000Z");
  }

  @Test
  testSecondWeekCeil(exam: Exam): void {
    exam.equal(TimeInterval.week().ceil(DateTime.from({year: 2018, month: 4, day: 10})).toString(), "2018-05-13T00:00:00.000Z");
  }

  @Test
  testDayFloor(exam: Exam): void {
    exam.equal(TimeInterval.day().floor(DateTime.from({year: 2018, month: 5, day: 15, hour: 5, minute: 16, second: 10})).toString(), "2018-06-15T00:00:00.000Z");
  }

  @Test
  testDayCeil(exam: Exam): void {
    exam.equal(TimeInterval.day().ceil(DateTime.from({year: 2018, month: 5, day: 15, hour: 5, minute: 16, second: 10})).toString(), "2018-06-16T00:00:00.000Z");
  }

  @Test
  testHourFloor(exam: Exam): void {
    exam.equal(TimeInterval.hour().floor(DateTime.from({year: 2018, month: 5, day: 15, hour: 5, minute: 16, second: 10})).toString(), "2018-06-15T05:00:00.000Z");
  }

  @Test
  testHourCeil(exam: Exam): void {
    exam.equal(TimeInterval.hour().ceil(DateTime.from({year: 2018, month: 5, day: 15, hour: 5, minute: 16, second: 10})).toString(), "2018-06-15T06:00:00.000Z");
  }

  @Test
  testMinuteFloor(exam: Exam): void {
    exam.equal(TimeInterval.minute().floor(DateTime.from({year: 2018, month: 5, day: 15, hour: 5, minute: 16, second: 10})).toString(), "2018-06-15T05:16:00.000Z");
  }

  @Test
  testMinuteCeil(exam: Exam): void {
    exam.equal(TimeInterval.minute().ceil(DateTime.from({year: 2018, month: 5, day: 15, hour: 5, minute: 16, second: 10})).toString(), "2018-06-15T05:17:00.000Z");
  }

  @Test
  testSecondFloor(exam: Exam): void {
    exam.equal(TimeInterval.minute().floor(DateTime.from({year: 2018, month: 5, day: 15, hour: 5, minute: 16, second: 10, millisecond: 500})).toString(), "2018-06-15T05:16:00.000Z");
  }

  @Test
  testSecondCeil(exam: Exam): void {
    exam.equal(TimeInterval.minute().ceil(DateTime.from({year: 2018, month: 5, day: 15, hour: 5, minute: 16, second: 10, millisecond: 500})).toString(), "2018-06-15T05:17:00.000Z");
  }

  @Test
  testYears(exam: Exam): void {
    exam.equal(TimeInterval.years(DateTime.from({year: 2011}), DateTime.from({year: 2014})), [
      DateTime.parse("2011-01-01T00:00:00.000Z"),
      DateTime.parse("2012-01-01T00:00:00.000Z"),
      DateTime.parse("2013-01-01T00:00:00.000Z"),
    ]);
  }

  @Test
  testMonths(exam: Exam): void {
    exam.equal(TimeInterval.months(DateTime.from({year: 2011}), DateTime.from({year: 2012})), [
      DateTime.parse("2011-01-01T00:00:00.000Z"),
      DateTime.parse("2011-02-01T00:00:00.000Z"),
      DateTime.parse("2011-03-01T00:00:00.000Z"),
      DateTime.parse("2011-04-01T00:00:00.000Z"),
      DateTime.parse("2011-05-01T00:00:00.000Z"),
      DateTime.parse("2011-06-01T00:00:00.000Z"),
      DateTime.parse("2011-07-01T00:00:00.000Z"),
      DateTime.parse("2011-08-01T00:00:00.000Z"),
      DateTime.parse("2011-09-01T00:00:00.000Z"),
      DateTime.parse("2011-10-01T00:00:00.000Z"),
      DateTime.parse("2011-11-01T00:00:00.000Z"),
      DateTime.parse("2011-12-01T00:00:00.000Z"),
    ]);
  }

  @Test
  testYearWeekInterval(exam: Exam): void {
    exam.equal(TimeInterval.weeks(DateTime.from({year: 2012}), DateTime.from({year: 2013})), [
      DateTime.parse("2012-01-01T00:00:00.000Z"),
      DateTime.parse("2012-01-08T00:00:00.000Z"),
      DateTime.parse("2012-01-15T00:00:00.000Z"),
      DateTime.parse("2012-01-22T00:00:00.000Z"),
      DateTime.parse("2012-01-29T00:00:00.000Z"),
      DateTime.parse("2012-02-05T00:00:00.000Z"),
      DateTime.parse("2012-02-12T00:00:00.000Z"),
      DateTime.parse("2012-02-19T00:00:00.000Z"),
      DateTime.parse("2012-02-26T00:00:00.000Z"),
      DateTime.parse("2012-03-04T00:00:00.000Z"),
      DateTime.parse("2012-03-11T00:00:00.000Z"),
      DateTime.parse("2012-03-18T00:00:00.000Z"),
      DateTime.parse("2012-03-25T00:00:00.000Z"),
      DateTime.parse("2012-04-01T00:00:00.000Z"),
      DateTime.parse("2012-04-08T00:00:00.000Z"),
      DateTime.parse("2012-04-15T00:00:00.000Z"),
      DateTime.parse("2012-04-22T00:00:00.000Z"),
      DateTime.parse("2012-04-29T00:00:00.000Z"),
      DateTime.parse("2012-05-06T00:00:00.000Z"),
      DateTime.parse("2012-05-13T00:00:00.000Z"),
      DateTime.parse("2012-05-20T00:00:00.000Z"),
      DateTime.parse("2012-05-27T00:00:00.000Z"),
      DateTime.parse("2012-06-03T00:00:00.000Z"),
      DateTime.parse("2012-06-10T00:00:00.000Z"),
      DateTime.parse("2012-06-17T00:00:00.000Z"),
      DateTime.parse("2012-06-24T00:00:00.000Z"),
      DateTime.parse("2012-07-01T00:00:00.000Z"),
      DateTime.parse("2012-07-08T00:00:00.000Z"),
      DateTime.parse("2012-07-15T00:00:00.000Z"),
      DateTime.parse("2012-07-22T00:00:00.000Z"),
      DateTime.parse("2012-07-29T00:00:00.000Z"),
      DateTime.parse("2012-08-05T00:00:00.000Z"),
      DateTime.parse("2012-08-12T00:00:00.000Z"),
      DateTime.parse("2012-08-19T00:00:00.000Z"),
      DateTime.parse("2012-08-26T00:00:00.000Z"),
      DateTime.parse("2012-09-02T00:00:00.000Z"),
      DateTime.parse("2012-09-09T00:00:00.000Z"),
      DateTime.parse("2012-09-16T00:00:00.000Z"),
      DateTime.parse("2012-09-23T00:00:00.000Z"),
      DateTime.parse("2012-09-30T00:00:00.000Z"),
      DateTime.parse("2012-10-07T00:00:00.000Z"),
      DateTime.parse("2012-10-14T00:00:00.000Z"),
      DateTime.parse("2012-10-21T00:00:00.000Z"),
      DateTime.parse("2012-10-28T00:00:00.000Z"),
      DateTime.parse("2012-11-04T00:00:00.000Z"),
      DateTime.parse("2012-11-11T00:00:00.000Z"),
      DateTime.parse("2012-11-18T00:00:00.000Z"),
      DateTime.parse("2012-11-25T00:00:00.000Z"),
      DateTime.parse("2012-12-02T00:00:00.000Z"),
      DateTime.parse("2012-12-09T00:00:00.000Z"),
      DateTime.parse("2012-12-16T00:00:00.000Z"),
      DateTime.parse("2012-12-23T00:00:00.000Z"),
      DateTime.parse("2012-12-30T00:00:00.000Z"),
    ]);
  }

  @Test
  testMonthWeekInterval(exam: Exam): void {
    exam.equal(TimeInterval.weeks(DateTime.from({year: 2018, month: 0}), DateTime.from({year: 2018, month: 1})), [
      DateTime.parse("2018-01-07T00:00:00.000Z"),
      DateTime.parse("2018-01-14T00:00:00.000Z"),
      DateTime.parse("2018-01-21T00:00:00.000Z"),
      DateTime.parse("2018-01-28T00:00:00.000Z"),
    ]);
  }

  @Test
  testDays(exam: Exam): void {
    exam.equal(TimeInterval.days(DateTime.from({year: 2011, month: 0}), DateTime.from({year: 2011, month: 1})), [
      DateTime.parse("2011-01-01T00:00:00.000Z"),
      DateTime.parse("2011-01-02T00:00:00.000Z"),
      DateTime.parse("2011-01-03T00:00:00.000Z"),
      DateTime.parse("2011-01-04T00:00:00.000Z"),
      DateTime.parse("2011-01-05T00:00:00.000Z"),
      DateTime.parse("2011-01-06T00:00:00.000Z"),
      DateTime.parse("2011-01-07T00:00:00.000Z"),
      DateTime.parse("2011-01-08T00:00:00.000Z"),
      DateTime.parse("2011-01-09T00:00:00.000Z"),
      DateTime.parse("2011-01-10T00:00:00.000Z"),
      DateTime.parse("2011-01-11T00:00:00.000Z"),
      DateTime.parse("2011-01-12T00:00:00.000Z"),
      DateTime.parse("2011-01-13T00:00:00.000Z"),
      DateTime.parse("2011-01-14T00:00:00.000Z"),
      DateTime.parse("2011-01-15T00:00:00.000Z"),
      DateTime.parse("2011-01-16T00:00:00.000Z"),
      DateTime.parse("2011-01-17T00:00:00.000Z"),
      DateTime.parse("2011-01-18T00:00:00.000Z"),
      DateTime.parse("2011-01-19T00:00:00.000Z"),
      DateTime.parse("2011-01-20T00:00:00.000Z"),
      DateTime.parse("2011-01-21T00:00:00.000Z"),
      DateTime.parse("2011-01-22T00:00:00.000Z"),
      DateTime.parse("2011-01-23T00:00:00.000Z"),
      DateTime.parse("2011-01-24T00:00:00.000Z"),
      DateTime.parse("2011-01-25T00:00:00.000Z"),
      DateTime.parse("2011-01-26T00:00:00.000Z"),
      DateTime.parse("2011-01-27T00:00:00.000Z"),
      DateTime.parse("2011-01-28T00:00:00.000Z"),
      DateTime.parse("2011-01-29T00:00:00.000Z"),
      DateTime.parse("2011-01-30T00:00:00.000Z"),
      DateTime.parse("2011-01-31T00:00:00.000Z"),
    ]);
  }

  @Test
  testNextYear(exam: Exam): void {
    exam.equal(TimeInterval.year().next(DateTime.from({year: 2017, month: 7, day: 15})).toString(), "2018-01-01T00:00:00.000Z");
  }

  @Test
  testNextTwoYear(exam: Exam): void {
    exam.equal(TimeInterval.year().next(DateTime.from({year: 2017}), 2).toString(), "2019-01-01T00:00:00.000Z");
  }

  @Test
  testNextMonth(exam: Exam): void {
    exam.equal(TimeInterval.month().next(DateTime.from({year: 2018, month: 5})).toString(), "2018-07-01T00:00:00.000Z");
  }

  @Test
  testNextThreeMonth(exam: Exam): void {
    exam.equal(TimeInterval.month().next(DateTime.from({year: 2018, month: 5}), 3).toString(), "2018-09-01T00:00:00.000Z");
  }

  @Test
  testNextWeek(exam: Exam): void {
    exam.equal(TimeInterval.week().next(DateTime.from({year:2018, month: 4, day: 19})).toString(), "2018-05-20T00:00:00.000Z");
  }

  @Test
  testNextDay(exam: Exam): void {
    exam.equal(TimeInterval.day().next(DateTime.from({year: 2018, month: 5, day: 15})).toString(), "2018-06-16T00:00:00.000Z");
  }

  @Test
  testNextFourDay(exam: Exam): void {
    exam.equal(TimeInterval.day().next(DateTime.from({year: 2018, month: 5, day: 27}), 4).toString(), "2018-07-01T00:00:00.000Z");
  }

  @Test
  testDay(exam: Exam): void {
    exam.equal(TimeInterval.day().next(DateTime.from({year: 2018, month: 5, day: 45})).toString(), "2018-07-16T00:00:00.000Z");
  }

  @Test
  testNextHour(exam: Exam): void {
    exam.equal(TimeInterval.hour().next(DateTime.from({year: 2018, month: 5, day: 20, hour: 6})).toString(), "2018-06-20T07:00:00.000Z");
  }

  @Test
  testNextMinute(exam: Exam): void {
    exam.equal(TimeInterval.minute().next(DateTime.from({year: 2018, month: 5, day: 20, hour: 6, minute: 30, second: 0})).toString(), "2018-06-20T06:31:00.000Z");
  }

  @Test
  testNextSecond(exam: Exam): void {
    exam.equal(TimeInterval.second().next(DateTime.from({year: 2018, month: 5, day: 20, hour: 6, minute: 30, second: 0})).toString(), "2018-06-20T06:30:01.000Z");
  }

  @Test
  textNextMillionSecond(exam: Exam): void {
    exam.equal(TimeInterval.millisecond().next(DateTime.from({year:2018, month: 5, day: 20, hour: 6, minute: 30, millisecond: 500})).toString(), "2018-06-20T06:30:00.501Z");
  }

  @Test
  testRoundYearDown(exam: Exam): void {
    exam.equal(TimeInterval.year().round(DateTime.from({year: 2018, month: 2})).toString(), "2018-01-01T00:00:00.000Z");
  }

  @Test
  testRoundYearUp(exam: Exam): void {
    exam.equal(TimeInterval.year().round(DateTime.from({year: 2018, month: 7, day: 1})).toString(), "2019-01-01T00:00:00.000Z");
  }

  @Test
  testRoundMonthDown(exam: Exam): void {
    exam.equal(TimeInterval.month().round(DateTime.from({year: 2018, month: 1, day: 11})).toString(), "2018-02-01T00:00:00.000Z");
  }

  @Test
  testRoundMonthUp(exam: Exam): void {
    exam.equal(TimeInterval.month().round(DateTime.from({year: 2018, month: 1, day: 22})).toString(), "2018-03-01T00:00:00.000Z");
  }

  @Test
  testRoundDayDown(exam: Exam): void {
    exam.equal(TimeInterval.day().round(DateTime.from({year: 2018, month: 4, day: 25, hour: 6})).toString(), "2018-05-25T00:00:00.000Z");
  }

  @Test
  testRoundDayUp(exam: Exam): void {
    exam.equal(TimeInterval.day().round(DateTime.from({year: 2018, month: 4, day: 25, hour: 14})).toString(), "2018-05-26T00:00:00.000Z");
  }

  @Test
  testRoundHourDown(exam: Exam): void {
    exam.equal(TimeInterval.hour().round(DateTime.from({year: 2018, month: 4, day: 25, hour: 7, minute: 29})).toString(), "2018-05-25T07:00:00.000Z");
  }

  @Test
  testRoundHourUp(exam: Exam): void {
    exam.equal(TimeInterval.hour().round(DateTime.from({year: 2018, month: 4, day: 25, hour: 7, minute: 40})).toString(), "2018-05-25T08:00:00.000Z");
  }

  @Test
  testRoundMinuteDown(exam: Exam): void {
    exam.equal( TimeInterval.minute().round(DateTime.from({year: 2018, month: 4, day: 25, hour: 7, minute: 29, second: 28, millisecond: 400})).toString(), "2018-05-25T07:29:00.000Z");
  }

  @Test
  testRoundMinuteUp(exam: Exam): void {
    exam.equal(TimeInterval.minute().round(DateTime.from({year: 2018, month: 4, day: 25, hour: 7, minute: 29, second: 31, millisecond: 400})).toString(), "2018-05-25T07:30:00.000Z");
  }

  @Test
  testRoundSecondDown(exam: Exam): void {
    exam.equal(TimeInterval.second().round(DateTime.from({year: 2018, month: 4, day: 25, hour: 7, minute: 29, second: 31, millisecond: 400})).toString(), "2018-05-25T07:29:31.000Z");
  }

  @Test
  testRoundSecondUp(exam: Exam): void {
    exam.equal(TimeInterval.second().round(DateTime.from({year: 2018, month: 4, day: 25, hour: 7, minute: 29, second: 31, millisecond: 500})).toString(), "2018-05-25T07:29:32.000Z");
  }

  @Test
  testYearOffset(exam: Exam): void {
    exam.equal(TimeInterval.year().offset(DateTime.from({year: 2015, month: 4, day: 6})).toString(), "2016-05-06T00:00:00.000Z");
  }

  @Test
  testLeapYearOffset(exam: Exam): void {
    exam.equal(TimeInterval.year().offset(DateTime.from({year: 2020, month: 1, day: 29})).toString(), "2021-03-01T00:00:00.000Z");
  }

  @Test
  test2YearOffset(exam: Exam): void {
    exam.equal(TimeInterval.year().offset(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800}), 2).toString(), "2020-07-15T08:45:11.800Z");
  }

  @Test
  testMonthOffset(exam: Exam): void {
    exam.equal(TimeInterval.month().offset(DateTime.from({year: 2017, month: 7, day: 9})).toString(), "2017-09-09T00:00:00.000Z");
  }

  @Test
  testWeekOffset(exam: Exam): void {
    exam.equal(TimeInterval.week().offset(DateTime.from({year: 2017, month: 7, day: 9})).toString(), "2017-08-16T00:00:00.000Z");
  }

  @Test
  testDayOffset(exam: Exam): void {
    exam.equal(TimeInterval.day().offset(DateTime.from({year: 2018, month: 4, day: 30})).toString(), "2018-05-31T00:00:00.000Z");
  }

  @Test
  test15DaysOffset(exam: Exam): void {
    exam.equal(TimeInterval.day().offset(DateTime.from({year: 2018, month: 6, day: 16, hour: 8, minute: 45, second: 11, millisecond: 800}), 15).toString(), "2018-07-31T08:45:11.800Z");
  }

  @Test
  testHourOffset(exam: Exam): void {
    exam.equal(TimeInterval.hour().offset(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800})).toString(), "2018-07-15T09:45:11.800Z");
  }

  @Test
  test16HourOffset(exam: Exam): void {
    exam.equal(TimeInterval.hour().offset(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800}), 16).toString(), "2018-07-16T00:45:11.800Z");
  }

  @Test
  testMinuteOffset(exam: Exam): void {
    exam.equal(TimeInterval.minute().offset(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800})).toString(), "2018-07-15T08:46:11.800Z");
  }

  @Test
  testSecondOffset(exam: Exam): void {
    exam.equal(TimeInterval.second().offset(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800})).toString(), "2018-07-15T08:45:12.800Z");
  }

  @Test
  test20SecondOffset(exam: Exam): void {
    exam.equal(TimeInterval.second().offset(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800}), 20).toString(), "2018-07-15T08:45:31.800Z");
  }

  @Test
  testMilisecondOffset(exam: Exam): void {
    exam.equal(TimeInterval.millisecond().offset(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800})).toString(), "2018-07-15T08:45:11.801Z");
  }

  @Test
  test200MilisecondOffset(exam: Exam): void {
    exam.equal(TimeInterval.millisecond().offset(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800}), 200).toString(), "2018-07-15T08:45:12.000Z");
  }

  @Test
  testYearRange(exam: Exam): void {
    exam.equal(TimeInterval.year().range(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800}), DateTime.from({year: 2020, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800})), [
      DateTime.parse("2019-01-01T00:00:00.000Z"),
      DateTime.parse("2020-01-01T00:00:00.000Z"),
    ]);
  }

  @Test
  testMonthRange(exam: Exam): void {
    exam.equal(TimeInterval.month().range(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800}), DateTime.from({year: 2019, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800})), [
      DateTime.parse("2018-08-01T00:00:00.000Z"),
      DateTime.parse("2018-09-01T00:00:00.000Z"),
      DateTime.parse("2018-10-01T00:00:00.000Z"),
      DateTime.parse("2018-11-01T00:00:00.000Z"),
      DateTime.parse("2018-12-01T00:00:00.000Z"),
      DateTime.parse("2019-01-01T00:00:00.000Z"),
      DateTime.parse("2019-02-01T00:00:00.000Z"),
      DateTime.parse("2019-03-01T00:00:00.000Z"),
      DateTime.parse("2019-04-01T00:00:00.000Z"),
      DateTime.parse("2019-05-01T00:00:00.000Z"),
      DateTime.parse("2019-06-01T00:00:00.000Z"),
      DateTime.parse("2019-07-01T00:00:00.000Z"),
    ]);
  }

  @Test
  testDayRange(exam: Exam): void {
    exam.equal(TimeInterval.day().range(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800}), DateTime.from({year: 2018, month: 7, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800})),  [
      DateTime.parse("2018-07-16T00:00:00.000Z"),
      DateTime.parse("2018-07-17T00:00:00.000Z"),
      DateTime.parse("2018-07-18T00:00:00.000Z"),
      DateTime.parse("2018-07-19T00:00:00.000Z"),
      DateTime.parse("2018-07-20T00:00:00.000Z"),
      DateTime.parse("2018-07-21T00:00:00.000Z"),
      DateTime.parse("2018-07-22T00:00:00.000Z"),
      DateTime.parse("2018-07-23T00:00:00.000Z"),
      DateTime.parse("2018-07-24T00:00:00.000Z"),
      DateTime.parse("2018-07-25T00:00:00.000Z"),
      DateTime.parse("2018-07-26T00:00:00.000Z"),
      DateTime.parse("2018-07-27T00:00:00.000Z"),
      DateTime.parse("2018-07-28T00:00:00.000Z"),
      DateTime.parse("2018-07-29T00:00:00.000Z"),
      DateTime.parse("2018-07-30T00:00:00.000Z"),
      DateTime.parse("2018-07-31T00:00:00.000Z"),
      DateTime.parse("2018-08-01T00:00:00.000Z"),
      DateTime.parse("2018-08-02T00:00:00.000Z"),
      DateTime.parse("2018-08-03T00:00:00.000Z"),
      DateTime.parse("2018-08-04T00:00:00.000Z"),
      DateTime.parse("2018-08-05T00:00:00.000Z"),
      DateTime.parse("2018-08-06T00:00:00.000Z"),
      DateTime.parse("2018-08-07T00:00:00.000Z"),
      DateTime.parse("2018-08-08T00:00:00.000Z"),
      DateTime.parse("2018-08-09T00:00:00.000Z"),
      DateTime.parse("2018-08-10T00:00:00.000Z"),
      DateTime.parse("2018-08-11T00:00:00.000Z"),
      DateTime.parse("2018-08-12T00:00:00.000Z"),
      DateTime.parse("2018-08-13T00:00:00.000Z"),
      DateTime.parse("2018-08-14T00:00:00.000Z"),
      DateTime.parse("2018-08-15T00:00:00.000Z"),
    ]);
    exam.equal(TimeInterval.day().range(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800}), DateTime.from({year: 2018, month: 7, day: 15})), [
      DateTime.parse("2018-07-16T00:00:00.000Z"),
      DateTime.parse("2018-07-17T00:00:00.000Z"),
      DateTime.parse("2018-07-18T00:00:00.000Z"),
      DateTime.parse("2018-07-19T00:00:00.000Z"),
      DateTime.parse("2018-07-20T00:00:00.000Z"),
      DateTime.parse("2018-07-21T00:00:00.000Z"),
      DateTime.parse("2018-07-22T00:00:00.000Z"),
      DateTime.parse("2018-07-23T00:00:00.000Z"),
      DateTime.parse("2018-07-24T00:00:00.000Z"),
      DateTime.parse("2018-07-25T00:00:00.000Z"),
      DateTime.parse("2018-07-26T00:00:00.000Z"),
      DateTime.parse("2018-07-27T00:00:00.000Z"),
      DateTime.parse("2018-07-28T00:00:00.000Z"),
      DateTime.parse("2018-07-29T00:00:00.000Z"),
      DateTime.parse("2018-07-30T00:00:00.000Z"),
      DateTime.parse("2018-07-31T00:00:00.000Z"),
      DateTime.parse("2018-08-01T00:00:00.000Z"),
      DateTime.parse("2018-08-02T00:00:00.000Z"),
      DateTime.parse("2018-08-03T00:00:00.000Z"),
      DateTime.parse("2018-08-04T00:00:00.000Z"),
      DateTime.parse("2018-08-05T00:00:00.000Z"),
      DateTime.parse("2018-08-06T00:00:00.000Z"),
      DateTime.parse("2018-08-07T00:00:00.000Z"),
      DateTime.parse("2018-08-08T00:00:00.000Z"),
      DateTime.parse("2018-08-09T00:00:00.000Z"),
      DateTime.parse("2018-08-10T00:00:00.000Z"),
      DateTime.parse("2018-08-11T00:00:00.000Z"),
      DateTime.parse("2018-08-12T00:00:00.000Z"),
      DateTime.parse("2018-08-13T00:00:00.000Z"),
      DateTime.parse("2018-08-14T00:00:00.000Z"),
    ]);
  }

  @Test
  testHourRange(exam: Exam): void {
    exam.equal(TimeInterval.hour().range(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800}), DateTime.from({year: 2018, month: 6, day: 16, hour: 8, minute: 45, second: 11, millisecond: 800})), [
      DateTime.parse("2018-07-15T09:00:00.000Z"),
      DateTime.parse("2018-07-15T10:00:00.000Z"),
      DateTime.parse("2018-07-15T11:00:00.000Z"),
      DateTime.parse("2018-07-15T12:00:00.000Z"),
      DateTime.parse("2018-07-15T13:00:00.000Z"),
      DateTime.parse("2018-07-15T14:00:00.000Z"),
      DateTime.parse("2018-07-15T15:00:00.000Z"),
      DateTime.parse("2018-07-15T16:00:00.000Z"),
      DateTime.parse("2018-07-15T17:00:00.000Z"),
      DateTime.parse("2018-07-15T18:00:00.000Z"),
      DateTime.parse("2018-07-15T19:00:00.000Z"),
      DateTime.parse("2018-07-15T20:00:00.000Z"),
      DateTime.parse("2018-07-15T21:00:00.000Z"),
      DateTime.parse("2018-07-15T22:00:00.000Z"),
      DateTime.parse("2018-07-15T23:00:00.000Z"),
      DateTime.parse("2018-07-16T00:00:00.000Z"),
      DateTime.parse("2018-07-16T01:00:00.000Z"),
      DateTime.parse("2018-07-16T02:00:00.000Z"),
      DateTime.parse("2018-07-16T03:00:00.000Z"),
      DateTime.parse("2018-07-16T04:00:00.000Z"),
      DateTime.parse("2018-07-16T05:00:00.000Z"),
      DateTime.parse("2018-07-16T06:00:00.000Z"),
      DateTime.parse("2018-07-16T07:00:00.000Z"),
      DateTime.parse("2018-07-16T08:00:00.000Z"),
    ]);
  }

  @Test
  testMinuteRange(exam: Exam): void {
    exam.equal(TimeInterval.minute().range(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800}), DateTime.from({year: 2018, month: 6, day: 15, hour: 9, minute: 45, second: 11, millisecond: 800})), [
      DateTime.parse("2018-07-15T08:46:00.000Z"),
      DateTime.parse("2018-07-15T08:47:00.000Z"),
      DateTime.parse("2018-07-15T08:48:00.000Z"),
      DateTime.parse("2018-07-15T08:49:00.000Z"),
      DateTime.parse("2018-07-15T08:50:00.000Z"),
      DateTime.parse("2018-07-15T08:51:00.000Z"),
      DateTime.parse("2018-07-15T08:52:00.000Z"),
      DateTime.parse("2018-07-15T08:53:00.000Z"),
      DateTime.parse("2018-07-15T08:54:00.000Z"),
      DateTime.parse("2018-07-15T08:55:00.000Z"),
      DateTime.parse("2018-07-15T08:56:00.000Z"),
      DateTime.parse("2018-07-15T08:57:00.000Z"),
      DateTime.parse("2018-07-15T08:58:00.000Z"),
      DateTime.parse("2018-07-15T08:59:00.000Z"),
      DateTime.parse("2018-07-15T09:00:00.000Z"),
      DateTime.parse("2018-07-15T09:01:00.000Z"),
      DateTime.parse("2018-07-15T09:02:00.000Z"),
      DateTime.parse("2018-07-15T09:03:00.000Z"),
      DateTime.parse("2018-07-15T09:04:00.000Z"),
      DateTime.parse("2018-07-15T09:05:00.000Z"),
      DateTime.parse("2018-07-15T09:06:00.000Z"),
      DateTime.parse("2018-07-15T09:07:00.000Z"),
      DateTime.parse("2018-07-15T09:08:00.000Z"),
      DateTime.parse("2018-07-15T09:09:00.000Z"),
      DateTime.parse("2018-07-15T09:10:00.000Z"),
      DateTime.parse("2018-07-15T09:11:00.000Z"),
      DateTime.parse("2018-07-15T09:12:00.000Z"),
      DateTime.parse("2018-07-15T09:13:00.000Z"),
      DateTime.parse("2018-07-15T09:14:00.000Z"),
      DateTime.parse("2018-07-15T09:15:00.000Z"),
      DateTime.parse("2018-07-15T09:16:00.000Z"),
      DateTime.parse("2018-07-15T09:17:00.000Z"),
      DateTime.parse("2018-07-15T09:18:00.000Z"),
      DateTime.parse("2018-07-15T09:19:00.000Z"),
      DateTime.parse("2018-07-15T09:20:00.000Z"),
      DateTime.parse("2018-07-15T09:21:00.000Z"),
      DateTime.parse("2018-07-15T09:22:00.000Z"),
      DateTime.parse("2018-07-15T09:23:00.000Z"),
      DateTime.parse("2018-07-15T09:24:00.000Z"),
      DateTime.parse("2018-07-15T09:25:00.000Z"),
      DateTime.parse("2018-07-15T09:26:00.000Z"),
      DateTime.parse("2018-07-15T09:27:00.000Z"),
      DateTime.parse("2018-07-15T09:28:00.000Z"),
      DateTime.parse("2018-07-15T09:29:00.000Z"),
      DateTime.parse("2018-07-15T09:30:00.000Z"),
      DateTime.parse("2018-07-15T09:31:00.000Z"),
      DateTime.parse("2018-07-15T09:32:00.000Z"),
      DateTime.parse("2018-07-15T09:33:00.000Z"),
      DateTime.parse("2018-07-15T09:34:00.000Z"),
      DateTime.parse("2018-07-15T09:35:00.000Z"),
      DateTime.parse("2018-07-15T09:36:00.000Z"),
      DateTime.parse("2018-07-15T09:37:00.000Z"),
      DateTime.parse("2018-07-15T09:38:00.000Z"),
      DateTime.parse("2018-07-15T09:39:00.000Z"),
      DateTime.parse("2018-07-15T09:40:00.000Z"),
      DateTime.parse("2018-07-15T09:41:00.000Z"),
      DateTime.parse("2018-07-15T09:42:00.000Z"),
      DateTime.parse("2018-07-15T09:43:00.000Z"),
      DateTime.parse("2018-07-15T09:44:00.000Z"),
      DateTime.parse("2018-07-15T09:45:00.000Z"),
    ]);
  }

  @Test
  testSecondRange(exam: Exam): void {
    exam.equal(TimeInterval.second().range(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800}), DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 20, millisecond: 800})), [
      DateTime.parse("2018-07-15T08:45:12.000Z"),
      DateTime.parse("2018-07-15T08:45:13.000Z"),
      DateTime.parse("2018-07-15T08:45:14.000Z"),
      DateTime.parse("2018-07-15T08:45:15.000Z"),
      DateTime.parse("2018-07-15T08:45:16.000Z"),
      DateTime.parse("2018-07-15T08:45:17.000Z"),
      DateTime.parse("2018-07-15T08:45:18.000Z"),
      DateTime.parse("2018-07-15T08:45:19.000Z"),
      DateTime.parse("2018-07-15T08:45:20.000Z"),
    ]);
  }

  @Test
  testMiliSecondRange(exam: Exam): void {
    exam.equal(TimeInterval.millisecond().range(DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 800}), DateTime.from({year: 2018, month: 6, day: 15, hour: 8, minute: 45, second: 11, millisecond: 810})), [
      DateTime.parse("2018-07-15T08:45:11.800Z"),
      DateTime.parse("2018-07-15T08:45:11.801Z"),
      DateTime.parse("2018-07-15T08:45:11.802Z"),
      DateTime.parse("2018-07-15T08:45:11.803Z"),
      DateTime.parse("2018-07-15T08:45:11.804Z"),
      DateTime.parse("2018-07-15T08:45:11.805Z"),
      DateTime.parse("2018-07-15T08:45:11.806Z"),
      DateTime.parse("2018-07-15T08:45:11.807Z"),
      DateTime.parse("2018-07-15T08:45:11.808Z"),
      DateTime.parse("2018-07-15T08:45:11.809Z"),
    ]);
  }

  @Test
  testEvery(exam: Exam): void {
    exam.equal(TimeInterval.month().every(1).range(DateTime.from({year: 2018, month: 4, day:16}), DateTime.from({year: 2018, month: 11, day: 16})), [
      DateTime.parse("2018-06-01T00:00:00.000Z"),
      DateTime.parse("2018-07-01T00:00:00.000Z"),
      DateTime.parse("2018-08-01T00:00:00.000Z"),
      DateTime.parse("2018-09-01T00:00:00.000Z"),
      DateTime.parse("2018-10-01T00:00:00.000Z"),
      DateTime.parse("2018-11-01T00:00:00.000Z"),
      DateTime.parse("2018-12-01T00:00:00.000Z"),
    ]);
  }

  @Test
  testYearFilterEquals(exam: Exam): void {
    exam.equal(TimeInterval.years(DateTime.from({year: 2018}), DateTime.from({year: 2021})).filter((x) => x.equals(DateTime.from({year: 2019}))).toString(), "2019-01-01T00:00:00.000Z");
  }

  @Test
  testYearFilterLess(exam: Exam): void {
    exam.equal(TimeInterval.years(DateTime.from({year: 2018}), DateTime.from({year: 2021})).filter((x) => x < (DateTime.from({year: 2019}))).toString(), "2018-01-01T00:00:00.000Z");
  }

  @Test
  testYearFilterGreater(exam: Exam): void {
    exam.equal(TimeInterval.years(DateTime.from({year: 2018}), DateTime.from({year: 2021})).filter((x) => x > (DateTime.from({year: 2019}))).toString(), "2020-01-01T00:00:00.000Z");
  }
}
