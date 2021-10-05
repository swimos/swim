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

import {Mutable, FromAny, AnyTiming, Timing, Easing, Interpolator} from "@swim/util";
import {Affinity} from "../fastener/Affinity";
import {FastenerContext} from "../fastener/FastenerContext";
import type {FastenerOwner, FastenerFlags} from "../fastener/Fastener";
import {PropertyInit, PropertyClass, Property} from "../property/Property";
import {StringAnimator} from "./"; // forward import
import {NumberAnimator} from "./"; // forward import
import {BooleanAnimator} from "./"; // forward import

export type AnimatorMemberState<O, K extends keyof O> =
  O[K] extends Animator<any, infer T> ? T : never;

export type AnimatorMemberStateInit<O, K extends keyof O> =
  O[K] extends Animator<any, any, infer U> ? U : never;

export type AnimatorMemberKey<O, K extends keyof O> =
  O[K] extends Property<any, any> ? K : never;

export type AnimatorMemberInit<O, K extends keyof O> =
  O[K] extends Animator<any, infer T, infer U> ? T | U : never;

export type AnimatorMemberInitMap<O> = {
  -readonly [K in keyof O as AnimatorMemberKey<O, K>]?: AnimatorMemberInit<O, K>;
};

export type AnimatorState<A extends Animator<any, any>> =
  A extends Animator<any, infer T, any> ? T : never;

export type AnimatorStateInit<A extends Animator<any, any>> =
  A extends Animator<any, infer T, infer U> ? T | U : never;

export interface AnimatorInit<T = unknown, U = never> extends PropertyInit<T, U> {
  willSetValue?(newValue: T, oldValue: T): void;
  didSetValue?(newValue: T, oldValue: T): void;

  willStartTweening?(): void;
  didStartTweening?(): void;
  willStopTweening?(): void;
  didStopTweening?(): void;

  willTransition?(oldValue: T): void;
  didTransition?(newValue: T): void;
  didInterrupt?(value: T): void;
}

export type AnimatorDescriptor<O = unknown, T = unknown, U = never, I = {}> = ThisType<Animator<O, T, U> & I> & AnimatorInit<T, U> & Partial<I>;

export interface AnimatorClass<A extends Animator<any, any> = Animator<any, any, any>> extends PropertyClass<A> {
  create(this: AnimatorClass<A>, owner: FastenerOwner<A>, animatorName: string): A;

  construct(animatorClass: AnimatorClass, animator: A | null, owner: FastenerOwner<A>, animatorName: string): A;

  specialize(type: unknown): AnimatorClass | null;

  extend(this: AnimatorClass<A>, classMembers?: {} | null): AnimatorClass<A>;

  define<O, T, U = never, I = {}>(descriptor: {extends: AnimatorClass | null} & AnimatorDescriptor<O, T, U, I>): AnimatorClass<Animator<any, T, U> & I>;
  define<O, T, U = never>(descriptor: AnimatorDescriptor<O, T, U>): AnimatorClass<Animator<any, T, U>>;

  <O, T extends string | undefined = string | undefined, U extends string | undefined = string | undefined>(descriptor: {type: typeof String} & AnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends number | undefined = number | undefined, U extends number | string | undefined = number | string | undefined>(descriptor: {type: typeof Number} & AnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends boolean | undefined = boolean | undefined, U extends boolean | string | undefined = boolean | string | undefined>(descriptor: {type: typeof Boolean} & AnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = never>(descriptor: ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & AnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = never, I = {}>(descriptor: {extends: AnimatorClass | null} & AnimatorDescriptor<O, T, U, I>): PropertyDecorator;
  <O, T, U = never>(descriptor: AnimatorDescriptor<O, T, U>): PropertyDecorator;

  /** @internal */
  readonly TweeningFlag: FastenerFlags;
  /** @internal */
  readonly DivergedFlag: FastenerFlags;
  /** @internal */
  readonly InterruptFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

export interface Animator<O = unknown, T = unknown, U = never> extends Property<O, T, U> {
  (): T;
  (newState: T | U, timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): O;
  (newState: T | U, timing?: AnyTiming | boolean | null, affinity?: Affinity): O;

  /** @protected @override */
  onInherit(superFastener: Property<unknown, T>): void;

  setState(newState: T | U, timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  /** @override */
  setState(newState: T | U, timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  /** @protected @override */
  onSetState(newState: T, oldState: T): void;

  get superValue(): T | undefined;

  getSuperValue(): NonNullable<T>;

  getSuperValueOr<E>(elseValue: E): NonNullable<T> | E;

  readonly value: T;

  getValue(): NonNullable<T>;

  getValueOr<E>(elseValue: E): NonNullable<T> | E;

  setValue(newValue: T, oldValue?: T): void;

  /** @protected */
  willSetValue(newValue: T, oldValue: T): void;

  /** @protected */
  onSetValue(newValue: T, oldValue: T): void;

  /** @protected */
  didSetValue(newValue: T, oldValue: T): void;

  readonly timing: Timing | null;

  readonly interpolator: Interpolator<T> | null;

  setInterpolatedValue(newValue: T, newState?: T): void;

  /** @internal @protected @override */
  decohereSubFastener(subFastener: Property<unknown, T>): void;

  /** @override */
  recohere(t: number): void;

  /** @internal @protected */
  tween(t: number): void;

  /** @internal @protected */
  tweenInherited(t: number): void;

  /**
   * Returns `true` if this animator is actively transitioning to a new `state`.
   */
  get tweening(): boolean;

  /** @internal */
  startTweening(): void;

  /** @protected */
  willStartTweening(): void;

  /** @protected */
  onStartTweening(): void;

  /** @protected */
  didStartTweening(): void;

  /** @internal */
  stopTweening(): void;

  /** @protected */
  willStopTweening(): void;

  /** @protected */
  onStopTweening(): void;

  /** @protected */
  didStopTweening(): void;

  /** @internal @protected */
  willTransition(oldValue: T): void;

  /** @internal @protected */
  didTransition(newValue: T): void;

  /** @internal @protected */
  didInterrupt(value: T): void;

  /** @protected @override */
  onUnmount(): void;
}

export const Animator = (function (_super: typeof Property) {
  const Animator = _super.extend() as AnimatorClass;

  Animator.prototype.onInherit = function <T>(this: Animator<unknown, T>, superFastener: Property<unknown, T>): void {
    const newState = superFastener.state;
    const oldState = this.state;
    const stateChanged = !this.equalState(newState, oldState);
    if (stateChanged) {
      this.willSetState(newState, oldState);
      (this as Mutable<typeof this>).state = newState;
      (this as Mutable<typeof this>).timing = null;
      (this as Mutable<typeof this>).interpolator = null;
      this.onSetState(newState, oldState);
    }
    if (superFastener instanceof Animator) {
      this.setValue(superFastener.value);
    } else {
      this.setValue(newState);
    }
    if (stateChanged) {
      this.didSetState(newState, oldState);
      if (this.tweening) {
        this.didInterrupt(this.value);
      }
    }
    if (superFastener instanceof Animator && superFastener.tweening) {
      this.startTweening();
    } else {
      this.stopTweening();
    }
  };

  Animator.prototype.setState = function <T, U>(this: Animator<unknown, T, U>, newState: T | U, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    if (typeof timing === "number") {
      affinity = timing;
      timing = void 0;
    }

    if (this.minAffinity(affinity)) {
      newState = this.fromAny(newState);
      const oldState = this.state;
      if (!this.equalState(newState, oldState)) {
        if (timing === void 0 || timing === null || timing === false) {
          timing = false;
        } else if (timing === true) {
          timing = this.timing !== null ? this.timing : false;
        } else {
          timing = Timing.fromAny(timing);
        }

        const animated = timing !== false && this.isDefined(oldState);

        this.willSetState(newState, oldState);

        (this as Mutable<typeof this>).state = newState;

        if (animated) {
          (this as Mutable<typeof this>).timing = timing as Timing;
          (this as Mutable<typeof this>).interpolator = Interpolator(this.value, newState);
          if (this.tweening) {
            this.setFlags(this.flags | (Animator.DivergedFlag | Animator.InterruptFlag));
          } else {
            this.setFlags(this.flags | Animator.DivergedFlag);
          }
        } else {
          (this as Mutable<typeof this>).timing = null;
          (this as Mutable<typeof this>).interpolator = null;
        }

        this.onSetState(newState, oldState);

        if (!animated) {
          this.setValue(newState);
        }

        this.didSetState(newState, oldState);

        if (animated) {
          this.startTweening();
        } else {
          if (this.tweening) {
            this.didInterrupt(this.value);
            this.stopTweening();
          }
        }
      }
    }
  };

  Animator.prototype.onSetState = function <T>(this: Animator<unknown, T>, newState: T, oldState: T): void {
    // suppress super
  };

  Object.defineProperty(Animator.prototype, "superValue", {
    get: function <T>(this: Animator<unknown, T>): T | undefined {
      const superFastener = this.superFastener;
      return superFastener instanceof Animator ? superFastener.value : void 0;
    },
    configurable: true,
  });

  Animator.prototype.getSuperValue = function <T>(this: Animator<unknown, T>): NonNullable<T> {
    const superValue = this.superValue;
    if (superValue === void 0 || superValue === null) {
      throw new TypeError(superValue + " " + this.name + " super value");
    }
    return superValue as NonNullable<T>;
  };

  Animator.prototype.getSuperValueOr = function <T, E>(this: Animator<unknown, T>, elseValue: E): NonNullable<T> | E {
    let superValue: T | E | undefined = this.superValue;
    if (superValue === void 0 || superValue === null) {
      superValue = elseValue;
    }
    return superValue as NonNullable<T> | E;
  };

  Animator.prototype.getValue = function <T>(this: Animator<unknown, T>): NonNullable<T> {
    const value = this.value;
    if (value === void 0 || value === null) {
      throw new TypeError(value + " " + this.name + " value");
    }
    return value as NonNullable<T>;
  };

  Animator.prototype.getValueOr = function <T, E>(this: Animator<unknown, T>, elseValue: E): NonNullable<T> | E {
    let value: T | E = this.value;
    if (value === void 0 || value === null) {
      value = elseValue;
    }
    return value as NonNullable<T> | E;
  };

  Animator.prototype.setValue = function <T>(this: Animator<unknown, T>, newValue: T, oldValue?: T): void {
    if (arguments.length === 1) {
      oldValue = this.value;
    }
    if (!this.equalState(newValue, oldValue)) {
      this.willSetValue(newValue, oldValue!);
      (this as Mutable<typeof this>).value = newValue;
      this.onSetValue(newValue, oldValue!);
      this.didSetValue(newValue, oldValue!);
      this.decohereSubFasteners();
    }
  };

  Animator.prototype.willSetValue = function <T>(this: Animator<unknown, T>, newValue: T, oldValue: T): void {
    // hook
  };

  Animator.prototype.onSetValue = function <T>(this: Animator<unknown, T>, newValue: T, oldValue: T): void {
    const updateFlags = this.updateFlags;
    const fastenerContext = this.owner;
    if (updateFlags !== void 0 && FastenerContext.has(fastenerContext, "requireUpdate")) {
      fastenerContext.requireUpdate(updateFlags);
    }
  };

  Animator.prototype.didSetValue = function <T>(this: Animator<unknown, T>, newValue: T, oldValue: T): void {
    // hook
  };

  Animator.prototype.setInterpolatedValue = function <T>(this: Animator<unknown, T>, newValue: T, newState?: T): void {
    const oldState = arguments.length > 1 ? this.state : void 0;
    const stateChanged = arguments.length > 1 && !this.equalState(newState!, oldState);
    if (stateChanged) {
      this.willSetState(newState!, oldState!);
      (this as Mutable<typeof this>).state = newState!;
      (this as Mutable<typeof this>).timing = null;
      (this as Mutable<typeof this>).interpolator = null;
      this.onSetState(newState!, oldState!);
    }
    this.setValue(newValue);
    if (stateChanged) {
      this.didSetState(newState!, oldState!);
      if (this.tweening) {
        this.didInterrupt(this.value);
        this.stopTweening();
      }
    }
  };

  Animator.prototype.decohereSubFastener = function (this: Animator, subFastener: Property): void {
    if (!subFastener.inherited && Math.min(this.affinity, Affinity.Intrinsic) >= subFastener.affinity) {
      subFastener.setInherited(true, this);
    } else if (subFastener.inherited) {
      if (this.tweening && subFastener instanceof Animator) {
        subFastener.startTweening();
      }
      if (subFastener.coherent) {
        subFastener.setCoherent(false);
        subFastener.decohere();
      }
    }
  };

  Animator.prototype.recohere = function <T>(this: Animator<unknown, T>, t: number): void {
    if (this.inherited) {
      this.tweenInherited(t);
    } else if (this.tweening) {
      this.tween(t);
    }
  };

  Animator.prototype.tween = function <T>(this: Animator<unknown, T>, t: number): void {
    const oldValue = this.value;

    let timing = this.timing;
    if (timing === null) {
      timing = Easing.linear.withDomain(t, t);
      (this as Mutable<typeof this>).timing = timing;
    }

    let interpolator = this.interpolator;
    if (interpolator === null) {
      interpolator = Interpolator(oldValue, this.state);
      (this as Mutable<typeof this>).interpolator = interpolator;
    }

    if ((this.flags & Animator.InterruptFlag) !== 0) {
      this.setFlags(this.flags & ~Animator.InterruptFlag);
      this.didInterrupt(oldValue);
    }

    if ((this.flags & Animator.DivergedFlag) !== 0) {
      this.setFlags(this.flags & ~Animator.DivergedFlag);
      if (!this.equalState(this.state, oldValue)) {
        timing = timing.withDomain(t, t + timing.duration);
      } else {
        timing = timing.withDomain(t - timing.duration, t);
      }
      (this as Mutable<typeof this>).timing = timing;
      this.willTransition(oldValue);
    }

    const u = timing(t);
    const newValue = interpolator(u);
    this.setValue(newValue);

    if (u < 1) {
      this.decohere();
    } else if (this.tweening) {
      this.stopTweening();
      (this as Mutable<typeof this>).interpolator = null;
      this.didTransition(newValue);
    } else {
      this.setCoherent(true);
    }
  };

  Animator.prototype.tweenInherited = function <T>(this: Animator<unknown, T>, t: number): void {
    const superFastener = this.superFastener;
    if (superFastener !== null) {
      const newState = superFastener.state;
      const oldState = this.state;
      const stateChanged = !this.equalState(newState, oldState);
      if (stateChanged) {
        this.willSetState(newState, oldState);
        (this as Mutable<typeof this>).state = newState!;
        (this as Mutable<typeof this>).timing = null;
        (this as Mutable<typeof this>).interpolator = null;
        this.onSetState(newState, oldState);
      }

      if (superFastener instanceof Animator) {
        this.setValue(superFastener.value);
      } else {
        this.setValue(superFastener.state);
      }

      if (stateChanged) {
        this.didSetState(newState, oldState!);
        if (this.tweening) {
          this.didInterrupt(this.value);
        }
      }

      if (superFastener instanceof Animator && superFastener.tweening) {
        this.decohere();
      } else if (this.tweening) {
        this.stopTweening();
      } else {
        this.setCoherent(true);
      }
    } else {
      this.stopTweening();
    }
  };

  Object.defineProperty(Animator.prototype, "tweening", {
    get: function (this: Animator): boolean {
      return (this.flags & Animator.TweeningFlag) !== 0;
    },
    configurable: true,
  });

  Animator.prototype.startTweening = function (this: Animator): void {
    if ((this.flags & Animator.TweeningFlag) === 0) {
      this.willStartTweening();
      this.setFlags(this.flags | Animator.TweeningFlag);
      this.onStartTweening();
      this.didStartTweening();
    }
  };

  Animator.prototype.willStartTweening = function (this: Animator): void {
    // hook
  };

  Animator.prototype.onStartTweening = function (this: Animator): void {
    if (this.coherent) {
      this.setCoherent(false);
      this.decohere();
    }
    this.decohereSubFasteners();
  };

  Animator.prototype.didStartTweening = function (this: Animator): void {
    // hook
  };

  Animator.prototype.stopTweening = function (this: Animator): void {
    if ((this.flags & Animator.TweeningFlag) !== 0) {
      this.willStopTweening();
      this.setFlags(this.flags & ~Animator.TweeningFlag);
      this.onStopTweening();
      this.didStopTweening();
    }
  };

  Animator.prototype.willStopTweening = function (this: Animator): void {
    // hook
  };

  Animator.prototype.onStopTweening = function (this: Animator): void {
    this.setCoherent(true);
  };

  Animator.prototype.didStopTweening = function (this: Animator): void {
    // hook
  };

  Animator.prototype.willTransition = function <T>(this: Animator<unknown, T>, oldValue: T): void {
    // hook
  };

  Animator.prototype.didTransition = function <T>(this: Animator<unknown, T>, newValue: T): void {
    // hook
  };

  Animator.prototype.didInterrupt = function <T>(this: Animator<unknown, T>, value: T): void {
    // hook
  };

  Animator.prototype.onUnmount = function (this: Animator): void {
    this.stopTweening();
    _super.prototype.onUnmount.call(this);
  };

  Animator.construct = function <A extends Animator<any, any>>(animatorClass: AnimatorClass, animator: A | null, owner: FastenerOwner<A>, animatorName: string): A {
    if (animator === null) {
      animator = function Animator(state?: AnimatorStateInit<A>, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): AnimatorState<A> | FastenerOwner<A> {
        if (arguments.length === 0) {
          return animator!.value;
        } else {
          if (arguments.length === 2) {
            animator!.setState(state!, timing);
          } else {
            animator!.setState(state!, timing as AnyTiming | boolean | null | undefined, affinity);
          }
          return animator!.owner;
        }
      } as A;
      Object.setPrototypeOf(animator, animatorClass.prototype);
    }
    animator = _super.construct(animatorClass, animator, owner, animatorName) as A;
    (animator as Mutable<typeof animator>).value = animator.state;
    (animator as Mutable<typeof animator>).timing = null;
    (animator as Mutable<typeof animator>).interpolator = null;
    return animator;
  };

  Animator.specialize = function (type: unknown): AnimatorClass | null {
    if (type === String) {
      return StringAnimator;
    } else if (type === Number) {
      return NumberAnimator;
    } else if (type === Boolean) {
      return BooleanAnimator;
    }
    return null;
  };

  Animator.define = function <O, T, U>(descriptor: AnimatorDescriptor<O, T, U>): AnimatorClass<Animator<any, T, U>> {
    let superClass = descriptor.extends as AnimatorClass | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const state = descriptor.state;
    const initState = descriptor.initState;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.state;
    delete descriptor.initState;

    if (superClass === void 0 || superClass === null) {
      superClass = this.specialize(descriptor.type);
    }
    if (superClass === null) {
      superClass = this;
      if (descriptor.fromAny === void 0 && FromAny.is<T, U>(descriptor.type)) {
        descriptor.fromAny = descriptor.type.fromAny;
      }
    }

    const animatorClass = superClass.extend(descriptor);

    animatorClass.construct = function (animatorClass: AnimatorClass, animator: Animator<O, T, U> | null, owner: O, animatorName: string): Animator<O, T, U> {
      animator = superClass!.construct(animatorClass, animator, owner, animatorName);
      if (affinity !== void 0) {
        animator.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        animator.initInherits(inherits);
      }
      if (initState !== void 0) {
        (animator as Mutable<typeof animator>).state = animator.fromAny(initState());
        (animator as Mutable<typeof animator>).value = animator.state;
      } else if (state !== void 0) {
        (animator as Mutable<typeof animator>).state = animator.fromAny(state);
        (animator as Mutable<typeof animator>).value = animator.state;
      }
      return animator;
    };

    return animatorClass;
  };

  (Animator as Mutable<typeof Animator>).TweeningFlag = 1 << (_super.FlagShift + 0);
  (Animator as Mutable<typeof Animator>).DivergedFlag = 1 << (_super.FlagShift + 1);
  (Animator as Mutable<typeof Animator>).InterruptFlag = 1 << (_super.FlagShift + 2);

  (Animator as Mutable<typeof Animator>).FlagShift = _super.FlagShift + 3;
  (Animator as Mutable<typeof Animator>).FlagMask = (1 << Animator.FlagShift) - 1;

  return Animator;
})(Property);
