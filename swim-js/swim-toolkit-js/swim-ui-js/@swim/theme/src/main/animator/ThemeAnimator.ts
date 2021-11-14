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

import {Mutable, FromAny, AnyTiming, Timing} from "@swim/util";
import {Affinity, FastenerOwner, Property, AnimatorInit, AnimatorClass, Animator} from "@swim/fastener";
import {AnyLength, Length, AnyAngle, Angle, AnyTransform, Transform} from "@swim/math";
import {AnyFont, Font, AnyColor, Color, AnyFocus, Focus, AnyPresence, Presence, AnyExpansion, Expansion} from "@swim/style";
import {Look} from "../look/Look";
import type {MoodVector} from "../mood/MoodVector";
import type {ThemeMatrix} from "../theme/ThemeMatrix";
import {ThemeContext} from "../theme/ThemeContext";
import {StringThemeAnimator} from "./"; // forward import
import {NumberThemeAnimator} from "./"; // forward import
import {BooleanThemeAnimator} from "./"; // forward import
import {AngleThemeAnimator} from "./"; // forward import
import {LengthThemeAnimator} from "./"; // forward import
import {TransformThemeAnimator} from "./"; // forward import
import {ColorThemeAnimator} from "./"; // forward import
import {FontThemeAnimator} from "./"; // forward import
import {FocusThemeAnimatorInit, FocusThemeAnimator} from "./"; // forward import
import {PresenceThemeAnimatorInit, PresenceThemeAnimator} from "./"; // forward import
import {ExpansionThemeAnimatorInit, ExpansionThemeAnimator} from "./"; // forward import

/** @public */
export interface ThemeAnimatorInit<T = unknown, U = T> extends AnimatorInit<T, U> {
  extends?: {prototype: ThemeAnimator<any, any>} | string | boolean | null;
  look?: Look<T>;

  willSetLook?(newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void;
  didSetLook?(newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void;
}

/** @public */
export type ThemeAnimatorDescriptor<O = unknown, T = unknown, U = T, I = {}> = ThisType<ThemeAnimator<O, T, U> & I> & ThemeAnimatorInit<T, U> & Partial<I>;

/** @public */
export interface ThemeAnimatorClass<A extends ThemeAnimator<any, any> = ThemeAnimator<any, any>> extends AnimatorClass<A> {
}

/** @public */
export interface ThemeAnimatorFactory<A extends ThemeAnimator<any, any> = ThemeAnimator<any, any>> extends ThemeAnimatorClass<A> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ThemeAnimatorFactory<A> & I;

  specialize(type: unknown): ThemeAnimatorFactory | null;

  define<O, T, U = T>(className: string, descriptor: ThemeAnimatorDescriptor<O, T, U>): ThemeAnimatorFactory<ThemeAnimator<any, T, U>>;
  define<O, T, U = T, I = {}>(className: string, descriptor: ThemeAnimatorDescriptor<O, T, U, I>): ThemeAnimatorFactory<ThemeAnimator<any, T, U> & I>;

  <O, T extends Angle | null | undefined = Angle | null | undefined, U extends AnyAngle | null | undefined = AnyAngle | null | undefined>(descriptor: {type: typeof Angle} & ThemeAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends Length | null | undefined = Length | null | undefined, U extends AnyLength | null | undefined = AnyLength | null | undefined>(descriptor: {type: typeof Length} & ThemeAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends Transform | null | undefined = Transform | null | undefined, U extends AnyTransform | null | undefined = AnyTransform | null | undefined>(descriptor: {type: typeof Transform} & ThemeAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends Color | null | undefined = Color | null | undefined, U extends AnyColor | null | undefined = AnyColor | null | undefined>(descriptor: {type: typeof Color} & ThemeAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends Font | null | undefined = Font | null | undefined, U extends AnyFont | null | undefined = AnyFont | null | undefined>(descriptor: {type: typeof Font} & ThemeAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends Focus | null | undefined = Focus | null | undefined, U extends AnyFocus | null | undefined = AnyFocus | null | undefined>(descriptor: {type: typeof Focus} & ThemeAnimatorDescriptor<O, T, U> & FocusThemeAnimatorInit): PropertyDecorator;
  <O, T extends Presence | null | undefined = Presence | null | undefined, U extends AnyPresence | null | undefined = AnyPresence | null | undefined>(descriptor: {type: typeof Presence} & ThemeAnimatorDescriptor<O, T, U> & PresenceThemeAnimatorInit): PropertyDecorator;
  <O, T extends Expansion | null | undefined = Expansion | null | undefined, U extends AnyExpansion | null | undefined = AnyExpansion | null | undefined>(descriptor: {type: typeof Expansion} & ThemeAnimatorDescriptor<O, T, U> & ExpansionThemeAnimatorInit): PropertyDecorator;
  <O, T extends string | undefined = string | undefined, U extends string | undefined = string | undefined>(descriptor: {type: typeof String} & ThemeAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends number | undefined = number | undefined, U extends number | string | undefined = number | string | undefined>(descriptor: {type: typeof Number} & ThemeAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends boolean | undefined = boolean | undefined, U extends boolean | string | undefined = boolean | string | undefined>(descriptor: {type: typeof Boolean} & ThemeAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T>(descriptor: ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & ThemeAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T>(descriptor: ThemeAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T, I = {}>(descriptor: ThemeAnimatorDescriptor<O, T, U, I>): PropertyDecorator;
}

/** @public */
export interface ThemeAnimator<O = unknown, T = unknown, U = T> extends Animator<O, T, U> {
  /** @protected @override */
  onSetAffinity(newAffinity: Affinity, oldAffinity: Affinity): void;

  /** @protected @override */
  onInherit(superFastener: Property<unknown, T>): void;

  get superLook(): Look<T> | null;

  getSuperLook(): Look<T>;

  getSuperLookOr<E>(elseLook: E): Look<T> | E;

  readonly look: Look<T> | null;

  getLook(): Look<T>;

  getLookOr<E>(elseLook: E): Look<T> | E;

  setLook(newLook: Look<T> | null, timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  setLook(newLook: Look<T> | null, timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  /** @protected */
  willSetLook(newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void;

  /** @protected */
  onSetLook(newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void;

  /** @protected */
  didSetLook(newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void;

  /** @internal */
  applyLook(look: Look<T>, timing: Timing | boolean): void;

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void;

  /** @internal @protected @override */
  tweenInherited(t: number): void;

  /** @protected @override */
  onMount(): void;
}

/** @public */
export const ThemeAnimator = (function (_super: typeof Animator) {
  const ThemeAnimator: ThemeAnimatorFactory = _super.extend("ThemeAnimator");

  ThemeAnimator.prototype.onSetAffinity = function (this: ThemeAnimator, newAffinity: Affinity, oldAffinity: Affinity): void {
    if (newAffinity > Affinity.Intrinsic) {
      this.setLook(null, newAffinity);
    }
    _super.prototype.onSetAffinity.call(this, newAffinity, oldAffinity);
  };

  ThemeAnimator.prototype.onInherit = function <T>(this: ThemeAnimator<unknown, T>, superFastener: Property<any, T>): void {
    if (superFastener instanceof ThemeAnimator) {
      this.setLook(superFastener.look, superFastener.timing, Affinity.Reflexive);
    } else {
      this.setLook(null, Affinity.Reflexive);
    }
    if (this.look === null) {
      _super.prototype.onInherit.call(this, superFastener)
    }
  };

  Object.defineProperty(ThemeAnimator.prototype, "superLook", {
    get: function <T>(this: ThemeAnimator<unknown, T>): Look<T> | null {
      const superFastener = this.superFastener;
      return superFastener instanceof ThemeAnimator ? superFastener.look : null;
    },
    configurable: true,
  });

  ThemeAnimator.prototype.getSuperLook = function <T>(this: ThemeAnimator<unknown, T>): Look<T> {
    const superLook = this.superLook;
    if (superLook === null) {
      throw new TypeError(superLook + " " + this.name + " super look");
    }
    return superLook;
  };

  ThemeAnimator.prototype.getSuperLookOr = function <T, E>(this: ThemeAnimator<unknown, T>, elseLook: E): Look<T> | E {
    let superLook: Look<T> | E | null = this.superLook;
    if (superLook === null) {
      superLook = elseLook;
    }
    return superLook;
  };

  ThemeAnimator.prototype.getLook = function <T>(this: ThemeAnimator<unknown, T>): Look<T> {
    const look = this.look;
    if (look === null) {
      throw new TypeError(look + " " + this.name + " look");
    }
    return look;
  };

  ThemeAnimator.prototype.getLookOr = function <T, E>(this: ThemeAnimator<unknown, T>, elseLook: E): Look<T> | E {
    let look: Look<T> | E | null = this.look;
    if (look === null) {
      look = elseLook;
    }
    return look;
  };

  ThemeAnimator.prototype.setLook = function <T>(this: ThemeAnimator<unknown, T>, newLook: Look<T> | null, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    if (typeof timing === "number") {
      affinity = timing;
      timing = void 0;
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

  ThemeAnimator.prototype.willSetLook = function <T>(this: ThemeAnimator<unknown, T>, newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void {
    // hook
  };

  ThemeAnimator.prototype.onSetLook = function <T>(this: ThemeAnimator<unknown, T>, newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void {
    if (newLook !== null) {
      this.applyLook(newLook, timing);
    }
  };

  ThemeAnimator.prototype.didSetLook = function <T>(this: ThemeAnimator<unknown, T>, newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void {
    // hook
  };

  ThemeAnimator.prototype.applyLook = function <T>(this: ThemeAnimator<unknown, T>, look: Look<T>, timing: Timing | boolean): void {
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
    const superFastener = this.superFastener;
    if (superFastener instanceof ThemeAnimator) {
      this.setLook(superFastener.look, superFastener.timing, Affinity.Reflexive);
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

  ThemeAnimator.construct = function <A extends ThemeAnimator<any, any>>(animatorClass: {prototype: A}, animator: A | null, owner: FastenerOwner<A>): A {
    animator = _super.construct(animatorClass, animator, owner) as A;
    (animator as Mutable<typeof animator>).look = null;
    return animator;
  };

  ThemeAnimator.specialize = function (type: unknown): ThemeAnimatorFactory | null {
    if (type === String) {
      return StringThemeAnimator;
    } else if (type === Number) {
      return NumberThemeAnimator;
    } else if (type === Boolean) {
      return BooleanThemeAnimator;
    } else if (type === Angle) {
      return AngleThemeAnimator;
    } else if (type === Length) {
      return LengthThemeAnimator;
    } else if (type === Transform) {
      return TransformThemeAnimator;
    } else if (type === Color) {
      return ColorThemeAnimator;
    } else if (type === Font) {
      return FontThemeAnimator;
    } else if (type === Focus) {
      return FocusThemeAnimator;
    } else if (type === Presence) {
      return PresenceThemeAnimator;
    } else if (type === Expansion) {
      return ExpansionThemeAnimator;
    }
    return null;
  };

  ThemeAnimator.define = function <O, T, U>(className: string, descriptor: ThemeAnimatorDescriptor<O, T, U>): ThemeAnimatorFactory<ThemeAnimator<any, T, U>> {
    let superClass = descriptor.extends as ThemeAnimatorFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const look = descriptor.look;
    const state = descriptor.state;
    const initState = descriptor.initState;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.look;
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

    const animatorClass = superClass.extend(className, descriptor);

    animatorClass.construct = function (animatorClass: {prototype: ThemeAnimator<any, any>}, animator: ThemeAnimator<O, T, U> | null, owner: O): ThemeAnimator<O, T, U> {
      animator = superClass!.construct(animatorClass, animator, owner);
      if (affinity !== void 0) {
        animator.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        animator.initInherits(inherits);
      }
      if (look !== void 0) {
        (animator as Mutable<typeof animator>).look = look;
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

  return ThemeAnimator;
})(Animator);
