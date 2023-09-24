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

import type {Mutable} from "@swim/util";
import type {Proto} from "@swim/util";
import {Objects} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import {Easing} from "@swim/util";
import {Interpolator} from "@swim/util";
import {Affinity} from "./Affinity";
import type {FastenerContext} from "./FastenerContext";
import type {FastenerFlags} from "./Fastener";
import type {FastenerClass} from "./Fastener";
import {Fastener} from "./Fastener";
import type {PropertyDescriptor} from "./Property";
import type {PropertyClass} from "./Property";
import {Property} from "./Property";

/** @public */
export interface AnimatorDescriptor<R, T> extends PropertyDescriptor<R, T> {
  extends?: Proto<Animator<any, any, any>> | boolean | null;
  transition?: TimingLike | boolean | null;
}

/** @public */
export interface AnimatorClass<A extends Animator<any, any, any> = Animator<any, any, any>> extends PropertyClass<A> {
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
export interface Animator<R = any, T = any, I extends any[] = [T]> extends Property<R, T, I> {
  /** @override */
  get descriptorType(): Proto<AnimatorDescriptor<R, T>>;

  get inletState(): I[0] | undefined;

  getInletState(): NonNullable<I[0]>;

  getInletStateOr<E>(elseState: E): NonNullable<I[0]> | E;

  getOutletState(outlet: Fastener<any, any, any>): T;

  /** @override */
  set(newValue: T | LikeType<T> | Fastener<any, I[0], any>, timing?: TimingLike | boolean | null): R;

  /** @override */
  setIntrinsic(newValue: T | LikeType<T> | Fastener<any, I[0], any>, timing?: TimingLike | boolean | null): R;

  /** @override */
  setValue(newValue: T | LikeType<T>, affinity?: Affinity): void;

  readonly state: T;

  getState(): NonNullable<T>;

  getStateOr<E>(elseState: E): NonNullable<T> | E;

  transformState(state: T): T;

  setState(newState: T | LikeType<T>, timingOrAffinity: Affinity | TimingLike | boolean | null | undefined): void;
  setState(newState: T | LikeType<T>, timing?: TimingLike | boolean | null, affinity?: Affinity): void;

  /** @protected */
  willSetState(newState: T, oldState: T): void;

  /** @protected */
  onSetState(newState: T, oldState: T): void;

  /** @protected */
  didSetState(newState: T, oldState: T): void;

  readonly timing: Timing | null;

  readonly interpolator: Interpolator<T> | null;

  setInterpolatedValue(newValue: T, newState?: T): void;

  /** @override */
  decohere(inlet?: Fastener<any, any, any>): void;

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

  /** @protected */
  willTransition(oldValue: T): void;

  /** @protected */
  didTransition(newValue: T): void;

  /** @protected */
  didInterrupt(value: T): void;
}

/** @public */
export const Animator = (<R, T, I extends any[], A extends Animator<any, any, any>>() => Property.extend<Animator<R, T, I>, AnimatorClass<A>>("Animator", {
  get inletState(): I[0] | undefined {
    const inlet = this.inlet;
    return inlet instanceof Animator ? inlet.getOutletState(this) : void 0;
  },

  getInletState(): NonNullable<I[0]> {
    const inletState = this.inletState;
    if (inletState === void 0 || inletState === null) {
      let message = inletState + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "inlet state";
      throw new TypeError(message);
    }
    return inletState;
  },

  getInletStateOr<E>(elseState: E): NonNullable<I[0]> | E {
    const inletState: I[0] | E | undefined = this.inletState;
    if (inletState === void 0 || inletState === null) {
      return elseState;
    }
    return inletState;
  },

  getOutletState(outlet: Fastener<any, any, any>): T {
    return this.state;
  },

  set(newValue: T | LikeType<T> | Fastener<any, I[0], any>, timing?: TimingLike | boolean | null): R {
    if (newValue instanceof Fastener) {
      this.bindInlet(newValue);
    } else {
      this.setState(newValue, timing, Affinity.Extrinsic);
    }
    return this.owner;
  },

  setIntrinsic(newValue: T | LikeType<T> | Fastener<any, I[0], any>, timing?: TimingLike | boolean | null): R {
    if (newValue instanceof Fastener) {
      this.bindInlet(newValue);
    } else {
      this.setState(newValue, timing, Affinity.Intrinsic);
    }
    return this.owner;
  },

  setValue(newValue: T | LikeType<T>, affinity?: Affinity): void {
    if (affinity === void 0) {
      affinity = Affinity.Extrinsic;
    }
    if (!this.minAffinity(affinity)) {
      return;
    }
    newValue = this.fromLike(newValue);
    newValue = this.transformValue(newValue);
    const oldValue = this.value;
    if (this.equalValues(newValue, oldValue)) {
      return;
    }
    this.willSetValue(newValue, oldValue);
    this.incrementVersion();
    (this as Mutable<typeof this>).value = newValue;
    this.onSetValue(newValue, oldValue);
    this.didSetValue(newValue, oldValue);
    this.decohereOutlets();
  },

  getState(): NonNullable<T> {
    const state = this.state;
    if (state === void 0 || state === null) {
      let message = state + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "state";
      throw new TypeError(message);
    }
    return state;
  },

  getStateOr<E>(elseState: E): NonNullable<T> | E {
    const state: T | E = this.state;
    if (state === void 0 || state === null) {
      return elseState;
    }
    return state;
  },

  transformState(state: T): T {
    return state;
  },

  setState(newState: T | LikeType<T>, timing?: Affinity | TimingLike | boolean | null, affinity?: Affinity): void {
    if (typeof timing === "number") {
      affinity = timing;
      timing = void 0;
    }
    if (affinity === void 0) {
      affinity = Affinity.Extrinsic;
    }
    if (!this.minAffinity(affinity)) {
      return;
    }

    newState = this.fromLike(newState);
    newState = this.transformState(newState);
    const oldState = this.state;
    if (timing === void 0 && this.equalValues(newState, oldState)) {
      return;
    }

    if (timing === void 0) {
      timing = this.transition;
    } else {
      timing = Timing.fromLike(timing);
    }
    if (timing === true) {
      if (Objects.hasAllKeys<FastenerContext>(this.owner, "getTransition")) {
        timing = this.owner.getTransition!(this);
      } else {
        timing = this.timing;
      }
    } else if (timing === false) {
      timing = null;
    }

    const tweened = timing !== null && this.definedValue(oldState);

    this.willSetState(newState, oldState);

    (this as Mutable<typeof this>).state = newState;

    if (tweened) {
      (this as Mutable<typeof this>).timing = timing;
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

    if (!tweened) {
      this.setValue(newState, Affinity.Reflexive);
    }

    this.didSetState(newState, oldState);

    if (tweened) {
      this.startTweening();
    } else if ((this.flags & Animator.TweeningFlag) !== 0) {
      this.didInterrupt(this.value);
      this.stopTweening();
    }
  },

  willSetState(newState: T, oldState: T): void {
    // hook
  },

  onSetState(newState: T, oldState: T): void {
    // hook
  },

  didSetState(newState: T, oldState: T): void {
    // hook
  },

  setInterpolatedValue(this: Animator<unknown, T>, newValue: T, newState?: T): void {
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
  },

  decohere(inlet?: Fastener<any, any, any>): void {
    if (inlet === void 0 || inlet !== this.inlet || (this.flags & Fastener.DerivedFlag) !== 0) {
      if (inlet instanceof Animator && (inlet.flags & Animator.TweeningFlag) !== 0) {
        this.startTweening();
      }
      if ((this.flags & Fastener.DecoherentFlag) === 0) {
        this.requireRecohere();
      }
    } else {
      this.recohere(performance.now());
    }
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof Animator) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        this.tweenInherited(t);
      } else if ((this.flags & Animator.TweeningFlag) !== 0) {
        this.tween(t);
      } else {
        this.setCoherent(true);
      }
    } else if (inlet instanceof Property) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0 && this.inletVersion !== inlet.version) {
        (this as Mutable<typeof this>).inletVersion = inlet.version;
        const derivedValue = (this as unknown as Property<R, T, [unknown]>).deriveValue(inlet.getOutletValue(this));
        this.setState(derivedValue, Affinity.Reflexive);
        if ((this.flags & Animator.TweeningFlag) !== 0) {
          this.tween(t);
        } else {
          this.setCoherent(true);
        }
      } else if ((this.flags & Animator.TweeningFlag) !== 0) {
        this.tween(t);
      } else {
        this.setCoherent(true);
      }
    } else if (Array.isArray(inlet)) {
      this.setDerived(true);
      const inletVersions = this.inletVersion as number[];
      const inletValues = new Array<unknown>(inlet.length);
      for (let i = 0; i < inlet.length; i += 1) {
        if (inlet[i] instanceof Property) {
          inletVersions[i] = (inlet[i] as Property).version;
          inletValues[i] = (inlet[i] as Property).getOutletValue(this);
        } else {
          this.setDerived(false);
          this.setCoherent(true);
          return;
        }
      }
      const derivedValue = this.deriveValue(...(inletValues as I));
      this.setState(derivedValue, Affinity.Reflexive);
      if ((this.flags & Animator.TweeningFlag) !== 0) {
        this.tween(t);
      } else {
        this.setCoherent(true);
      }
    } else {
      this.setDerived(false);
      if ((this.flags & Animator.TweeningFlag) !== 0) {
        this.tween(t);
      } else {
        this.setCoherent(true);
      }
    }
  },

  tween(t: number): void {
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
      this.requireRecohere();
    } else if ((this.flags & Animator.TweeningFlag) !== 0) {
      this.stopTweening();
      (this as Mutable<typeof this>).interpolator = null;
      this.didTransition(this.value);
    } else {
      this.setCoherent(true);
    }
  },

  tweenInherited(t: number): void {
    const inlet = this.inlet;
    if (!(inlet instanceof Animator)) {
      this.stopTweening();
      return;
    }
    (this as Mutable<typeof this>).inletVersion = inlet.version;
    const newValue = (this as unknown as Animator<R, T, [unknown]>).deriveValue(inlet.getOutletValue(this));
    const newState = (this as unknown as Animator<R, T, [unknown]>).deriveValue(inlet.getOutletState(this));
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
      this.willTransition(this.value);
    }

    if ((inlet.flags & Animator.TweeningFlag) !== 0) {
      this.requireRecohere();
    } else if ((this.flags & Animator.TweeningFlag) !== 0) {
      this.stopTweening();
      this.didTransition(this.value);
    } else {
      this.setCoherent(true);
    }
  },

  get tweening(): boolean {
    return (this.flags & Animator.TweeningFlag) !== 0;
  },

  startTweening(): void {
    if ((this.flags & Animator.TweeningFlag) !== 0) {
      return;
    }
    this.willStartTweening();
    this.setFlags(this.flags | Animator.TweeningFlag);
    this.onStartTweening();
    this.didStartTweening();
  },

  willStartTweening(): void {
    // hook
  },

  onStartTweening(): void {
    this.decohere();
    this.decohereOutlets();
  },

  didStartTweening(): void {
    // hook
  },

  stopTweening(): void {
    if ((this.flags & Animator.TweeningFlag) === 0) {
      return;
    }
    this.willStopTweening();
    this.setFlags(this.flags & ~Animator.TweeningFlag);
    this.onStopTweening();
    this.didStopTweening();
  },

  willStopTweening(): void {
    // hook
  },

  onStopTweening(): void {
    this.setCoherent(true);
  },

  didStopTweening(): void {
    // hook
  },

  willTransition(oldValue: T): void {
    // hook
  },

  didTransition(newValue: T): void {
    // hook
  },

  didInterrupt(value: T): void {
    // hook
  },
},
{
  construct(animator: A | null, owner: A extends Fastener<infer R, any, any> ? R : never): A {
    animator = super.construct(animator, owner) as A;
    (animator as Mutable<typeof animator>).state = animator.value;
    (animator as Mutable<typeof animator>).timing = null;
    (animator as Mutable<typeof animator>).interpolator = null;
    return animator;
  },

  refine(animatorClass: FastenerClass<Animator<any, any, any>>): void {
    super.refine(animatorClass);
    const animatorPrototype = animatorClass.prototype;

    const transitionDescriptor = Object.getOwnPropertyDescriptor(animatorPrototype, "transition");
    if (transitionDescriptor !== void 0 && "value" in transitionDescriptor) {
      transitionDescriptor.value = Timing.fromLike(transitionDescriptor.value);
      Object.defineProperty(animatorPrototype, "transition", transitionDescriptor);
    }
  },

  TweeningFlag: 1 << (Property.FlagShift + 0),
  DivergedFlag: 1 << (Property.FlagShift + 1),
  InterruptFlag: 1 << (Property.FlagShift + 2),

  FlagShift: Property.FlagShift + 3,
  FlagMask: (1 << (Property.FlagShift + 3)) - 1,
}))();
