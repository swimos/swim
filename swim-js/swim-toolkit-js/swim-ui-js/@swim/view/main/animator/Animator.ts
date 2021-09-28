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

import {Equals, Mutable, AnyTiming, Timing, Easing, Interpolator} from "@swim/util";
import type {Look} from "@swim/theme";
import {ViewPrecedence, View} from "../View";
import type {AnimationTrack} from "../animation/AnimationTrack";

export type AnimatorFlags = number;

export abstract class Animator<T> implements AnimationTrack {
  constructor() {
    this.ownValue = void 0 as unknown as T;
    this.ownState = void 0 as unknown as T;
    this.ownLook = null;
    this.timing = null;
    this.interpolator = null;
    this.precedence = View.Intrinsic;
    this.animatorFlags = Animator.UpdatedFlag;
  }

  isDefined(value: T): boolean {
    return value !== void 0 && value !== null;
  }

  /** @hidden */
  readonly ownValue: T;

  get value(): T {
    return this.ownValue;
  }

  getValue(): NonNullable<T> {
    const value = this.value;
    if (value === void 0 || value === null) {
      throw new TypeError(value + " " + (this instanceof Function ? this.name : "animator") + " value");
    }
    return value as NonNullable<T>;
  }

  getValueOr<E>(elseValue: E): NonNullable<T> | E {
    let value: T | E = this.value;
    if (value === void 0 || value === null) {
      value = elseValue
    }
    return value as NonNullable<T> | E;
  }

  setValue(newValue: T, oldValue?: T): void {
    if (arguments.length === 1) {
      oldValue = this.value;
    }
    if (!this.equalState(newValue, oldValue)) {
      this.willSetValue(newValue, oldValue!);
      (this as Mutable<this>).ownValue = newValue;
      this.setAnimatorFlags(this.animatorFlags | Animator.UpdatedFlag);
      this.onSetValue(newValue, oldValue!);
      this.didSetValue(newValue, oldValue!);
    }
  }

  willSetValue(newValue: T, oldValue: T): void {
    // hook
  }

  onSetValue(newValue: T, oldValue: T): void {
    // hook
  }

  didSetValue(newValue: T, oldValue: T): void {
    // hook
  }

  /** @hidden */
  setIntermediateValue(newValue: T, newState?: T): void {
    const oldState = arguments.length > 1 ? this.state : void 0;
    const stateChanged = arguments.length > 1 && !this.equalState(newState!, oldState);
    if (stateChanged) {
      this.willSetState(newState!, oldState!);
      (this as Mutable<this>).ownState = newState!;
      (this as Mutable<this>).timing = null;
      (this as Mutable<this>).interpolator = null;
      this.onSetState(newState!, oldState!);
    }
    this.setValue(newValue);
    if (stateChanged) {
      this.didSetState(newState!, oldState!);
      if ((this.animatorFlags & Animator.AnimatingFlag) !== 0) {
        this.onInterrupt(this.value);
        this.stopAnimating();
      }
    }
  }

  /** @hidden */
  readonly ownState: T;

  get state(): T {
    return this.ownState;
  }

  getState(): NonNullable<T> {
    const state = this.state;
    if (state === void 0 || state === null) {
      throw new TypeError(state + " " + (this instanceof Function ? this.name : "animator") + " state");
    }
    return state as NonNullable<T>;
  }

  getStateOr<E>(elseState: E): NonNullable<T> | E {
    let state: T | E = this.state;
    if (state === void 0 || state === null) {
      state = elseState
    }
    return state as NonNullable<T> | E;
  }

  setState(newState: T, precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  setState(newState: T, timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;
  setState(newState: T, timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): void {
    if (typeof timing === "number") {
      precedence = timing;
      timing = void 0;
    } else if (precedence === void 0) {
      precedence = View.Extrinsic;
    }
    if (precedence >= this.precedence) {
      this.setAnimatorFlags(this.animatorFlags & ~Animator.InheritedFlag | Animator.OverrideFlag);
      this.setPrecedence(precedence);
      this.setOwnLook(null, false);
      this.setOwnState(newState, timing);
    }
  }

  /** @hidden */
  setOwnState(newState: T, timing?: AnyTiming | boolean): void {
    const oldState = this.state;
    if (!this.isDefined(oldState)) {
      this.setImmediateState(newState, oldState);
    } else if (!this.equalState(newState, oldState)) {
      if (timing === void 0 || timing === false) {
        timing = false;
      } else if (timing === true) {
        timing = this.timing !== null ? this.timing : false;
      } else {
        timing = Timing.fromAny(timing);
      }
      if (timing === false) {
        this.setImmediateState(newState, oldState);
      } else {
        this.setAnimatedState(newState, oldState, timing as Timing);
      }
    }
  }

  /** @hidden */
  setImmediateState(newState: T, oldState: T): void {
    this.willSetState(newState, oldState);
    (this as Mutable<this>).ownState = newState;
    (this as Mutable<this>).timing = null;
    (this as Mutable<this>).interpolator = null;
    this.onSetState(newState, oldState);
    this.setValue(newState);
    this.didSetState(newState, oldState);
    if ((this.animatorFlags & Animator.AnimatingFlag) !== 0) {
      this.onInterrupt(this.value);
      this.stopAnimating();
    }
  }

  /** @hidden */
  setAnimatedState(newState: T, oldState: T, timing: Timing): void {
    this.willSetState(newState, oldState);
    (this as Mutable<this>).ownState = newState;
    (this as Mutable<this>).timing = timing;
    (this as Mutable<this>).interpolator = Interpolator(this.value, newState);
    if ((this.animatorFlags & Animator.AnimatingFlag) !== 0) {
      this.setAnimatorFlags(this.animatorFlags | (Animator.DivergedFlag | Animator.InterruptFlag));
    } else {
      this.setAnimatorFlags(this.animatorFlags | Animator.DivergedFlag);
    }
    this.onSetState(newState, oldState);
    this.didSetState(newState, oldState);
    this.startAnimating();
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

  /** @hidden */
  readonly ownLook: Look<T> | null;

  get look(): Look<T> | null {
    return this.ownLook;
  }

  setLook(newLook: Look<T> | null, precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  setLook(newLook: Look<T> | null, timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;
  setLook(newLook: Look<T> | null, timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): void {
    if (typeof timing === "number") {
      precedence = timing;
      timing = void 0;
    } else if (precedence === void 0) {
      precedence = View.Extrinsic;
    }
    if (precedence >= this.precedence) {
      this.setAnimatorFlags(this.animatorFlags & ~Animator.InheritedFlag | Animator.OverrideFlag);
      this.setPrecedence(precedence);
      this.setOwnLook(newLook, timing);
    }
  }

  /** @hidden */
  setOwnLook(newLook: Look<T> | null, timing?: AnyTiming | boolean): void {
    const oldLook = this.look;
    if (newLook !== oldLook) {
      if (timing === void 0) {
        timing = false;
      } else {
        timing = Timing.fromAny(timing);
      }
      this.willSetLook(newLook, oldLook, timing as Timing | boolean);
      (this as Mutable<this>).ownLook = newLook;
      this.onSetLook(newLook, oldLook, timing as Timing | boolean);
      this.didSetLook(newLook, oldLook, timing as Timing | boolean);
    }
  }

  willSetLook(newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void {
    // hook
  }

  onSetLook(newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void {
    // hook
  }

  didSetLook(newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void {
    // hook
  }

  readonly timing: Timing | null;

  readonly interpolator: Interpolator<T> | null;

  readonly precedence: ViewPrecedence;

  setPrecedence(newPrecedence: ViewPrecedence): void {
    const oldPrecedence = this.precedence;
    if (newPrecedence !== oldPrecedence) {
      this.willSetPrecedence(newPrecedence, oldPrecedence);
      (this as Mutable<this>).precedence = newPrecedence;
      this.onSetPrecedence(newPrecedence, oldPrecedence);
      this.didSetPrecedence(newPrecedence, oldPrecedence);
    }
  }

  takesPrecedence(precedence: ViewPrecedence): boolean {
    return precedence >= this.precedence;
  }

  /** @hidden */
  willSetPrecedence(newPrecedence: ViewPrecedence, oldPrecedence: ViewPrecedence): void {
    // hook
  }

  /** @hidden */
  onSetPrecedence(newPrecedence: ViewPrecedence, oldPrecedence: ViewPrecedence): void {
    // hook
  }

  /** @hidden */
  didSetPrecedence(newPrecedence: ViewPrecedence, oldPrecedence: ViewPrecedence): void {
    // hook
  }

  /** @hidden */
  readonly animatorFlags: AnimatorFlags;

  /** @hidden */
  setAnimatorFlags(animatorFlags: AnimatorFlags): void {
    (this as Mutable<this>).animatorFlags = animatorFlags;
  }

  /**
   * Returns `true` if this animator is actively transitioning to a new `state`,
   * or if this animator has recently completed a transition to a new `state`.
   * An animator is considered to have recently transitioned to a new `state`
   * when the most recent call to `onAnimate` completed a transition.
   */
  isUpdated(): boolean {
    return (this.animatorFlags & Animator.UpdatedFlag) !== 0;
  }

  get updatedValue(): T | undefined {
    if ((this.animatorFlags & Animator.UpdatedFlag) !== 0) {
      return this.value;
    } else {
      return void 0;
    }
  }

  takeUpdatedValue(): T | undefined {
    const animatorFlags = this.animatorFlags;
    if ((animatorFlags & Animator.UpdatedFlag) !== 0) {
      this.setAnimatorFlags(animatorFlags & ~Animator.UpdatedFlag);
      return this.value;
    } else {
      return void 0;
    }
  }

  takeValue(): T {
    this.setAnimatorFlags(this.animatorFlags & ~Animator.UpdatedFlag);
    return this.value;
  }

  /**
   * Returns `true` if this animator is actively transitioning to a new `state`.
   */
  isAnimating(): boolean {
    return (this.animatorFlags & Animator.AnimatingFlag) !== 0;
  }

  protected startAnimating(): void {
    if ((this.animatorFlags & Animator.AnimatingFlag) === 0) {
      this.willStartAnimating();
      this.setAnimatorFlags(this.animatorFlags | Animator.AnimatingFlag);
      this.onStartAnimating();
      this.didStartAnimating();
    }
  }

  willStartAnimating(): void {
    // hook
  }

  onStartAnimating(): void {
    // hook
  }

  didStartAnimating(): void {
    // hook
  }

  protected stopAnimating(): void {
    if ((this.animatorFlags & Animator.AnimatingFlag) !== 0) {
      this.willStopAnimating();
      this.setAnimatorFlags(this.animatorFlags & ~Animator.AnimatingFlag);
      this.onStopAnimating();
      this.didStopAnimating();
    }
  }

  willStopAnimating(): void {
    // hook
  }

  onStopAnimating(): void {
    // hook
  }

  didStopAnimating(): void {
    // hook
  }

  onAnimate(t: number): void {
    if ((this.animatorFlags & Animator.AnimatingFlag) !== 0) {
      const oldValue = this.value;
      let timing = this.timing;
      if (timing === null) {
        timing = Easing.linear.withDomain(t, t);
        (this as Mutable<this>).timing = timing;
      }
      let interpolator = this.interpolator;
      if (interpolator === null) {
        interpolator = Interpolator(oldValue, this.state);
        (this as Mutable<this>).interpolator = interpolator;
      }

      if ((this.animatorFlags & Animator.InterruptFlag) !== 0) {
        this.setAnimatorFlags(this.animatorFlags & ~Animator.InterruptFlag);
        this.onInterrupt(oldValue);
      }

      if ((this.animatorFlags & Animator.DivergedFlag) !== 0) {
        this.setAnimatorFlags(this.animatorFlags & ~Animator.DivergedFlag);
        if (!this.equalState(this.state, oldValue)) {
          timing = timing.withDomain(t, t + timing.duration);
        } else {
          timing = timing.withDomain(t - timing.duration, t);
        }
        (this as Mutable<this>).timing = timing;
        this.onBegin(oldValue);
      }

      const u = timing(t);
      const newValue = interpolator(u);
      this.setValue(newValue);

      if (u >= 1) {
        this.stopAnimating();
        (this as Mutable<this>).interpolator = null;
        this.onEnd(newValue);
      }
    }
  }

  onBegin(value: T): void {
    // hook
  }

  onEnd(value: T): void {
    // hook
  }

  onInterrupt(value: T): void {
    // hook
  }

  equalState(newState: T, oldState: T | undefined): boolean {
    return Equals(newState, oldState);
  }

  /** @hidden */
  static readonly MountedFlag: AnimatorFlags = 1 << 0;
  /** @hidden */
  static readonly UpdatedFlag: AnimatorFlags = 1 << 1;
  /** @hidden */
  static readonly OverrideFlag: AnimatorFlags = 1 << 2;
  /** @hidden */
  static readonly InheritedFlag: AnimatorFlags = 1 << 3;
  /** @hidden */
  static readonly ConstrainedFlag: AnimatorFlags = 1 << 4;
  /** @hidden */
  static readonly ConstrainingFlag: AnimatorFlags = 1 << 5;
  /** @hidden */
  static readonly AnimatingFlag: AnimatorFlags = 1 << 6;
  /** @hidden */
  static readonly DivergedFlag: AnimatorFlags = 1 << 7;
  /** @hidden */
  static readonly InterruptFlag: AnimatorFlags = 1 << 8;

  /** @hidden */
  static AnimatorFlagsShift: number = 12;
}
