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

import type {Uninitable} from "./types";
import type {Mutable} from "./types";
import {Values} from "./Values";
import {Domain} from "./Domain";
import {Interpolator} from "./Interpolator";
import type {EasingLike} from "./Easing";
import type {EasingType} from "./Easing";
import {Easing} from "./"; // forward import
import {Tweening} from "./"; // forward import

/** @public */
export type TimingLike = Timing | TimingInit;

/** @public */
export interface TimingInit {
  /** @internal */
  readonly typeid?: "TimingInit";
  easing?: EasingLike;
  t0?: number;
  t1?: number;
  dt?: number;
}

/** @public */
export interface Timing extends Domain<number> {
  /** @internal */
  readonly typeid?: "Timing";

  likeType?(like: TimingInit | EasingType): void;

  /** @override */
  readonly 0: number;

  /** @override */
  readonly 1: number;

  readonly duration: number;

  readonly easing: Easing;

  /** @override */
  contains(t: number): boolean;

  withDomain(t0: number, t1: number): Timing;

  withDuration(dt: number): Timing;

  overRange<Y>(range: Interpolator<Y>): Tweening<Y>;
  overRange<Y>(y0: Y, y1: Y): Tweening<Y>;

  /** @override */
  union(that: Domain<number>): Timing;

  /** @override */
  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

  /** @override */
  equivalentTo(that: unknown, epsilon?: number): boolean;

  /** @override */
  toString(): string;
}

/** @public */
export const Timing = (function (_super: typeof Domain) {
  const Timing = function (easing: Easing, t0: number, t1: number): Timing {
    const timing = function (t: number): number {
      const t0 = timing[0];
      const t1 = timing[1];
      return timing.easing(Math.min(Math.max(0, (t - t0) / (t1 - t0)), 1));
    } as Timing;
    Object.setPrototypeOf(timing, Timing.prototype);
    (timing as Mutable<typeof timing>).easing = easing;
    (timing as Mutable<typeof timing>)[0] = t0;
    (timing as Mutable<typeof timing>)[1] = t1;
    return timing;
  } as {
    (easing: Easing, t0: number, t1: number): Timing;

    /** @internal */
    prototype: Timing;

    fromLike<T extends TimingLike | boolean | null | undefined>(value: T): Timing | (T extends true ? true : never) | (T extends false ? false : never) | Uninitable<T>;

    fromInit(init: TimingInit): Timing;
  };

  Timing.prototype = Object.create(_super.prototype);
  Timing.prototype.constructor = Timing;

  Object.defineProperty(Timing.prototype, "duration", {
    get(this: Timing): number {
      return this[1] - this[0];
    },
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

  Timing.prototype.union = function (that: Domain<number>): Timing {
    return Timing(this.easing, Math.min(this[0], that[0]), Math.max(this[1], that[1]));
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

  Timing.prototype.toString = function (): string {
    return "Timing(" + this.easing + ", " + this[0] + ", " + this[1] + ")";
  };

  Timing.fromLike = function <T extends TimingLike | boolean | null | undefined>(value: T): Timing | (T extends true ? true : never) | (T extends false ? false : never) | Uninitable<T> {
    if (value === void 0 || value === null || typeof value === "boolean" || value instanceof Timing) {
      return value as Timing | (T extends true ? true : never) | (T extends false ? false : never) | Uninitable<T>;
    } else if (typeof value === "object") {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
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

  return Timing;
})(Domain);
