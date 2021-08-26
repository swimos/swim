# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> Swim Time Library

The Swim Time library implements date-time, time zone, and time interval data
types, with `strptime`/`strftime`-style parsers and formatters. The Swim Time
library facilitates parsing and formatting of date strings, time zone aware
date manipulation, and sampling of date ranges at regular time intervals.

## Overview

### DateTime

The `DateTime` class models an immutable instant in time, relative to a
particular `TimeZone`. The `DateTime.current` static method returns the
current time in the local time zone, or in an optionally specified time zone.

```typescript
DateTime.current();
DateTime.current(TimeZone.utc);
```

The `DateTime.fromInit` static method coerces plain JavaScript objects, of type
`DateTimeInit`, to instances of `DateTime`. `DateTime.fromInit` defaults to UTC,
but can optionally be passed a specific time zone.

```typescript
DateTime.fromInit({year: 2019});
// "2019-01-01T00:00:00.000Z"

DateTime.fromInit({year: 2019, month: 8, day: 12, hour: 5, minute: 16, second: 10});
// "2019-09-12T05:16:10.000Z"

DateTime.fromInit({year: 2019, month: 8, day: 12, hour: 5, minute: 16, second: 10}, TimeZone.local);
// "2019-09-11T15:16:10.000Z"
```

The `DateTime.fromAny` static method coerces common JavaScript date
representations, including ECMAScript `Date` objects, numbers representing
milliseconds since the Unix epoch, and ISO 8601-formatted date-time strings,
to `DateTime` instances.

```typescript
DateTime.fromAny(Date.now());
// "2019-08-12T22:54:39.648Z"

DateTime.fromAny(1565650479648);
// "2019-08-12T22:54:39.648Z"

DateTime.fromAny("2019-08-12T22:54:39.648Z");
// "2019-08-12T22:54:39.648Z"
```

### TimeZone

The `TimeZone` class represents an immutable offset, in minutes, from Universal
Coordinated Time (UTC). The `TimeZone.local` and `TimeZone.utc` static methods
return the current local time zone, and the UTC time zone, respectively.

```typescript
TimeZone.local;
// TimeZone.forOffset(-420)

TimeZone.utc;
// TimeZone.forOffset(0)
```

### DateTimeFormat

A `DateTimeFormat` represents a string encoding that parse date-time strings
as `DateTime` objects, and format `DateTime` objects as date-time strings.
The `DateTimeFormat.iso8601` static method returns the standard ISO 8601
date-time format. The `DateTimeFormat.pattern` method returns a
`DateTimeFormat` that parses and formats date-times according to a
`strptime`/`strftime`-style format string.

Use the `parse` method of a `DateTimeFormat` to parse a `DateTime` object from
a compatible date-time string:

```typeScript
DateTimeFormat.iso8601.parse("2019-08-12T16:11:59.586Z");
// "2019-08-12T16:11:59.586Z

DateTimeFormat.pattern("%Y-%m-%d").parse("2019-08-12");
// "2019-08-12T00:00:00.000Z"

DateTimeFormat.pattern("%H:%M:%S").parse("16:11:59");
// "1970-01-01T16:11:59.000Z"
```

Use the `format` method of a `DateTimeFormat` to serialize a `DateTime` object
to a compatible date-time string. You can also optionally pass a
`DateTimeFormat` to a `DateTime`'s `toString` method.

```typescript
DateTimeFormat.iso8601.format(DateTime.current());
// "2019-08-12T16:15:27.045Z"

DateTime.current().toString(DateTimeFormat.pattern("%Y-%m-%d"));
// "2019-08-12"

DateTime.current().toString(DateTimeFormat.pattern("%H:%M:%S"));
// "16:16:20"

DateTime.current().toString(DateTimeFormat.pattern("%b %d"));
// "Aug 12"
```

### DateTimeLocale

A `DateTimeLocale` specifies the period, weekday, short weekday, month, and
short month strings used when parsing and formatting date-time strings.
`DateTimeLocale.standard()` returns the standard English language locale.

### TimeInterval

A `TimeInterval` represents a regular duration of time. A `UnitTimeInterval`
represents a time interval with a uniform duration. Milliseconds, seconds,
minutes, hours, and days are unit time intervals. Weeks, months, and years
are not unit time intervals, because different weeks, months, and years can
have different durations.

Time intervals can be created with the `TimeInterval.millisecond`,
`TimeInterval.second`, `TimeInterval.minute`, `TimeInterval.hour`,
`TimeInterval.day`, `TimeInterval.week`, `TimeInterval.month`, and
`TimeInterval.year` factory methods.

A `TimeInterval` can be used to `offset` a `DateTime` by a multiple of the
interval, to advance to the `next` whole multiple of the interval, to round
a `DateTime` down to the `floor` of the interval, to round a `DateTime` up
to the `ceil` of the interval, or to `round` a `DateTime` to the nearest
whole interval.

```typescript
TimeInterval.second.offset("2019-08-12T16:35:10.838Z", 5);
// "2019-08-12T16:35:15.838Z"

TimeInterval.minute.next("2019-08-12T16:35:10.838Z");
// "2019-08-12T16:36:00.000Z"

TimeInterval.minute.next("2019-08-12T16:35:10.838Z", 30);
// "2019-08-12T17:05:00.000Z"

TimeInterval.hour.floor("2019-08-12T16:35:10.838Z");
// "2019-08-12T16:00:00.000Z"

TimeInterval.day.ceil("2019-08-12T16:35:10.838Z");
// "2019-08-13T00:00:00.000Z"

TimeInterval.week.round("2019-08-12T16:35:10.838Z");
// "2019-08-11T00:00:00.000Z"
```

The `every` method of a `UnitTimeInterval` returns a new `TimeInterval` equal
to a multiple of the base time interval.

```typescript
TimeInterval.minute.every(15).next("2019-08-12T16:35:10.838Z");
// "2019-08-12T16:45:00.000Z"
```

The `range` method of a `TimeInterval` returns an array of `DateTime`s
representing every whole interval between some start time (inclusive), and
some end time (exclusive). An optional third argument to `range` indicates
that only every `step` multiple of the base interval should be included in
the returned range.

The `TimeInterval.milliseconds`, `TimeInterval.seconds`, `TimeInterval.minutes`,
`TimeInterval.hours`, `TimeInterval.days`, `TimeInterval.weeks`,
`TimeInterval.months`, and `TimeInterval.years` factory methods provide
a shorthand for computing a range of `DateTime`s between two times, and
return the equivalent of calling `range` on the underlying time interval.

```typescript
TimeInterval.year.range({year: 2017}, {year: 2020});
// ["2017-01-01T00:00:00.000Z", "2018-01-01T00:00:00.000Z", "2019-01-01T00:00:00.000Z"]

TimeInterval.months({year: 2019, month: 3}, {year: 2019, month: 6});
// ["2019-04-01T00:00:00.000Z", "2019-05-01T00:00:00.000Z", "2019-06-01T00:00:00.000Z"]

TimeInterval.days({year: 2019, month: 7, day: 1}, {year: 2019, month: 7, day: 12}, 4);
// ["2019-08-01T00:00:00.000Z", "2019-08-05T00:00:00.000Z", "2019-08-09T00:00:00.000Z"]
```
