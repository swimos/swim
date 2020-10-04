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

import {Objects} from "@swim/util";
import {Interpolator} from "@swim/interpolate";
import {AnyEase, Ease} from "./Ease";
import {TransitionObserver} from "./TransitionObserver";

export type TransitionBegin<T> = (value: T) => void;
export type TransitionEnd<T> = (value: T) => void;
export type TransitionInterrupt<T> = (value: T) => void;

export type Tween<T> = AnyTransition<T> | boolean | null;

export type AnyTransition<T> = Transition<T> | TransitionInit<T>;

export interface TransitionInit<T> extends TransitionObserver<T> {
  duration?: number | null;
  ease?: AnyEase | null;
  interpolator?: Interpolator<T, unknown> | null;
}

export class Transition<T> {
  /** @hidden */
  readonly _duration?: number;
  /** @hidden */
  readonly _ease?: Ease;
  /** @hidden */
  readonly _interpolator?: Interpolator<T, unknown>;
  /** @hidden */
  readonly _observers?: ReadonlyArray<TransitionObserver<T>>;

  constructor(duration: number | null, ease: Ease | null,
              interpolator: Interpolator<T, unknown> | null,
              observers: ReadonlyArray<TransitionObserver<T>> | null) {
    if (duration !== null) {
      this._duration = duration;
    }
    if (ease !== null) {
      this._ease = ease;
    }
    if (interpolator !== null) {
      this._interpolator = interpolator;
    }
    if (observers !== null) {
      this._observers = observers;
    }
  }

  duration(): number | null;
  duration(duration: number | null): Transition<T>;
  duration(duration?: number | null): number | null | Transition<T> {
    if (duration === void 0) {
      return this._duration !== void 0 ? this._duration : null;
    } else {
      return Transition.from(duration, this._ease, this._interpolator, this._observers);
    }
  }

  ease(): Ease | null;
  ease(ease: AnyEase | null): Transition<T>;
  ease(ease?: AnyEase | null): Ease | null | Transition<T> {
    if (ease === void 0) {
      return this._ease !== void 0 ? this._ease : null;
    } else {
      return Transition.from(this._duration, ease, this._interpolator, this._observers);
    }
  }

  interpolator(): Interpolator<T, unknown> | null;
  interpolator(interpolator: Interpolator<T, unknown> | null): Transition<T>;
  interpolator(interpolator?: Interpolator<T, unknown> | null): Interpolator<T, unknown> | null | Transition<T> {
    if (interpolator === void 0) {
      return this._interpolator !== void 0 ? this._interpolator : null;
    } else {
      return Transition.from(this._duration, this._ease, interpolator, this._observers);
    }
  }

  range(): ReadonlyArray<T> | null;
  range(ys: ReadonlyArray<T>): Transition<T>;
  range(y0: T, y1: T): Transition<T>;
  range(y0?: ReadonlyArray<T> | T, y1?: T): ReadonlyArray<T> | null | Transition<T> {
    if (y0 === void 0) {
      return this._interpolator !== void 0 ? this._interpolator.range() : null;
    } else {
      let interpolator: Interpolator<T, unknown>;
      if (this._interpolator !== void 0) {
        interpolator = this._interpolator.range(y0, y1);
      } else {
        interpolator = Interpolator.between(y0 as T, y1!);
      }
      return Transition.from(this._duration, this._ease, interpolator, this._observers);
    }
  }

  observers(): ReadonlyArray<TransitionObserver<T>> | null;
  observers(observers: ReadonlyArray<TransitionObserver<T>> | null): Transition<T>;
  observers(observers?: ReadonlyArray<TransitionObserver<T>> | null): ReadonlyArray<TransitionObserver<T>> | null | Transition<T> {
    if (observers === void 0) {
      return this._observers !== void 0 ? this._observers : null;
    } else {
      return Transition.from(this._duration, this._ease, this._interpolator, observers);
    }
  }

  observer(observer: TransitionObserver<T>): Transition<T> {
    const observers = this._observers !== void 0 ? this._observers.slice(0) : [];
    observers.push(observer);
    return Transition.from(this._duration, this._ease, this._interpolator, observers);
  }

  onBegin(onBegin: TransitionBegin<T>): Transition<T> {
    const observer: TransitionObserver<T> = {onBegin};
    const observers = this._observers !== void 0 ? this._observers.slice(0) : [];
    observers.push(observer);
    return Transition.from(this._duration, this._ease, this._interpolator, observers);
  }

  onEnd(onEnd: TransitionEnd<T>): Transition<T> {
    const observer: TransitionObserver<T> = {onEnd};
    const observers = this._observers !== void 0 ? this._observers.slice(0) : [];
    observers.push(observer);
    return Transition.from(this._duration, this._ease, this._interpolator, observers);
  }

  onInterrupt(onInterrupt: TransitionInterrupt<T>): Transition<T> {
    const observer: TransitionObserver<T> = {onInterrupt};
    const observers = this._observers !== void 0 ? this._observers.slice(0) : [];
    observers.push(observer);
    return Transition.from(this._duration, this._ease, this._interpolator, observers);
  }

  toAny(): TransitionInit<T> {
    const init: TransitionInit<T> = {};
    if (this._duration !== void 0) {
      init.duration = this._duration;
    }
    if (this._ease !== void 0) {
      init.ease = this._ease;
    }
    if (this._interpolator !== void 0) {
      init.interpolator = this._interpolator;
    }
    return init;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Transition) {
      return this._duration === that._duration && this._ease === that._ease
          && Objects.equal(this._interpolator, that._interpolator);
    }
    return false;
  }

  static duration<T>(duration: number, ease?: AnyEase | null,
                     interpolator?: Interpolator<T, unknown> | null): Transition<T> {
    ease = ease !== void 0 && ease !== null ? Ease.fromAny(ease) : null;
    if (interpolator === void 0) {
      interpolator = null;
    }
    return new Transition(duration, ease, interpolator, null);
  }

  static ease<T>(ease: AnyEase, interpolator?: Interpolator<T, unknown> | null): Transition<T> {
    ease = Ease.fromAny(ease);
    if (interpolator === void 0) {
      interpolator = null;
    }
    return new Transition(null, ease, interpolator, null);
  }

  static interpolator<T>(interpolator: Interpolator<T, unknown>): Transition<T> {
    return new Transition(null, null, interpolator, null);
  }

  static range<T>(y0: ReadonlyArray<T>): Transition<T>;
  static range<T>(y0: T, y1: T): Transition<T>;
  static range<T>(y0: ReadonlyArray<T> | T, y1?: T): Transition<T> {
    let interpolator: Interpolator<T, unknown>;
    if (y1 === void 0) {
      y0 = y0 as ReadonlyArray<T>;
      interpolator = Interpolator.between(y0[0], y0[1]);
    } else {
      interpolator = Interpolator.between(y0 as T, y1);
    }
    return new Transition(null, null, interpolator, null);
  }

  static from<T>(duration?: number | null, ease?: AnyEase | null,
                 interpolator?: Interpolator<T, unknown> | null,
                 observers?: ReadonlyArray<TransitionObserver<T>> | null): Transition<T> {
    if (duration === void 0) {
      duration = null;
    }
    ease = ease !== void 0 && ease !== null ? Ease.fromAny(ease) : null;
    if (interpolator === void 0) {
      interpolator = null;
    }
    if (observers === void 0) {
      observers = null;
    }
    return new Transition(duration, ease, interpolator, observers);
  }

  static fromInit<T>(transition: TransitionInit<T>): Transition<T> {
    let observers: ReadonlyArray<TransitionObserver<T>> | undefined;
    if (TransitionObserver.is(transition)) {
      const observer: TransitionObserver<T> = {};
      if (transition.onBegin !== void 0) {
        observer.onBegin = transition.onBegin;
      }
      if (transition.onEnd !== void 0) {
        observer.onEnd = transition.onEnd;
      }
      if (transition.onInterrupt !== void 0) {
        observer.onInterrupt = transition.onInterrupt;
      }
      observers = [observer];
    }
    return Transition.from(transition.duration, transition.ease, transition.interpolator, observers);
  }

  static fromAny<T>(transition: AnyTransition<T>): Transition<T> {
    if (transition instanceof Transition) {
      return transition;
    } else if (Transition.isInit(transition)) {
      return Transition.fromInit(transition);
    }
    throw new TypeError("" + transition);
  }

  static forTween<T>(tween: Tween<T> | undefined, value?: T extends undefined ? never : T,
                     duration: number | null = null,
                     ease: AnyEase | null = null): Transition<T> | null {
    if (tween instanceof Transition) {
      return tween;
    } else if (Transition.isInit(tween)) {
      return Transition.fromInit(tween);
    } else if (tween === true && value !== void 0) {
      return Transition.from(duration, ease, Interpolator.between(value, value));
    }
    return null;
  }

  /** @hidden */
  static isInit(value: unknown): value is TransitionInit<any> {
    if (typeof value === "object" && value !== null) {
      const init = value as TransitionInit<any>;
      return init.duration !== void 0
          || init.ease !== void 0
          || init.interpolator !== void 0;
    }
    return false;
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyTransition<any> {
    return value instanceof Transition
        || Transition.isInit(value);
  }

  /** @hidden */
  static isTween(value: unknown): value is Tween<any> {
    return Transition.isAny(value)
        || typeof value === "boolean"
        || value === null;
  }
}
