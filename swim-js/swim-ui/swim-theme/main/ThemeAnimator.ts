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
import {Affinity} from "@swim/component";
import type {FastenerContext} from "@swim/component";
import {Fastener} from "@swim/component";
import {Property} from "@swim/component";
import type {AnimatorClass} from "@swim/component";
import type {AnimatorDescriptor} from "@swim/component";
import {Animator} from "@swim/component";
import type {MoodVector} from "./MoodVector";
import type {ThemeMatrix} from "./ThemeMatrix";
import {ThemeContext} from "./ThemeContext";
import {Look} from "./"; // forward import

/** @public */
export interface ThemeAnimatorDescriptor<R, T> extends AnimatorDescriptor<R, T> {
  extends?: Proto<ThemeAnimator<any, any, any>> | boolean | null;
}

/** @public */
export interface ThemeAnimatorClass<A extends ThemeAnimator<any, any, any> = ThemeAnimator<any, any, any>> extends AnimatorClass<A> {
}

/** @public */
export interface ThemeAnimator<R = any, T = any, I extends any[] = [Look<NonNullable<T>> | T]> extends Animator<R, T, I> {
  /** @override */
  get descriptorType(): Proto<ThemeAnimatorDescriptor<R, T>>;

  /** @protected @override */
  onSetAffinity(newAffinity: Affinity, oldAffinity: Affinity): void;

  /** @override */
  set(newValue: T | LikeType<T> | Look<NonNullable<T>> | Fastener<any, I[0], any>, timing?: TimingLike | boolean | null): R;

  /** @override */
  setIntrinsic(newValue: T | LikeType<T> | Look<NonNullable<T>> | Fastener<any, I[0], any>, timing?: TimingLike | boolean | null): R;

  get inletLook(): Look<NonNullable<T>> | null;

  getInletLook(): Look<NonNullable<T>>;

  getInletLookOr<E>(elseLook: E): Look<NonNullable<T>> | E;

  /** @protected */
  initLook(): Look<NonNullable<T>> | null;

  readonly look: Look<NonNullable<T>> | null;

  getLook(): Look<NonNullable<T>>;

  getLookOr<E>(elseLook: E): Look<NonNullable<T>> | E;

  setLook(newLook: Look<NonNullable<T>> | null, timingOrAffinity: Affinity | TimingLike | boolean | null | undefined): void;
  setLook(newLook: Look<NonNullable<T>> | null, timing?: TimingLike | boolean | null, affinity?: Affinity): void;

  /** @protected */
  willSetLook(newLook: Look<NonNullable<T>> | null, oldLook: Look<NonNullable<T>> | null, timing: Timing | boolean | null): void;

  /** @protected */
  onSetLook(newLook: Look<NonNullable<T>> | null, oldLook: Look<NonNullable<T>> | null, timing: Timing | boolean | null): void;

  /** @protected */
  didSetLook(newLook: Look<NonNullable<T>> | null, oldLook: Look<NonNullable<T>> | null, timing: Timing | boolean | null): void;

  /** @internal */
  applyLook(look: Look<NonNullable<T>>, timing: Timing | boolean | null | undefined): void;

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean | null | undefined): void;

  /** @override */
  recohere(t: number): void;

  /** @protected @override */
  onMount(): void;
}

/** @public */
export const ThemeAnimator = (<R, T, I extends any[], A extends ThemeAnimator<any, any, any>>() => Animator.extend<ThemeAnimator<R, T, I>, ThemeAnimatorClass<A>>("ThemeAnimator", {
  onSetAffinity(newAffinity: Affinity, oldAffinity: Affinity): void {
    if (newAffinity > Affinity.Intrinsic) {
      this.setLook(null, newAffinity);
    }
    super.onSetAffinity(newAffinity, oldAffinity);
  },

  set(newValue: T | LikeType<T> | Look<NonNullable<T>> | Fastener<any, I[0], any>, timing?: TimingLike | boolean | null): R {
    if (newValue instanceof Fastener) {
      this.bindInlet(newValue);
    } else if (newValue instanceof Look) {
      this.setLook(newValue, timing, Affinity.Extrinsic);
    } else {
      this.setState(newValue, timing, Affinity.Extrinsic);
    }
    return this.owner;
  },

  setIntrinsic(newValue: T | LikeType<T> | Look<NonNullable<T>> | Fastener<any, I[0], any>, timing?: TimingLike | boolean | null): R {
    if (newValue instanceof Fastener) {
      this.bindInlet(newValue);
    } else if (newValue instanceof Look) {
      this.setLook(newValue, timing, Affinity.Intrinsic);
    } else {
      this.setState(newValue, timing, Affinity.Intrinsic);
    }
    return this.owner;
  },

  get inletLook(): Look<NonNullable<T>> | null {
    const inlet = this.inlet;
    return inlet instanceof ThemeAnimator ? inlet.look : null;
  },

  getInletLook(): Look<NonNullable<T>> {
    const inletLook = this.inletLook;
    if (inletLook === null) {
      throw new TypeError(inletLook + " " + this.name.toString() + " inlet look");
    }
    return inletLook;
  },

  getInletLookOr<E>(elseLook: E): Look<NonNullable<T>> | E {
    const inletLook = this.inletLook;
    if (inletLook === null) {
      return elseLook;
    }
    return inletLook;
  },

  look: null,

  initLook(): Look<NonNullable<T>> | null {
    return (Object.getPrototypeOf(this) as ThemeAnimator<unknown, T>).look;
  },

  getLook(): Look<NonNullable<T>> {
    const look = this.look;
    if (look === null) {
      throw new TypeError(look + " " + this.name.toString() + " look");
    }
    return look;
  },

  getLookOr<E>(elseLook: E): Look<NonNullable<T>> | E {
    const look = this.look;
    if (look === null) {
      return elseLook;
    }
    return look;
  },

  setLook(newLook: Look<NonNullable<T>> | null, timing?: Affinity | TimingLike | boolean | null, affinity?: Affinity): void {
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
    const oldLook = this.look;
    if (newLook === oldLook) {
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
    this.willSetLook(newLook, oldLook, timing);
    this.incrementVersion();
    (this as Mutable<typeof this>).look = newLook;
    this.onSetLook(newLook, oldLook, timing);
    this.didSetLook(newLook, oldLook, timing);
  },

  willSetLook(newLook: Look<NonNullable<T>> | null, oldLook: Look<NonNullable<T>> | null, timing: Timing | null): void {
    // hook
  },

  onSetLook(newLook: Look<NonNullable<T>> | null, oldLook: Look<NonNullable<T>> | null, timing: Timing | null): void {
    if (newLook !== null) {
      this.applyLook(newLook, timing);
    }
  },

  didSetLook(newLook: Look<NonNullable<T>> | null, oldLook: Look<NonNullable<T>> | null, timing: Timing | null): void {
    // hook
  },

  applyLook(look: Look<NonNullable<T>>, timing: Timing | boolean | null | undefined): void {
    if (!this.mounted || !ThemeContext[Symbol.hasInstance](this.owner)) {
      return;
    }
    const state = this.owner.getLook(look);
    if (state === void 0) {
      return;
    }
    this.setState(state, timing, Affinity.Reflexive);
  },

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean | null | undefined): void {
    const look = this.look;
    if (look === null) {
      return;
    }
    const state = theme.get(look, mood);
    if (state === void 0) {
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
    this.setState(state, timing, Affinity.Reflexive);
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof Animator) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        if (inlet instanceof ThemeAnimator) {
          this.setLook(inlet.look, inlet.timing, Affinity.Reflexive);
        } else {
          this.setLook(null, Affinity.Reflexive);
        }
        if (this.look === null) {
          this.tweenInherited(t);
        } else if ((this.flags & Animator.TweeningFlag) !== 0) {
          this.tween(t);
        } else {
          this.setCoherent(true);
        }
      } else if ((this.flags & Animator.TweeningFlag) !== 0) {
        this.tween(t);
      } else {
        this.setCoherent(true);
      }
    } else if (inlet instanceof Property) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0 && this.inletVersion !== inlet.version) {
        (this as Mutable<typeof this>).inletVersion = inlet.version;
        const inletValue = inlet.getOutletValue(this);
        if (inletValue instanceof Look) {
          this.setLook(inletValue, Affinity.Reflexive);
        } else {
          this.setLook(null, Affinity.Reflexive);
          const derivedValue = (this as unknown as Property<R, T, [unknown]>).deriveValue(inlet.getOutletValue(this));
          this.setState(derivedValue, Affinity.Reflexive);
        }
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

  onMount(): void {
    super.onMount();
    const look = this.look;
    if (look !== null) {
      this.applyLook(look, false);
    }
  },
}, {
  construct(animator: A | null, owner: A extends Fastener<infer R, any, any> ? R : never): A {
    animator = super.construct(animator, owner) as A;
    (animator as Mutable<typeof animator>).look = animator.initLook();
    return animator;
  },
}))();
