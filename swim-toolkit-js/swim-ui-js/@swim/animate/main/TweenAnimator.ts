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

import {Objects} from "@swim/util";
import {Interpolator} from "@swim/interpolate";
import {AnyEase, Ease, Tween, AnyTransition, Transition} from "@swim/transition";
import {TransitionObserver} from "@swim/transition";
import {Animator} from "./Animator";

/** @hidden */
export const enum TweenState {
  Quiesced,
  Diverged,
  Tracking,
  Converged,
  Interrupt,
}

export abstract class TweenAnimator<T> extends Animator {
  /** @hidden */
  _duration: number;
  /** @hidden */
  _ease: Ease;
  /** @hidden */
  _interpolator: Interpolator<T, unknown> | null;
  /** @hidden */
  _observers: TransitionObserver<T>[] | null;
  /** @hidden */
  _interrupts: TransitionObserver<T>[] | null;
  /** @hidden */
  _value: T | undefined;
  /** @hidden */
  _state: T | undefined;
  /** @hidden */
  _beginTime: number;
  /** @hidden */
  _tweenState: TweenState;
  /** @hidden */
  _enabled: boolean;

  constructor(value: T | undefined, transition: Transition<T> | null) {
    super();
    if (transition !== null) {
      this._duration = transition._duration !== void 0 ? transition._duration : 0;
      this._ease = transition._ease !== void 0 ? transition._ease : Ease.linear;
      this._interpolator = transition._interpolator !== void 0 ? transition._interpolator : null;
      this._observers = transition._observers !== void 0 ? transition._observers.slice(0) : null;
    } else {
      this._duration = 0;
      this._ease = Ease.linear;
      this._interpolator = null;
      this._observers = null;
    }
    this._interrupts = null;
    this._value = value;
    this._state = value;
    this._beginTime = 0;
    this._tweenState = TweenState.Quiesced;
    this._enabled = true;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  setEnabled(enabled: boolean): void {
    if (enabled && !this._enabled) {
      this._enabled = true;
      this.didSetEnabled(true);
    } else if (!enabled && this._enabled) {
      this._enabled = false;
      this.didSetEnabled(false);
    }
  }

  protected didSetEnabled(enabled: boolean): void {
    if (enabled) {
      this.animate();
    } else {
      this.cancel();
    }
  }

  abstract cancel(): void;

  duration(): number;
  duration(duration: number): this;
  duration(duration?: number): number | this {
    if (duration === void 0) {
      return this._duration;
    } else {
      this._duration = Math.max(0, duration);
      return this;
    }
  }

  ease(): Ease;
  ease(ease: AnyEase): this;
  ease(ease?: AnyEase): Ease | this {
    if (ease === void 0) {
      return this._ease;
    } else {
      this._ease = Ease.fromAny(ease);
      return this;
    }
  }

  interpolator(): Interpolator<T, unknown> | null;
  interpolator(interpolator: Interpolator<T, unknown> | null): this;
  interpolator(interpolator?: Interpolator<T, unknown> | null): Interpolator<T, unknown> | null | this {
    if (interpolator === void 0) {
      return this._interpolator;
    } else {
      this._interpolator = interpolator;
      return this;
    }
  }

  transition(): Transition<T>;
  transition(transition: AnyTransition<T>): this;
  transition(transition?: AnyTransition<T>): Transition<T> | this {
    if (transition === void 0) {
      return new Transition(this._duration, this._ease, this._interpolator, null);
    } else {
      transition = Transition.fromAny(transition);
      if (transition._duration !== void 0) {
        this._duration = transition._duration;
      }
      if (transition._ease !== void 0) {
        this._ease = transition._ease;
      }
      if (transition._interpolator !== void 0) {
        this._interpolator = transition._interpolator;
      }
      if (transition._observers !== void 0) {
        let observers = this._observers;
        if (observers === null) {
          observers = [];
          this._observers = observers;
        }
        Array.prototype.push.apply(observers, transition._observers);
      }
      return this;
    }
  }

  range(): ReadonlyArray<T> | null;
  range(ys: ReadonlyArray<T>): this;
  range(y0: T | undefined, y1: T | undefined): this;
  range(y0?: ReadonlyArray<T> | T, y1?: T): ReadonlyArray<T> | null | this {
    const interpolator = this._interpolator;
    if (arguments.length === 0) {
      return interpolator !== null ? interpolator.range() : null;
    } else {
      if (arguments.length === 1) {
        y0 = y0 as ReadonlyArray<T>;
        y1 = y0[1];
        y0 = y0[0];
      }
      if (y1 === void 0) {
        y1 = y0 as T | undefined;
      } else if (y0 === void 0) {
        y0 = y1;
      }
      if (y0 !== void 0 && y1 !== void 0) {
        if (interpolator !== null) {
          this._interpolator = interpolator.range(y0 as T, y1);
        } else {
          this._interpolator = Interpolator.between(y0 as T, y1);
        }
      }
      return this;
    }
  }

  observers(): ReadonlyArray<TransitionObserver<T>> | null;
  observers(observers: ReadonlyArray<TransitionObserver<T>> | null): this;
  observers(observers?: ReadonlyArray<TransitionObserver<T>> | null): ReadonlyArray<TransitionObserver<T>> | null | this {
    if (observers === void 0) {
      return this._observers;
    } else {
      this._observers = observers !== null ? observers.slice(0) : null;
      return this;
    }
  }

  get value(): T | undefined {
    return this._value;
  }

  get state(): T | undefined {
    return this._state;
  }

  setState(state: T | undefined, tween: Tween<T> = null): void {
    const interrupts = this._observers; // get current transition observers
    this._observers = null;
    if (Transition.isAny(tween)) {
      tween = Transition.fromAny(tween);
      this.transition(tween); // may update transition observers
    } else if (tween === false || tween === null) {
      this._duration = 0;
    }
    this._interrupts = interrupts; // stash interrupted transition observers

    if (state === void 0 || !tween) {
      this._state = state;
      this._beginTime = 0;
      if (this._tweenState === TweenState.Tracking) {
        this.doInterrupt(this._value);
      }
      this._tweenState = TweenState.Quiesced;
      const oldValue = this._value;
      this._value = state;
      this._interpolator = null;
      this.cancel();
      if (state !== void 0) {
        this.update(state, oldValue);
      } else {
        this.delete();
      }
    } else if (this._tweenState !== TweenState.Quiesced || !Objects.equal(this._state, state)) {
      const value = this.value;
      this.range(value, state);
      this._state = state;
      this._beginTime = 0;
      if (this._tweenState === TweenState.Tracking) {
        this._tweenState = TweenState.Interrupt;
      } else {
        this._tweenState = TweenState.Diverged;
      }
      this.animate();
    }
  }

  onFrame(t: number): void {
    if (this._tweenState === TweenState.Quiesced || !this._enabled) {
      return;
    }

    if (this._tweenState === TweenState.Interrupt) {
      this.doInterrupt(this._value);
      this._tweenState = TweenState.Diverged;
    }

    if (this._tweenState === TweenState.Diverged) {
      if (!Objects.equal(this._value, this._state)) {
        this._beginTime = t;
        this.doBegin(this._value);
        this._tweenState = TweenState.Tracking;
      } else {
        this.tween(1);
      }
    }

    if (this._tweenState === TweenState.Tracking) {
      const u = this._duration !== 0 ? Math.min(Math.max(0, (t - this._beginTime) / this._duration), 1) : 1;
      this.tween(u);
    }

    if (this._tweenState === TweenState.Converged) {
      this._interrupts = null;
      this._beginTime = 0;
      this._tweenState = TweenState.Quiesced;
      this.doEnd(this._value);
    } else {
      this.animate();
    }
  }

  interpolate(u: number): T | undefined {
    const interpolator = this._interpolator;
    return interpolator !== null ? interpolator.interpolate(u) : this._state;
  }

  tween(u: number): void {
    u = this._ease(u);
    const oldValue = this._value;
    const newValue = this.interpolate(u);
    this._value = newValue;
    this.update(newValue, oldValue);
    if (u === 1) {
      this._tweenState = TweenState.Converged;
    }
  }

  abstract update(newValue: T | undefined, oldValue: T | undefined): void;

  abstract delete(): void;

  /** @hidden */
  protected doBegin(value: T | undefined): void {
    this.onBegin(value);
    const observers = this._observers;
    if (observers !== null) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i];
        if (observer.onBegin !== void 0) {
          observer.onBegin(value);
        }
      }
    }
  }

  protected onBegin(value: T | undefined): void {
    // hook
  }

  /** @hidden */
  protected doEnd(value: T | undefined): void {
    this.onEnd(value);
    const observers = this._observers;
    if (observers !== null) {
      this._observers = null;
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i];
        if (observer.onEnd !== void 0) {
          observer.onEnd(value);
        }
      }
    }
  }

  protected onEnd(value: T | undefined): void {
    // hook
  }

  /** @hidden */
  protected doInterrupt(value: T | undefined): void {
    this.onInterrupt(value);
    const interrupts = this._interrupts;
    if (interrupts !== null) {
      this._interrupts = null;
      for (let i = 0, n = interrupts.length; i < n; i += 1) {
        const interrupt = interrupts[i];
        if (interrupt.onInterrupt !== void 0) {
          interrupt.onInterrupt(value);
        }
      }
    }
  }

  protected onInterrupt(value: T | undefined): void {
    // hook
  }
}
