// Copyright 2015-2023 Swim.inc
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

import {Mutable, Proto, AnyTiming, Timing} from "@swim/util";
import {
  Affinity,
  FastenerOwner,
  Property,
  AnimatorValue,
  AnimatorValueInit,
  AnimatorDescriptor,
  AnimatorClass,
  Animator,
} from "@swim/component";
import {Look} from "../look/Look";
import type {MoodVector} from "../mood/MoodVector";
import type {ThemeMatrix} from "../theme/ThemeMatrix";
import {ThemeContext} from "../theme/ThemeContext";

/** @public */
export interface ThemeAnimatorDescriptor<T = unknown, U = T> extends AnimatorDescriptor<T, U> {
  extends?: Proto<ThemeAnimator<any, any, any>> | string | boolean | null;
  look?: Look<T, any>;
}

/** @public */
export type ThemeAnimatorTemplate<A extends ThemeAnimator<any, any, any>> =
  ThisType<A> &
  ThemeAnimatorDescriptor<AnimatorValue<A>, AnimatorValueInit<A>> &
  Partial<Omit<A, keyof ThemeAnimatorDescriptor>>;

/** @public */
export interface ThemeAnimatorClass<A extends ThemeAnimator<any, any> = ThemeAnimator<any, any>> extends AnimatorClass<A> {
  /** @override */
  specialize(template: ThemeAnimatorDescriptor<any, any>): ThemeAnimatorClass<A>;

  /** @override */
  refine(animatorClass: ThemeAnimatorClass<any>): void;

  /** @override */
  extend<A2 extends A>(className: string, template: ThemeAnimatorTemplate<A2>): ThemeAnimatorClass<A2>;
  extend<A2 extends A>(className: string, template: ThemeAnimatorTemplate<A2>): ThemeAnimatorClass<A2>;

  /** @override */
  define<A2 extends A>(className: string, template: ThemeAnimatorTemplate<A2>): ThemeAnimatorClass<A2>;
  define<A2 extends A>(className: string, template: ThemeAnimatorTemplate<A2>): ThemeAnimatorClass<A2>;

  /** @override */
  <A2 extends A>(template: ThemeAnimatorTemplate<A2>): PropertyDecorator;
}

/** @public */
export interface ThemeAnimator<O = unknown, T = unknown, U = T> extends Animator<O, T, U> {
  /** @protected @override */
  onSetAffinity(newAffinity: Affinity, oldAffinity: Affinity): void;

  /** @protected @override */
  onDerive(inlet: Property<unknown, T>): void;

  get inletLook(): Look<T, any> | null;

  getInletLook(): Look<T, any>;

  getInletLookOr<E>(elseLook: E): Look<T, any> | E;

  /** @protected */
  initLook(): Look<T, any> | null;

  readonly look: Look<T, any> | null;

  getLook(): Look<T, any>;

  getLookOr<E>(elseLook: E): Look<T, any> | E;

  setLook(newLook: Look<T, any> | null, timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  setLook(newLook: Look<T, any> | null, timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  /** @protected */
  willSetLook(newLook: Look<T, any> | null, oldLook: Look<T, any> | null, timing: Timing | boolean): void;

  /** @protected */
  onSetLook(newLook: Look<T, any> | null, oldLook: Look<T, any> | null, timing: Timing | boolean): void;

  /** @protected */
  didSetLook(newLook: Look<T, any> | null, oldLook: Look<T, any> | null, timing: Timing | boolean): void;

  /** @internal */
  applyLook(look: Look<T, any>, timing: Timing | boolean): void;

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void;

  /** @internal @protected @override */
  tweenInherited(t: number): void;

  /** @protected @override */
  onMount(): void;
}

/** @public */
export const ThemeAnimator = (function (_super: typeof Animator) {
  const ThemeAnimator = _super.extend("ThemeAnimator", {}) as ThemeAnimatorClass;

  ThemeAnimator.prototype.onSetAffinity = function (this: ThemeAnimator, newAffinity: Affinity, oldAffinity: Affinity): void {
    if (newAffinity > Affinity.Intrinsic) {
      this.setLook(null, newAffinity);
    }
    _super.prototype.onSetAffinity.call(this, newAffinity, oldAffinity);
  };

  ThemeAnimator.prototype.onDerive = function <T>(this: ThemeAnimator<unknown, T>, inlet: Property<any, T>): void {
    if (inlet instanceof ThemeAnimator) {
      this.setLook(inlet.look, inlet.timing, Affinity.Reflexive);
    } else {
      this.setLook(null, Affinity.Reflexive);
    }
    if (this.look === null) {
      _super.prototype.onDerive.call(this, inlet);
    }
  };

  Object.defineProperty(ThemeAnimator.prototype, "inletLook", {
    get: function <T>(this: ThemeAnimator<unknown, T>): Look<T, any> | null {
      const inlet = this.inlet;
      return inlet instanceof ThemeAnimator ? inlet.look : null;
    },
    configurable: true,
  });

  ThemeAnimator.prototype.getInletLook = function <T>(this: ThemeAnimator<unknown, T>): Look<T, any> {
    const inletLook = this.inletLook;
    if (inletLook === null) {
      throw new TypeError(inletLook + " " + this.name + " inlet look");
    }
    return inletLook;
  };

  ThemeAnimator.prototype.getInletLookOr = function <T, E>(this: ThemeAnimator<unknown, T>, elseLook: E): Look<T, any> | E {
    let inletLook: Look<T> | E | null = this.inletLook;
    if (inletLook === null) {
      inletLook = elseLook;
    }
    return inletLook;
  };

  ThemeAnimator.prototype.initLook = function <T>(this: ThemeAnimator<unknown, T>): Look<T, any> | null {
    let look = (Object.getPrototypeOf(this) as ThemeAnimator<unknown, T>).look as Look<T, any> | null | undefined;
    if (look === void 0) {
      look = null;
    }
    return look;
  };

  ThemeAnimator.prototype.getLook = function <T>(this: ThemeAnimator<unknown, T>): Look<T, any> {
    const look = this.look;
    if (look === null) {
      throw new TypeError(look + " " + this.name + " look");
    }
    return look;
  };

  ThemeAnimator.prototype.getLookOr = function <T, E>(this: ThemeAnimator<unknown, T>, elseLook: E): Look<T, any> | E {
    let look: Look<T> | E | null = this.look;
    if (look === null) {
      look = elseLook;
    }
    return look;
  };

  ThemeAnimator.prototype.setLook = function <T>(this: ThemeAnimator<unknown, T>, newLook: Look<T, any> | null, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    if (typeof timing === "number") {
      affinity = timing;
      timing = void 0;
    }
    if (affinity === void 0) {
      affinity = Affinity.Extrinsic;
    }
    if (this.minAffinity(affinity)) {
      const oldLook = this.look;
      if (newLook !== oldLook) {
        if (timing === void 0 || timing === null) {
          timing = false;
        } else {
          timing = Timing.fromAny(timing);
        }
        this.willSetLook(newLook, oldLook, timing as Timing | boolean);
        (this as Mutable<typeof this>).look = newLook;
        this.onSetLook(newLook, oldLook, timing as Timing | boolean);
        this.didSetLook(newLook, oldLook, timing as Timing | boolean);
      }
    }
  };

  ThemeAnimator.prototype.willSetLook = function <T>(this: ThemeAnimator<unknown, T>, newLook: Look<T, any> | null, oldLook: Look<T, any> | null, timing: Timing | boolean): void {
    // hook
  };

  ThemeAnimator.prototype.onSetLook = function <T>(this: ThemeAnimator<unknown, T>, newLook: Look<T, any> | null, oldLook: Look<T, any> | null, timing: Timing | boolean): void {
    if (newLook !== null) {
      this.applyLook(newLook, timing);
    }
  };

  ThemeAnimator.prototype.didSetLook = function <T>(this: ThemeAnimator<unknown, T>, newLook: Look<T, any> | null, oldLook: Look<T, any> | null, timing: Timing | boolean): void {
    // hook
  };

  ThemeAnimator.prototype.applyLook = function <T>(this: ThemeAnimator<unknown, T>, look: Look<T, any>, timing: Timing | boolean): void {
    const themeContext = this.owner;
    if (this.mounted && ThemeContext.is(themeContext)) {
      const state = themeContext.getLook(look);
      if (state !== void 0) {
        if (timing === true) {
          timing = themeContext.getLookOr(Look.timing, true);
        }
        this.setState(state, timing, Affinity.Reflexive);
      }
    }
  };

  ThemeAnimator.prototype.applyTheme = function <T>(this: ThemeAnimator<unknown, T>, theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean | undefined): void {
    const look = this.look;
    if (look !== null) {
      const state = theme.get(look, mood);
      if (state !== void 0) {
        if (timing === true) {
          timing = theme.get(Look.timing, mood);
          if (timing === void 0) {
            timing = true;
          }
        }
        this.setState(state, timing, Affinity.Reflexive);
      }
    }
  };

  ThemeAnimator.prototype.tweenInherited = function <T>(this: ThemeAnimator<unknown, T>, t: number): void {
    const inlet = this.inlet;
    if (inlet instanceof ThemeAnimator) {
      this.setLook(inlet.look, inlet.timing, Affinity.Reflexive);
    } else {
      this.setLook(null, Affinity.Reflexive);
    }
    if (this.look !== null) {
      _super.prototype.tween.call(this, t);
    } else {
      _super.prototype.tweenInherited.call(this, t);
    }
  }

  ThemeAnimator.prototype.onMount = function (this: ThemeAnimator): void {
    _super.prototype.onMount.call(this);
    const look = this.look;
    if (look !== null) {
      this.applyLook(look, false);
    }
  };

  ThemeAnimator.construct = function <A extends ThemeAnimator<any, any>>(animator: A | null, owner: FastenerOwner<A>): A {
    animator = _super.construct.call(this, animator, owner) as A;
    (animator as Mutable<typeof animator>).look = animator.initLook();
    return animator;
  };

  return ThemeAnimator;
})(Animator);
