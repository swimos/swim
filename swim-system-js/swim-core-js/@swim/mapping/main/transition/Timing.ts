// Copyright 2015-2021 Swim inc.
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

import {Values} from "@swim/util";
import {Domain} from "../mapping/Domain";
import {Interpolator} from "../interpolate/Interpolator";
import {AnyEasing, Easing} from "../"; // forward import
import {Tweening} from "../"; // forward import

export type AnyTiming = Timing | TimingInit;

export interface TimingInit {
  easing?: AnyEasing;
  t0?: number;
  t1?: number;
  dt?: number;
}

export interface Timing extends Domain<number> {
  readonly 0: number;

  readonly 1: number;

  readonly duration: number;

  readonly easing: Easing;

  contains(t: number): boolean;

  withDomain(t0: number, t1: number): Timing;

  withDuration(dt: number): Timing;

  overRange<Y>(range: Interpolator<Y>): Tweening<Y>;
  overRange<Y>(y0: Y, y1: Y): Tweening<Y>;

  equivalentTo(that: unknown, epsilon?: number): boolean;

  canEqual(that: unknown): boolean;

  equals(that: unknown): boolean;

  toString(): string;
}

export const Timing = function (easing: Easing, t0: number, t1: number): Timing {
  const timing = function (t: number): number {
    const t0 = timing[0];
    const t1 = timing[1];
    return timing.easing(Math.min(Math.max(0, (t - t0) / (t1 - t0)), 1));
  } as Timing;
  Object.setPrototypeOf(timing, Timing.prototype);
  Object.defineProperty(timing, "easing", {
    value: easing,
    enumerable: true,
  });
  Object.defineProperty(timing, 0, {
    value: t0,
    enumerable: true,
  });
  Object.defineProperty(timing, 1, {
    value: t1,
    enumerable: true,
  });
  return timing;
} as {
  (easing: Easing, t0: number, t1: number): Timing;

  /** @hidden */
  prototype: Timing;

  fromInit(init: TimingInit): Timing;

  fromAny(value: AnyTiming): Timing;
  fromAny(value: AnyTiming | boolean | null | undefined): Timing | boolean;
};

Timing.prototype = Object.create(Domain.prototype);

Object.defineProperty(Timing.prototype, "duration", {
  get(this: Timing): number {
    return this[1] - this[0];
  },
  enumerable: true,
  configurable: true,
});

Timing.prototype.contains = function (t: number): boolean {
  return this[0] <= t && t <= this[1];
};

Timing.prototype.withDomain = function (t0: number, t1: number): Timing {
  return Timing(this.easing, t0, t1);
};

Timing.prototype.withDuration = function (dt: number): Timing {
  const t0 = this[0];
  return Timing(this.easing, t0, t0 + dt);
};

Timing.prototype.overRange = function <Y>(this: Timing, y0: Interpolator<Y> | Y, y1: Y): Tweening<Y> {
  let range: Interpolator<Y>;
  if (arguments.length === 1) {
    range = y0 as Interpolator<Y>;
  } else {
    range = Interpolator(y0 as Y, y1);
  }
  return Tweening(this, range);
} as typeof Timing.prototype.overRange;

Timing.prototype.equivalentTo = function (that: unknown, epsilon?: number): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof Timing) {
    return this.easing.equivalentTo(that.easing, epsilon)
        && Values.equivalent(this[0], that[0], epsilon)
        && Values.equivalent(this[1], that[1], epsilon);
  }
  return false;
};

Timing.prototype.canEqual = function (that: unknown): boolean {
  return that instanceof Timing;
};

Timing.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof Timing) {
    return that.canEqual(this)
        && this.easing.equals(that.easing)
        && Values.equal(this[0], that[0])
        && Values.equal(this[1], that[1]);
  }
  return false;
};

Timing.prototype.toString = function (): string {
  return "Timing(" + this.easing + ", " + this[0] + ", " + this[1] + ")";
};

Timing.fromInit = function (init: TimingInit): Timing {
  let easing = init.easing;
  if (easing === void 0) {
    easing = Easing.linear;
  } else if (typeof easing === "string") {
    easing = Easing(easing);
  }
  let t0 = init.t0;
  if (t0 === void 0) {
    t0 = 0;
  }
  let t1 = init.t1;
  if (t1 === void 0) {
    const dt = init.dt;
    if (dt !== void 0) {
      t1 = t0 + dt;
    } else {
      t1 = t0;
    }
  }
  return Timing(easing, t0, t1);
};

Timing.fromAny = function (value: AnyTiming | boolean | null | undefined): Timing | boolean {
  if (value === void 0 || value === null) {
    return false;
  } else if (value instanceof Timing || typeof value === "boolean") {
    return value;
  } else if (typeof value === "object") {
    return Timing.fromInit(value);
  }
  throw new TypeError("" + value);
} as typeof Timing.fromAny;
