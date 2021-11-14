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

import {AnyDomain, Domain, LinearDomain, ContinuousScale, LinearScale} from "@swim/util";
import {BTree} from "@swim/collections";
import {TimeZone, AnyDateTime, DateTime, TimeDomain, DateTimeFormat, TimeInterval, TimeScale} from "@swim/time";

const ERROR_10 = Math.sqrt(50);
const ERROR_5 = Math.sqrt(10);
const ERROR_2 = Math.sqrt(2);

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const TIME_TICK_INTERVALS = new BTree<number, TimeInterval>()
  .set(SECOND, TimeInterval.second)
  .set(5 * SECOND, TimeInterval.second.every(5))
  .set(15 * SECOND, TimeInterval.second.every(15))
  .set(30 * SECOND, TimeInterval.second.every(30))
  .set(MINUTE, TimeInterval.minute)
  .set(5 * MINUTE, TimeInterval.minute.every(5))
  .set(15 * MINUTE, TimeInterval.minute.every(15))
  .set(30 * MINUTE, TimeInterval.minute.every(30))
  .set(HOUR, TimeInterval.hour)
  .set(3 * HOUR, TimeInterval.hour.every(3))
  .set(6 * HOUR, TimeInterval.hour.every(6))
  .set(12 * HOUR, TimeInterval.hour.every(12))
  .set(DAY, TimeInterval.day)
  .set(2 * DAY, TimeInterval.day.every(2))
  .set(WEEK, TimeInterval.week)
  .set(MONTH, TimeInterval.month)
  .set(3 * MONTH, TimeInterval.month.every(3))
  .set(YEAR, TimeInterval.year);

const MILLISECOND_FORMAT = DateTimeFormat.pattern(".%L");
const SECOND_FORMAT = DateTimeFormat.pattern(":%S");
const MINUTE_FORMAT = DateTimeFormat.pattern("%I:%M");
const HOUR_FORMAT = DateTimeFormat.pattern("%I %p");
const WEEKDAY_FORMAT = DateTimeFormat.pattern("%a %d");
const MONTHDAY_FORMAT = DateTimeFormat.pattern("%b %d");
const MONTH_FORMAT = DateTimeFormat.pattern("%B");
const YEAR_FORMAT = DateTimeFormat.pattern("%Y");

/** @public */
export abstract class TickGenerator<D> {
  abstract count(): number;
  abstract count(n: number): this;

  abstract domain(): Domain<D>;
  abstract domain(xs: AnyDomain<D>): this;
  abstract domain(x0: D, x1: D): this;

  abstract generate(): D[];

  format(tickValue: D): string {
    return "" + tickValue;
  }

  static fromScale<D>(scale: ContinuousScale<D, number>, n?: number): TickGenerator<D> {
    if (n === void 0) {
      n = 10;
    }
    if (scale instanceof TimeScale) {
      const domain = scale.domain;
      return new TimeTickGenerator(domain[0], domain[1], n) as unknown as TickGenerator<D>;
    } else if (scale instanceof LinearScale) {
      const domain = scale.domain;
      return new NumberTickGenerator(domain[0], domain[1], n) as unknown as TickGenerator<D>;
    } else {
      throw new TypeError("" + scale);
    }
  }

  /** @internal */
  static step(dx: number, n: number): number {
    const step0 = Math.abs(dx) / n;
    let step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10));
    const error = step0 / step1;
    if (error >= ERROR_10) {
      step1 *= 10;
    } else if (error >= ERROR_5) {
      step1 *= 5;
    } else if (error >= ERROR_2) {
      step1 *= 2;
    }
    return dx < 0 ? -step1 : step1;
  }
}

/** @public */
export class NumberTickGenerator extends TickGenerator<number> {
  /** @internal */
  protected x0: number;
  /** @internal */
  protected dx: number;
  /** @internal */
  protected n: number;

  constructor(x0: number, x1: number, n: number) {
    super();
    this.x0 = x0;
    this.dx = x1 - this.x0;
    this.n = Math.max(0, n);
  }

  override count(): number;
  override count(n: number): this;
  override count(n?: number): number | this {
    if (n === void 0) {
      return this.n;
    } else {
      this.n = Math.max(0, n);
      return this;
    }
  }

  override domain(): Domain<number>;
  override domain(xs: AnyDomain<number>): this;
  override domain(x0: number, x1: number): this;
  override domain(x0?: AnyDomain<number> | number, x1?: number): Domain<number> | this {
    if (x0 === void 0) {
      return LinearDomain(this.x0, this.x0 + this.dx);
    } else if (x1 === void 0) {
      this.x0 = (x0 as AnyDomain<number>)[0];
      this.dx = (x0 as AnyDomain<number>)[1] - this.x0;
      return this;
    } else {
      this.x0 = x0 as number;
      this.dx = x1 - this.x0;
      return this;
    }
  }

  override generate(): number[] {
    let x0: number;
    let x1: number;
    if (this.dx < 0) {
      x1 = this.x0;
      x0 = x1 + this.dx;
    } else {
      x0 = this.x0;
      x1 = x0 + this.dx;
    }

    const step = NumberTickGenerator.interval(x1 - x0, this.n);
    if (step === 0 || !isFinite(step)) {
      return [];
    }

    let ticks;
    if (step > 0) {
      x0 = Math.ceil(x0 / step);
      x1 = Math.floor(x1 / step);
      const n = Math.ceil(x1 - x0 + 1);
      ticks = new Array<number>(n);
      for (let i = 0; i < n; i += 1) {
        ticks[i] = (x0 + i) * step;
      }
    } else {
      x0 = Math.floor(x0 * step);
      x1 = Math.ceil(x1 * step);
      const n = Math.ceil(x0 - x1 + 1);
      ticks = new Array<number>(n);
      for (let i = 0; i < n; i += 1) {
        ticks[i] = (x0 - i) / step;
      }
    }

    if (this.dx < 0) {
      ticks.reverse();
    }

    return ticks;
  }

  /** @internal */
  static interval(dx: number, n: number = 10): number {
    const step = dx / n;
    const power = Math.floor(Math.log(step) / Math.LN10);
    const power10 = Math.pow(10, power);
    const error = step / power10;
    const base = error >= ERROR_10 ? 10 : error >= ERROR_5 ? 5 : error >= ERROR_2 ? 2 : 1;
    return power >= 0 ? power10 * base : -Math.pow(10, -power) / base;
  }
}

/** @public */
export class TimeTickGenerator extends TickGenerator<DateTime> {
  /** @internal */
  protected t0: number;
  /** @internal */
  protected dt: number;
  /** @internal */
  protected zone: TimeZone;
  /** @internal */
  protected n: number;

  constructor(t0: AnyDateTime, t1: AnyDateTime, n: number, zone?: TimeZone) {
    super();
    const d0 = DateTime.fromAny(t0);
    const d1 = DateTime.fromAny(t1);
    this.t0 = d0.time;
    this.dt = d1.time - this.t0;
    this.zone = zone !== void 0 ? zone : d0.zone;
    this.n = Math.max(0, n);
  }

  override count(): number;
  override count(n: number): this;
  override count(n?: number): number | this {
    if (n === void 0) {
      return this.n;
    } else {
      this.n = Math.max(0, n);
      return this;
    }
  }

  override domain(): Domain<DateTime>;
  override domain(ts: AnyDomain<DateTime>): this;
  override domain(d0: AnyDateTime, d1: AnyDateTime): this;
  override domain(d0?: AnyDomain<DateTime> | AnyDateTime,
                  d1?: AnyDateTime): Domain<DateTime> | this {
    if (d0 === void 0) {
      return TimeDomain(new DateTime(this.t0, this.zone), new DateTime(this.t0 + this.dt, this.zone));
    } else {
      if (d1 === void 0) {
        d1 = (d0 as AnyDomain<DateTime>)[1];
        d0 = (d0 as AnyDomain<DateTime>)[0];
      } else {
        d0 = d0 as AnyDateTime;
      }
      d0 = DateTime.fromAny(d0);
      d1 = DateTime.fromAny(d1);
      this.t0 = (d0 as DateTime).time;
      this.dt = (d1 as DateTime).time - this.t0;
      return this;
    }
  }

  override generate(interval?: TimeInterval | number): DateTime[] {
    let t0: number;
    let t1: number;
    if (this.dt < 0) {
      t1 = this.t0;
      t0 = t1 + this.dt;
    } else {
      t0 = this.t0;
      t1 = t0 + this.dt;
    }

    if (interval === void 0) {
      interval = this.n;
    }
    interval = TimeTickGenerator.interval(t1 - t0, interval);
    const ticks = interval.range(new DateTime(t0, this.zone), new DateTime(t1 + 1, this.zone));

    if (this.dt < 0) {
      ticks.reverse();
    }

    return ticks;
  }

  override format(tickValue: DateTime): string {
    if (TimeInterval.second.floor(tickValue) < tickValue) {
      return MILLISECOND_FORMAT.format(tickValue);
    } else if (TimeInterval.minute.floor(tickValue) < tickValue) {
      return SECOND_FORMAT.format(tickValue);
    } else if (TimeInterval.hour.floor(tickValue) < tickValue) {
      return MINUTE_FORMAT.format(tickValue);
    } else if (TimeInterval.day.floor(tickValue) < tickValue) {
      return HOUR_FORMAT.format(tickValue);
    } else if (TimeInterval.month.floor(tickValue) < tickValue) {
      if (TimeInterval.week.floor(tickValue) < tickValue) {
        return WEEKDAY_FORMAT.format(tickValue);
      } else {
        return MONTHDAY_FORMAT.format(tickValue);
      }
    } else if (TimeInterval.year.floor(tickValue) < tickValue) {
      return MONTH_FORMAT.format(tickValue);
    } else {
      return YEAR_FORMAT.format(tickValue);
    }
  }

  /** @internal */
  static interval(dt: number, interval: TimeInterval | number = 10): TimeInterval {
    if (typeof interval === "number") {
      const t = Math.abs(dt) / interval;
      const duration = TIME_TICK_INTERVALS.nextKey(t);
      if (duration === void 0) {
        const k = TickGenerator.step(dt / YEAR, interval);
        interval = TimeInterval.year.every(k);
      } else if (duration > SECOND) {
        if (t / TIME_TICK_INTERVALS.previousKey(t)! < duration / t) {
          interval = TIME_TICK_INTERVALS.previousValue(t)!;
        } else {
          interval = TIME_TICK_INTERVALS.nextValue(t)!;
        }
      } else {
        const k = Math.max(1, TickGenerator.step(dt, interval));
        interval = TimeInterval.millisecond.every(k);
      }
    }
    return interval;
  }
}
