// Copyright 2015-2021 Swim.inc
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
import type {FastenerOwner, FastenerFlags} from "../fastener/Fastener";
import {PropertyInit, PropertyClass, Property} from "../property/Property";
import {StringAnimator} from "./"; // forward import
import {NumberAnimator} from "./"; // forward import
import {BooleanAnimator} from "./"; // forward import

/** @internal */
export type MemberAnimatorValue<O, K extends keyof O> =
  O[K] extends Animator<any, infer T> ? T : never;

/** @internal */
export type MemberAnimatorValueInit<O, K extends keyof O> =
  O[K] extends Animator<any, any, infer U> ? U : never;

/** @internal */
export type MemberAnimatorInit<O, K extends keyof O> =
  O[K] extends Animator<any, infer T, infer U> ? T | U : never;

/** @internal */
export type MemberAnimatorInitMap<O> =
  {-readonly [K in keyof O as O[K] extends Property<any, any> ? K : never]?: MemberAnimatorInit<O, K>};

/** @internal */
export type AnimatorValue<A extends Animator<any, any>> =
  A extends Animator<any, infer T, any> ? T : never;

/** @internal */
export type AnimatorValueInit<A extends Animator<any, any>> =
  A extends Animator<any, infer T, infer U> ? T | U : never;

/** @public */
export interface AnimatorInit<T = unknown, U = never> extends PropertyInit<T, U> {
  extends?: {prototype: Animator<any, any>} | string | boolean | null;

  transformState?(state: T): T;

  willSetState?(newState: T, oldState: T): void;
  didSetState?(newState: T, oldState: T): void;

  willStartTweening?(): void;
  didStartTweening?(): void;
  willStopTweening?(): void;
  didStopTweening?(): void;

  willTransition?(oldValue: T): void;
  didTransition?(newValue: T): void;
  didInterrupt?(value: T): void;
}

/** @public */
export type AnimatorDescriptor<O = unknown, T = unknown, U = T, I = {}> = ThisType<Animator<O, T, U> & I> & AnimatorInit<T, U> & Partial<I>;

/** @public */
export interface AnimatorClass<A extends Animator<any, any> = Animator<any, any>> extends PropertyClass<A> {
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

/** @public */
export interface AnimatorFactory<A extends Animator<any, any> = Animator<any, any>> extends AnimatorClass<A> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): AnimatorFactory<A> & I;

  specialize(type: unknown): AnimatorFactory | null;

  define<O, T, U = T>(className: string, descriptor: AnimatorDescriptor<O, T, U>): AnimatorFactory<Animator<any, T, U>>;
  define<O, T, U = T, I = {}>(className: string, descriptor: {implements: unknown} & AnimatorDescriptor<O, T, U, I>): AnimatorFactory<Animator<any, T, U> & I>;

  <O, T extends string | undefined = string | undefined, U extends string | undefined = string | undefined>(descriptor: {type: typeof String} & AnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends number | undefined = number | undefined, U extends number | string | undefined = number | string | undefined>(descriptor: {type: typeof Number} & AnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends boolean | undefined = boolean | undefined, U extends boolean | string | undefined = boolean | string | undefined>(descriptor: {type: typeof Boolean} & AnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T>(descriptor: ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & AnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T>(descriptor: AnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T, I = {}>(descriptor: {implements: unknown} & AnimatorDescriptor<O, T, U, I>): PropertyDecorator;

}

/** @public */
export interface Animator<O = unknown, T = unknown, U = T> extends Property<O, T, U> {
  (): T;
  (newState: T | U, timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): O;
  (newState: T | U, timing?: AnyTiming | boolean | null, affinity?: Affinity): O;

  /** @protected @override */
  onInherit(superFastener: Property<unknown, T>): void;

  /** @override */
  setValue(newValue: T | U, affinity?: Affinity): void;

  get superState(): T | undefined;

  getSuperState(): NonNullable<T>;

  getSuperStateOr<E>(elseState: E): NonNullable<T> | E;

  readonly state: T;

  getState(): NonNullable<T>;

  getStateOr<E>(elseState: E): NonNullable<T> | E;

  transformState(state: T): T;

  setState(newState: T | U, timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  setState(newState: T | U, timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  /** @protected */
  willSetState(newstate: T, oldState: T): void;

  /** @protected */
  onSetState(newstate: T, oldState: T): void;

  /** @protected */
  didSetState(newstate: T, oldState: T): void;

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

/** @public */
export const Animator = (function (_super: typeof Property) {
  const Animator: AnimatorFactory = _super.extend("Animator");

  Animator.prototype.onInherit = function <T>(this: Animator<unknown, T>, superFastener: Property<unknown, T>): void {
    let newValue: T;
    let newState: T;
    if (superFastener instanceof Animator) {
      newValue = this.transformSuperValue(superFastener.value);
      newState = this.transformSuperValue(superFastener.state);
    } else {
      newValue = this.transformSuperValue(superFastener.value);
      newState = newValue;
    }
    const oldState = this.state;
    const stateChanged = !this.equalValues(newState, oldState);
    if (stateChanged) {
      this.willSetState(newState, oldState);
      (this as Mutable<typeof this>).state = newState;
      (this as Mutable<typeof this>).timing = null;
      (this as Mutable<typeof this>).interpolator = null;
      this.onSetState(newState, oldState);
    }

    this.setValue(newValue, Affinity.Reflexive);

    if (stateChanged) {
      this.didSetState(newState, oldState);
      if ((this.flags & Animator.TweeningFlag) !== 0) {
        this.didInterrupt(this.value);
      }
    }

    if (superFastener instanceof Animator && (superFastener.flags & Animator.TweeningFlag) !== 0) {
      this.startTweening();
    } else {
      this.stopTweening();
    }
  };

  Animator.prototype.setValue = function <T, U>(this: Animator<unknown, T, U>, newValue: T | U, affinity?: Affinity): void {
    if (affinity === void 0) {
      affinity = Affinity.Extrinsic;
    }
    if (this.minAffinity(affinity)) {
      newValue = this.fromAny(newValue);
      newValue = this.transformValue(newValue);
      const oldValue = this.value;
      if (!this.equalValues(newValue, oldValue)) {
        this.willSetValue(newValue, oldValue!);
        (this as Mutable<typeof this>).value = newValue;
        this.onSetValue(newValue, oldValue!);
        this.didSetValue(newValue, oldValue!);
        this.decohereSubFasteners();
      }
    }
  };

  Object.defineProperty(Animator.prototype, "superState", {
    get: function <T>(this: Animator<unknown, T>): T | undefined {
      const superFastener = this.superFastener;
      return superFastener instanceof Animator ? superFastener.state : void 0;
    },
    configurable: true,
  });

  Animator.prototype.getSuperState = function <T>(this: Animator<unknown, T>): NonNullable<T> {
    const superState = this.superState;
    if (superState === void 0 || superState === null) {
      let message = superState + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "super state";
      throw new TypeError(message);
    }
    return superState as NonNullable<T>;
  };

  Animator.prototype.getSuperStateOr = function <T, E>(this: Animator<unknown, T>, elseState: E): NonNullable<T> | E {
    let superState: T | E | undefined = this.superState;
    if (superState === void 0 || superState === null) {
      superState = elseState;
    }
    return superState as NonNullable<T> | E;
  };

  Animator.prototype.getState = function <T>(this: Animator<unknown, T>): NonNullable<T> {
    const state = this.state;
    if (state === void 0 || state === null) {
      let message = state + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "state";
      throw new TypeError(message);
    }
    return state as NonNullable<T>;
  };

  Animator.prototype.getStateOr = function <T, E>(this: Animator<unknown, T>, elseState: E): NonNullable<T> | E {
    let state: T | E = this.state;
    if (state === void 0 || state === null) {
      state = elseState;
    }
    return state as NonNullable<T> | E;
  };

  Animator.prototype.transformState = function <T>(this: Animator<unknown, T>, state: T): T {
    return state;
  };

  Animator.prototype.setState = function <T, U>(this: Animator<unknown, T, U>, newState: T | U, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    if (typeof timing === "number") {
      affinity = timing;
      timing = void 0;
    }
    if (affinity === void 0) {
      affinity = Affinity.Extrinsic;
    }

    if (this.minAffinity(affinity)) {
      newState = this.fromAny(newState);
      newState = this.transformState(newState);
      const oldState = this.state;
      if (!this.equalValues(newState, oldState)) {
        if (timing === void 0 || timing === null || timing === false) {
          timing = false;
        } else if (timing === true) {
          timing = this.timing !== null ? this.timing : false;
        } else {
          timing = Timing.fromAny(timing);
        }

        const animated = timing !== false && this.definedValue(oldState);

        this.willSetState(newState, oldState);

        (this as Mutable<typeof this>).state = newState;

        if (animated) {
          (this as Mutable<typeof this>).timing = timing as Timing;
          (this as Mutable<typeof this>).interpolator = Interpolator(this.value, newState);
          if ((this.flags & Animator.TweeningFlag) !== 0) {
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
          this.setValue(newState, Affinity.Reflexive);
        }

        this.didSetState(newState, oldState);

        if (animated) {
          this.startTweening();
        } else if ((this.flags & Animator.TweeningFlag) !== 0) {
          this.didInterrupt(this.value);
          this.stopTweening();
        }
      }
    }
  };

  Animator.prototype.willSetState = function <T>(this: Animator<unknown, T>, newState: T, oldState: T): void {
    // hook
  };

  Animator.prototype.onSetState = function <T>(this: Animator<unknown, T>, newState: T, oldState: T): void {
    // hook
  };

  Animator.prototype.didSetState = function <T>(this: Animator<unknown, T>, newState: T, oldState: T): void {
    // hook
  };

  Animator.prototype.setInterpolatedValue = function <T>(this: Animator<unknown, T>, newValue: T, newState?: T): void {
    const oldState = arguments.length > 1 ? this.state : void 0;
    const stateChanged = arguments.length > 1 && !this.equalValues(newState!, oldState);
    if (stateChanged) {
      this.willSetState(newState!, oldState!);
      (this as Mutable<typeof this>).state = newState!;
      (this as Mutable<typeof this>).timing = null;
      (this as Mutable<typeof this>).interpolator = null;
      this.onSetState(newState!, oldState!);
    }

    this.setValue(newValue, Affinity.Reflexive);

    if (stateChanged) {
      this.didSetState(newState!, oldState!);
      if ((this.flags & Animator.TweeningFlag) !== 0) {
        this.didInterrupt(this.value);
        this.stopTweening();
      }
    }
  };

  Animator.prototype.decohereSubFastener = function (this: Animator, subFastener: Property): void {
    if ((subFastener.flags & Animator.InheritedFlag) === 0 && Math.min(this.flags & Affinity.Mask, Affinity.Intrinsic) >= (subFastener.flags & Affinity.Mask)) {
      subFastener.setInherited(true, this);
    } else if ((subFastener.flags & Animator.InheritedFlag) !== 0) {
      if ((this.flags & Animator.TweeningFlag) !== 0 && subFastener instanceof Animator) {
        subFastener.startTweening();
      }
      if ((subFastener.flags & Animator.DecoherentFlag) === 0) {
        subFastener.setCoherent(false);
        subFastener.decohere();
      }
    }
  };

  Animator.prototype.recohere = function <T>(this: Animator<unknown, T>, t: number): void {
    const flags = this.flags;
    if ((flags & Animator.InheritedFlag) !== 0) {
      this.tweenInherited(t);
    } else if ((flags & Animator.TweeningFlag) !== 0) {
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
      if (!this.equalValues(this.state, oldValue)) {
        timing = timing.withDomain(t, t + timing.duration);
      } else {
        timing = timing.withDomain(t - timing.duration, t);
      }
      (this as Mutable<typeof this>).timing = timing;
      this.willTransition(oldValue);
    }

    const u = timing(t);
    const newValue = interpolator(u);
    this.setValue(newValue, Affinity.Reflexive);

    if (u < 1) {
      this.decohere();
    } else if ((this.flags & Animator.TweeningFlag) !== 0) {
      this.stopTweening();
      (this as Mutable<typeof this>).interpolator = null;
      this.didTransition(this.value);
    } else {
      this.setCoherent(true);
    }
  };

  Animator.prototype.tweenInherited = function <T>(this: Animator<unknown, T>, t: number): void {
    const superFastener = this.superFastener;
    if (superFastener !== null) {
      let newValue: T;
      let newState: T;
      if (superFastener instanceof Animator) {
        newValue = this.transformSuperValue(superFastener.value);
        newState = this.transformSuperValue(superFastener.state);
      } else {
        newValue = this.transformSuperValue(superFastener.value);
        newState = newValue;
      }
      const oldState = this.state;
      const stateChanged = !this.equalValues(newState, oldState);
      if (stateChanged) {
        this.willSetState(newState, oldState);
        (this as Mutable<typeof this>).state = newState!;
        (this as Mutable<typeof this>).timing = null;
        (this as Mutable<typeof this>).interpolator = null;
        this.onSetState(newState, oldState);
      }

      this.setValue(newValue, Affinity.Reflexive);

      if (stateChanged) {
        this.didSetState(newState, oldState!);
        if ((this.flags & Animator.TweeningFlag) !== 0) {
          this.didInterrupt(this.value);
        }
      }

      if (superFastener instanceof Animator && (superFastener.flags & Animator.TweeningFlag) !== 0) {
        this.decohere();
      } else if ((this.flags & Animator.TweeningFlag) !== 0) {
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
    if ((this.flags & Animator.DecoherentFlag) === 0) {
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

  Animator.construct = function <A extends Animator<any, any>>(animatorClass: {prototype: A}, animator: A | null, owner: FastenerOwner<A>): A {
    if (animator === null) {
      animator = function (state?: AnimatorValueInit<A>, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): AnimatorValue<A> | FastenerOwner<A> {
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
      delete (animator as Partial<Mutable<A>>).name; // don't clobber prototype name
      Object.setPrototypeOf(animator, animatorClass.prototype);
    }
    animator = _super.construct(animatorClass, animator, owner) as A;
    (animator as Mutable<typeof animator>).state = animator.value;
    (animator as Mutable<typeof animator>).timing = null;
    (animator as Mutable<typeof animator>).interpolator = null;
    return animator;
  };

  Animator.specialize = function (type: unknown): AnimatorFactory | null {
    if (type === String) {
      return StringAnimator;
    } else if (type === Number) {
      return NumberAnimator;
    } else if (type === Boolean) {
      return BooleanAnimator;
    }
    return null;
  };

  Animator.define = function <O, T, U>(className: string, descriptor: AnimatorDescriptor<O, T, U>): AnimatorFactory<Animator<any, T, U>> {
    let superClass = descriptor.extends as AnimatorFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const value = descriptor.value;
    const initValue = descriptor.initValue;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.value;
    delete descriptor.initValue;

    if (superClass === void 0 || superClass === null) {
      superClass = this.specialize(descriptor.type);
    }
    if (superClass === null) {
      superClass = this;
      if (descriptor.fromAny === void 0 && FromAny.is<T, U>(descriptor.type)) {
        descriptor.fromAny = descriptor.type.fromAny;
      }
    }

    const animatorClass = superClass.extend(className, descriptor);

    animatorClass.construct = function (animatorClass: {prototype: Animator<any, any>}, animator: Animator<O, T, U> | null, owner: O): Animator<O, T, U> {
      animator = superClass!.construct(animatorClass, animator, owner);
      if (affinity !== void 0) {
        animator.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        animator.initInherits(inherits);
      }
      if (initValue !== void 0) {
        (animator as Mutable<typeof animator>).value = animator.fromAny(initValue());
        (animator as Mutable<typeof animator>).state = animator.value;
      } else if (value !== void 0) {
        (animator as Mutable<typeof animator>).value = animator.fromAny(value);
        (animator as Mutable<typeof animator>).state = animator.value;
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
