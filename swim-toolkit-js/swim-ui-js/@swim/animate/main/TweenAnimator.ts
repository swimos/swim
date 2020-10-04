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
import {AnyEase, Ease, Tween, AnyTransition, Transition} from "@swim/transition";
import {TransitionObserver} from "@swim/transition";
import {Animator} from "./Animator";

export type TweenAnimatorFlags = number;

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
  _value: T;
  /** @hidden */
  _state: T;
  /** @hidden */
  _baseTime: number;
  /** @hidden */
  _animatorFlags: TweenAnimatorFlags;

  constructor(value: T, transition: Transition<T> | null) {
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
    if (value !== void 0) {
      this._value = value;
      this._state = value;
    }
    this._baseTime = 0;
    this._animatorFlags = TweenAnimator.UpdatedFlag;
  }

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

  disabled(): boolean;
  disabled(disabled: boolean): this;
  disabled(disabled?: boolean): boolean | this {
    if (disabled === void 0) {
      return (this._animatorFlags & TweenAnimator.DisabledFlag) !== 0;
    } else {
      if (disabled && (this._animatorFlags & TweenAnimator.DisabledFlag) === 0) {
        this._animatorFlags |= TweenAnimator.DisabledFlag;
        this.didDisable();
      } else if (!disabled && (this._animatorFlags & TweenAnimator.DisabledFlag) !== 0) {
        this._animatorFlags &= ~TweenAnimator.DisabledFlag;
        this.didEnable();
      }
      return this;
    }
  }

  protected didDisable(): void {
    this.cancel();
  }

  protected didEnable(): void {
    this.animate();
  }

  cancel(): void {
    // nop
  }

  isTweening(): boolean {
    return (this._animatorFlags & TweenAnimator.TweeningFlag) !== 0;
  }

  isUpdated(): boolean {
    return (this._animatorFlags & TweenAnimator.UpdatedFlag) !== 0;
  }

  get value(): T {
    return this._value;
  }

  get state(): T {
    return this._state;
  }

  setState(newState: T, tween: Tween<T> = null): void {
    const oldState = this._state;
    if (newState === void 0 || tween === false || tween === null) {
      this.willSetState(newState, oldState);
      this._duration = 0;
      this._state = newState;
      this._baseTime = 0;
      if ((this._animatorFlags & TweenAnimator.TweeningFlag) !== 0) {
        this._animatorFlags &= ~TweenAnimator.TweeningFlag;
        this.doInterrupt(this._value);
      }
      const oldValue = this._value;
      this._value = newState;
      this._interpolator = null;
      this.onSetState(newState, oldState);
      this.cancel();
      this.update(newState, oldValue);
      this.didSetState(newState, oldState);
    } else if (!Objects.equal(oldState, newState)) {
      this.willSetState(newState, oldState);
      if (tween !== true) {
        const interrupts = this._observers; // get current transition observers
        this._observers = null;
        this.transition(tween); // may update transition observers
        this._interrupts = interrupts; // stash interrupted transition observers
      }
      const value = this.value;
      if (this._interpolator !== null && value !== void 0) {
        this._interpolator = this._interpolator.range(value, newState);
      } else if (value !== void 0) {
        this._interpolator = Interpolator.between<T, unknown>(value, newState);
      } else {
        this._interpolator = Interpolator.between<T, unknown>(newState, newState);
      }
      this._state = newState;
      this._baseTime = 0;
      if ((this._animatorFlags & TweenAnimator.TweeningFlag) !== 0) {
        this._animatorFlags |= TweenAnimator.InterruptFlag | TweenAnimator.DivergedFlag;
      } else {
        this._animatorFlags |= TweenAnimator.TweeningFlag | TweenAnimator.DivergedFlag;
      }
      this.onSetState(newState, oldState);
      this.animate();
      this.didSetState(newState, oldState);
    } else if (tween !== true) {
      tween = Transition.fromAny(tween);
      // add observers to current transition
      let observers = this._observers;
      if (observers === null) {
        observers = [];
        this._observers = observers;
      }
      Array.prototype.push.apply(observers, tween._observers);
      // immediately complete quiesced transitions
      if ((this._animatorFlags & TweenAnimator.TweeningFlag) === 0) {
        this.doEnd(this._value);
      }
    }
  }

  protected willSetState(newState: T, oldState: T): void {
    // hook
  }

  protected onSetState(newState: T, oldState: T): void {
    // hook
  }

  protected didSetState(newState: T, oldState: T): void {
    // hook
  }

  onAnimate(t: number): void {
    if ((this._animatorFlags & (TweenAnimator.TweeningFlag | TweenAnimator.DisabledFlag)
                             ^ TweenAnimator.TweeningFlag) === 0) {
      if ((this._animatorFlags & TweenAnimator.InterruptFlag) !== 0) {
        this._animatorFlags &= ~TweenAnimator.InterruptFlag;
        this.doInterrupt(this._value);
      }

      if ((this._animatorFlags & TweenAnimator.DivergedFlag) !== 0) {
        this._animatorFlags &= ~TweenAnimator.DivergedFlag;
        this.doBegin(this._value);
        if (!Objects.equal(this._value, this._state)) {
          this._baseTime = t;
        } else {
          this.tween(1);
        }
      }

      if ((this._animatorFlags & TweenAnimator.TweeningFlag) !== 0) {
        const u = this._duration !== 0 ? Math.min(Math.max(0, (t - this._baseTime) / this._duration), 1) : 1;
        this.tween(u);
      }

      if ((this._animatorFlags & TweenAnimator.TweeningFlag) !== 0) {
        this.animate();
      } else {
        this._interrupts = null;
        this._baseTime = 0;
        this.doEnd(this._value);
      }
    } else {
      this.onIdle();
    }
  }

  interpolate(u: number): T {
    const interpolator = this._interpolator;
    return interpolator !== null ? interpolator.interpolate(u) : this._state;
  }

  tween(u: number): void {
    u = this._ease(u);
    const oldValue = this._value;
    const newValue = this.interpolate(u);
    this.update(newValue, oldValue);
    if (u === 1) {
      this._animatorFlags &= ~TweenAnimator.TweeningFlag;
    }
  }

  update(newValue: T, oldValue: T): void {
    if (!Objects.equal(oldValue, newValue)) {
      this.willUpdate(newValue, oldValue);
      this._value = newValue;
      this._animatorFlags |= TweenAnimator.UpdatedFlag;
      this.onUpdate(newValue, oldValue);
      this.didUpdate(newValue, oldValue);
    }
  }

  willUpdate(newValue: T, oldValue: T): void {
    // hook
  }

  onUpdate(newValue: T, oldValue: T): void {
    // hook
  }

  didUpdate(newValue: T, oldValue: T): void {
    // hook
  }

  /** @hidden */
  protected doBegin(value: T): void {
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

  protected onBegin(value: T): void {
    // hook
  }

  /** @hidden */
  protected doEnd(value: T): void {
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

  protected onEnd(value: T): void {
    // hook
  }

  /** @hidden */
  protected doInterrupt(value: T): void {
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

  protected onInterrupt(value: T): void {
    // hook
  }

  /** @hidden */
  protected onIdle(): void {
    this._animatorFlags &= ~TweenAnimator.UpdatedFlag;
  }

  /** @hidden */
  static TweeningFlag: TweenAnimatorFlags = 1 << 0;
  /** @hidden */
  static DivergedFlag: TweenAnimatorFlags = 1 << 1;
  /** @hidden */
  static InterruptFlag: TweenAnimatorFlags = 1 << 2;
  /** @hidden */
  static DisabledFlag: TweenAnimatorFlags = 1 << 3;
  /** @hidden */
  static UpdatedFlag: TweenAnimatorFlags = 1 << 4;
  /** @hidden */
  static OverrideFlag: TweenAnimatorFlags = 1 << 5;
  /** @hidden */
  static InheritedFlag: TweenAnimatorFlags = 1 << 6;

  /** @hidden */
  static AnimatorFlagsShift: number = 8;
}
