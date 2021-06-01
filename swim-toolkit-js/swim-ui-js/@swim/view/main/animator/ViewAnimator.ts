// Copyright 2015-2021 Swim inc.
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

import {__extends} from "tslib";
import {FromAny} from "@swim/util";
import type {AnyTiming, Timing} from "@swim/mapping";
import {AnyLength, Length, AnyAngle, Angle, AnyTransform, Transform} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {Look, MoodVector, ThemeMatrix} from "@swim/theme";
import {ViewFlags, ViewPrecedence, View} from "../View";
import {Animator} from "./Animator";
import {StringViewAnimator} from "../"; // forward import
import {BooleanViewAnimator} from "../"; // forward import
import {NumberViewAnimator} from "../"; // forward import
import {AngleViewAnimator} from "../"; // forward import
import {LengthViewAnimator} from "../"; // forward import
import {ColorViewAnimator} from "../"; // forward import
import {FontViewAnimator} from "../"; // forward import
import {TransformViewAnimator} from "../"; // forward import

export type ViewAnimatorMemberType<V, K extends keyof V> =
  V[K] extends ViewAnimator<any, infer T, any> ? T : never;

export type ViewAnimatorMemberInit<V, K extends keyof V> =
  V[K] extends ViewAnimator<any, infer T, infer U> ? T | U : never;

export type ViewAnimatorMemberKey<V, K extends keyof V> =
  V[K] extends ViewAnimator<any, any> ? K : never;

export type ViewAnimatorMemberMap<V> = {
  -readonly [K in keyof V as ViewAnimatorMemberKey<V, K>]?: ViewAnimatorMemberInit<V, K>;
};

export interface ViewAnimatorInit<T, U = never> {
  extends?: ViewAnimatorClass;
  type?: unknown;
  inherit?: string | boolean;

  state?: T | U;
  look?: Look<T>;
  precedence?: ViewPrecedence;
  updateFlags?: ViewFlags;
  isDefined?(value: T): boolean;
  willSetValue?(newValue: T, oldValue: T): void;
  didSetValue?(newValue: T, oldValue: T): void;
  willSetState?(newValue: T, oldValue: T): void;
  didSetState?(newValue: T, oldValue: T): void;
  onBegin?(value: T): void;
  onEnd?(value: T): void;
  onInterrupt?(value: T): void;
  fromAny?(value: T | U): T;
  initState?(): T | U;
}

export type ViewAnimatorDescriptor<V extends View, T, U = never, I = {}> = ViewAnimatorInit<T, U> & ThisType<ViewAnimator<V, T, U> & I> & Partial<I>;

export type ViewAnimatorDescriptorExtends<V extends View, T, U = never, I = {}> = {extends: ViewAnimatorClass | undefined} & ViewAnimatorDescriptor<V, T, U, I>;

export type ViewAnimatorDescriptorFromAny<V extends View, T, U = never, I = {}> = ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & ViewAnimatorDescriptor<V, T, U, I>;

export interface ViewAnimatorConstructor<V extends View, T, U = never, I = {}> {
  new(owner: V, animatorName: string | undefined): ViewAnimator<V, T, U> & I;
  prototype: ViewAnimator<any, any> & I;
}

export interface ViewAnimatorClass extends Function {
  readonly prototype: ViewAnimator<any, any>;
}

export interface ViewAnimator<V extends View, T, U = never> extends Animator<T> {
  (): T;
  (newState: T | U, precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): V;
  (newState: T | U, timing?: AnyTiming | boolean, precedence?: ViewPrecedence): V;

  readonly name: string;

  readonly owner: V;

  readonly inherit: string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  setInherited(inherited: boolean): void;

  /** @hidden */
  readonly superName: string | undefined;

  readonly superAnimator: ViewAnimator<View, T> | null;

  /** @hidden */
  bindSuperAnimator(): void;

  /** @hidden */
  unbindSuperAnimator(): void;

  /** @hidden */
  subAnimators: ViewAnimator<View, T>[] | null;

  /** @hidden */
  addSubAnimator(subAnimator: ViewAnimator<View, T>): void;

  /** @hidden */
  removeSubAnimator(subAnimator: ViewAnimator<View, T>): void;

  readonly superValue: T | undefined;

  getValue(): NonNullable<T>;

  onSetValue(newValue: T, oldValue: T): void;

  readonly superState: T | undefined;

  getState(): NonNullable<T>;

  setState(newState: T | U, precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  setState(newState: T | U, timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;

  /** @hidden */
  setOwnState(newState: T | U, timing?: AnyTiming | boolean): void;

  /** @hidden */
  setImmediateState(newState: T, oldState: T): void;

  /** @hidden */
  onSetPrecedence(newPrecedence: ViewPrecedence, oldPrecedence: ViewPrecedence): void;

  readonly superLook: Look<T> | null;

  onSetLook(newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void;

  applyLook(look: Look<T>, timing: Timing | boolean): void;

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void;

  onAnimate(t: number): void;

  onAnimateInherited(t: number): void;

  willStartAnimating(): void;

  didStartAnimating(): void;

  willStopAnimating(): void;

  didStopAnimating(): void;

  updateFlags?: ViewFlags;

  fromAny(value: T | U): T;

  isMounted(): boolean;

  /** @hidden */
  mount(): void;

  /** @hidden */
  willMount(): void;

  /** @hidden */
  onMount(): void;

  /** @hidden */
  didMount(): void;

  /** @hidden */
  unmount(): void;

  /** @hidden */
  willUnmount(): void;

  /** @hidden */
  onUnmount(): void;

  /** @hidden */
  didUnmount(): void;

  toString(): string;
}

export const ViewAnimator = function <V extends View, T, U>(
    this: ViewAnimator<V, T, U> | typeof ViewAnimator,
    owner: V | ViewAnimatorDescriptor<V, T, U>,
    animatorName?: string,
  ): ViewAnimator<V, T, U> | PropertyDecorator {
  if (this instanceof ViewAnimator) { // constructor
    return ViewAnimatorConstructor.call(this as ViewAnimator<V, unknown, unknown>, owner as V, animatorName);
  } else { // decorator factory
    return ViewAnimatorDecoratorFactory(owner as ViewAnimatorDescriptor<V, T, U>);
  }
} as {
  /** @hidden */
  new<V extends View, T, U = never>(owner: V, animatorName: string | undefined): ViewAnimator<V, T, U>;

  <V extends View, T extends Angle | null | undefined = Angle | null | undefined, U extends AnyAngle | null | undefined = AnyAngle | null | undefined>(descriptor: {type: typeof Angle} & ViewAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends View, T extends Length | null | undefined = Length | null | undefined, U extends AnyLength | null | undefined = AnyLength | null | undefined>(descriptor: {type: typeof Length} & ViewAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends View, T extends Color | null | undefined = Color | null | undefined, U extends AnyColor | null | undefined = AnyColor | null | undefined>(descriptor: {type: typeof Color} & ViewAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends View, T extends Font | null | undefined = Font | null | undefined, U extends AnyFont | null | undefined = AnyFont | null | undefined>(descriptor: {type: typeof Font} & ViewAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends View, T extends Transform | null | undefined = Transform | null | undefined, U extends AnyTransform | null | undefined = AnyTransform | null | undefined>(descriptor: {type: typeof Transform} & ViewAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends View, T extends string | null | undefined = string | null | undefined, U extends string | null | undefined = string | null | undefined>(descriptor: {type: typeof String} & ViewAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends View, T extends boolean | null | undefined = boolean | null | undefined, U extends boolean | string | null | undefined = boolean | string | null | undefined>(descriptor: {type: typeof Boolean} & ViewAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends View, T extends number | null | undefined = number | null | undefined, U extends number | string | null | undefined = number | string | null | undefined>(descriptor: {type: typeof Number} & ViewAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends View, T, U = never>(descriptor: ViewAnimatorDescriptorFromAny<V, T, U>): PropertyDecorator;
  <V extends View, T, U = never, I = {}>(descriptor: ViewAnimatorDescriptorExtends<V, T, U, I>): PropertyDecorator;
  <V extends View, T, U = never>(descriptor: ViewAnimatorDescriptor<V, T, U>): PropertyDecorator;

  /** @hiddem */
  prototype: ViewAnimator<any, any>;

  /** @hidden */
  getClass(type: unknown): ViewAnimatorClass | null;

  define<V extends View, T, U = never, I = {}>(descriptor: ViewAnimatorDescriptorExtends<V, T, U, I>): ViewAnimatorConstructor<V, T, U, I>;
  define<V extends View, T, U = never>(descriptor: ViewAnimatorDescriptor<V, T, U>): ViewAnimatorConstructor<V, T, U>;
};
__extends(ViewAnimator, Animator);

function ViewAnimatorConstructor<V extends View, T, U>(this: ViewAnimator<V, T, U>, owner: V, animatorName: string | undefined): ViewAnimator<V, T, U> {
  const _this: ViewAnimator<V, T, U> = (Animator as Function).call(this) || this;
  if (animatorName !== void 0) {
    Object.defineProperty(_this, "name", {
      value: animatorName,
      enumerable: true,
      configurable: true,
    });
  }
  Object.defineProperty(_this, "owner", {
    value: owner,
    enumerable: true,
  });
  Object.defineProperty(_this, "inherit", {
    value: false,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(_this, "superAnimator", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(_this, "subAnimators", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  return _this;
}

function ViewAnimatorDecoratorFactory<V extends View, T, U>(descriptor: ViewAnimatorDescriptor<V, T, U>): PropertyDecorator {
  return View.decorateViewAnimator.bind(ViewAnimator, ViewAnimator.define(descriptor as ViewAnimatorDescriptor<View, unknown>));
}

ViewAnimator.prototype.setInherit = function (this: ViewAnimator<View, unknown>, inherit: string | boolean): void {
  if (this.inherit !== inherit) {
    this.unbindSuperAnimator();
    Object.defineProperty(this, "inherit", {
      value: inherit,
      enumerable: true,
      configurable: true,
    });
    this.bindSuperAnimator();
  }
};

ViewAnimator.prototype.isInherited = function (this: ViewAnimator<View, unknown>): boolean {
  return (this.animatorFlags & Animator.InheritedFlag) !== 0;
};

ViewAnimator.prototype.setInherited = function (this: ViewAnimator<View, unknown>, inherited: boolean): void {
  if (inherited && (this.animatorFlags & Animator.InheritedFlag) === 0) {
    const superAnimator = this.superAnimator;
    if (superAnimator !== null && superAnimator.precedence >= this.precedence) {
      this.setAnimatorFlags(this.animatorFlags & ~Animator.OverrideFlag | Animator.InheritedFlag);
      this.setOwnLook(superAnimator.look);
      if (this.look === null) {
        Object.defineProperty(this, "ownState", {
          value: superAnimator.state,
          enumerable: true,
          configurable: true,
        });
        this.setValue(superAnimator.value, this.value);
        if (superAnimator.isAnimating()) {
          this.startAnimating();
        } else {
          this.stopAnimating();
        }
      }
    }
  } else if (!inherited && (this.animatorFlags & Animator.InheritedFlag) !== 0) {
    const superAnimator = this.superAnimator;
    if (superAnimator !== null && superAnimator.precedence < this.precedence) {
      this.setAnimatorFlags(this.animatorFlags & ~Animator.InheritedFlag);
    }
  }
};

Object.defineProperty(ViewAnimator.prototype, "superName", {
  get: function (this: ViewAnimator<View, unknown>): string | undefined {
    const inherit = this.inherit;
    return typeof inherit === "string" ? inherit : inherit === true ? this.name : void 0;
  },
  enumerable: true,
  configurable: true,
});

ViewAnimator.prototype.bindSuperAnimator = function (this: ViewAnimator<View, unknown>): void {
  const superName = this.superName;
  if (superName !== void 0 && this.isMounted()) {
    let superView = this.owner.parentView;
    while (superView !== null) {
      const superAnimator = superView.getLazyViewAnimator(superName);
      if (superAnimator !== null) {
        Object.defineProperty(this, "superAnimator", {
          value: superAnimator,
          enumerable: true,
          configurable: true,
        });
        superAnimator.addSubAnimator(this);
        if ((this.animatorFlags & Animator.OverrideFlag) === 0 && superAnimator.precedence >= this.precedence) {
          this.setAnimatorFlags(this.animatorFlags | Animator.InheritedFlag);
          this.setOwnLook(superAnimator.look);
          if (this.look === null) {
            Object.defineProperty(this, "ownState", {
              value: superAnimator.state,
              enumerable: true,
              configurable: true,
            });
            this.setValue(superAnimator.value, this.value);
            if (superAnimator.isAnimating()) {
              this.startAnimating();
            } else {
              this.stopAnimating();
            }
          }
        }
        break;
      }
      superView = superView.parentView;
    }
  }
};

ViewAnimator.prototype.unbindSuperAnimator = function (this: ViewAnimator<View, unknown>): void {
  const superAnimator = this.superAnimator;
  if (superAnimator !== null) {
    superAnimator.removeSubAnimator(this);
    Object.defineProperty(this, "superAnimator", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    this.setAnimatorFlags(this.animatorFlags & ~Animator.InheritedFlag);
  }
};

ViewAnimator.prototype.addSubAnimator = function <T>(this: ViewAnimator<View, T>, subAnimator: ViewAnimator<View, T>): void {
  let subAnimators = this.subAnimators;
  if (subAnimators === null) {
    subAnimators = [];
    Object.defineProperty(this, "subAnimators", {
      value: subAnimators,
      enumerable: true,
      configurable: true,
    });
  }
  subAnimators.push(subAnimator);
};

ViewAnimator.prototype.removeSubAnimator = function <T>(this: ViewAnimator<View, T>,  subAnimator: ViewAnimator<View, T>): void {
  const subAnimators = this.subAnimators;
  if (subAnimators !== null) {
    const index = subAnimators.indexOf(subAnimator);
    if (index >= 0) {
      subAnimators.splice(index, 1);
    }
  }
};

Object.defineProperty(ViewAnimator.prototype, "superValue", {
  get: function <T>(this: ViewAnimator<View, T>): T | undefined {
    const superAnimator = this.superAnimator;
    return superAnimator !== null ? superAnimator.value : void 0;
  },
  enumerable: true,
  configurable: true,
});

ViewAnimator.prototype.getValue = function <T, U>(this: ViewAnimator<View, T, U>): NonNullable<T> {
  const value = this.value;
  if (value === void 0 || value === null) {
    throw new TypeError(value + " " + this.name + " value");
  }
  return value as NonNullable<T>;
};

ViewAnimator.prototype.onSetValue = function <T>(this: ViewAnimator<View, T>, newValue: T, oldValue: T): void {
  const updateFlags = this.updateFlags;
  if (updateFlags !== void 0) {
    this.owner.requireUpdate(updateFlags);
  }
};

Object.defineProperty(ViewAnimator.prototype, "superState", {
  get: function <T>(this: ViewAnimator<View, T>): T | undefined {
    const superAnimator = this.superAnimator;
    return superAnimator !== null ? superAnimator.state : void 0;
  },
  enumerable: true,
  configurable: true,
});

ViewAnimator.prototype.getState = function <T, U>(this: ViewAnimator<View, T, U>): NonNullable<T> {
  const state = this.state;
  if (state === void 0 || state === null) {
    throw new TypeError(state + " " + this.name + " state");
  }
  return state as NonNullable<T>;
};

ViewAnimator.prototype.setOwnState = function <T, U>(this: ViewAnimator<View, T, U>, state: T | U, timing?: AnyTiming | boolean): void {
  state = this.fromAny(state);
  Animator.prototype.setOwnState.call(this, state, timing);
};

ViewAnimator.prototype.setImmediateState = function <T>(this: ViewAnimator<View, T>, newState: T, oldState: T): void {
  Animator.prototype.setImmediateState.call(this, newState, oldState);
  const subAnimators = this.subAnimators;
  if (subAnimators !== null) {
    for (let i = 0, n = subAnimators.length; i < n; i += 1) {
      const subAnimator = subAnimators[i]!;
      if (subAnimator.isInherited()) {
        subAnimator.startAnimating();
      }
    }
  }
};

ViewAnimator.prototype.onSetPrecedence = function (this: ViewAnimator<View, unknown>, newPrecedence: ViewPrecedence, oldPrecedence: ViewPrecedence): void {
  if (newPrecedence > oldPrecedence && (this.animatorFlags & Animator.InheritedFlag) !== 0) {
    const superAnimator = this.superAnimator;
    if (superAnimator !== null && superAnimator.precedence < this.precedence) {
      this.setAnimatorFlags(this.animatorFlags & ~Animator.InheritedFlag);
    }
  }
};

Object.defineProperty(ViewAnimator.prototype, "superLook", {
  get: function <T>(this: ViewAnimator<View, T>): Look<T> | null {
    const superAnimator = this.superAnimator;
    return superAnimator !== null ? superAnimator.look : null;
  },
  enumerable: true,
  configurable: true,
});

ViewAnimator.prototype.onSetLook = function <T>(this: ViewAnimator<View, T>, newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void {
  if (newLook !== null) {
    this.applyLook(newLook, timing);
  }
};

ViewAnimator.prototype.applyLook = function <T>(this: ViewAnimator<View, T>, look: Look<T>, timing: Timing | boolean): void {
  if (this.owner.isMounted()) {
    const state = this.owner.getLook(look);
    if (state !== void 0) {
      if (timing === true) {
        timing = this.owner.getLookOr(Look.timing, true);
      }
      this.setOwnState(state, timing);
    }
  } else {
    this.owner.requireUpdate(View.NeedsChange);
  }
};

ViewAnimator.prototype.applyTheme = function <T>(this: ViewAnimator<View, T>, theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
  const look = this.look;
  if (look !== null) {
    const state = theme.get(look, mood);
    if (state !== void 0) {
      if (timing === true) {
        timing = this.owner.getLookOr(Look.timing, true);
      }
      this.setOwnState(state, timing);
    }
  }
};

ViewAnimator.prototype.onAnimate = function (this: ViewAnimator<View, unknown>, t: number): void {
  if (!this.isInherited()) {
    Animator.prototype.onAnimate.call(this, t);
  } else {
    this.onAnimateInherited(t);
  }
};

ViewAnimator.prototype.onAnimateInherited = function (this: ViewAnimator<View, unknown>, t: number): void {
  const superAnimator = this.superAnimator;
  if (superAnimator !== null && superAnimator.precedence >= this.precedence) {
    this.setOwnLook(superAnimator.look);
    if (this.look !== null) {
      Animator.prototype.onAnimate.call(this, t);
    } else {
      Object.defineProperty(this, "ownState", {
        value: superAnimator.state,
        enumerable: true,
        configurable: true,
      });
      this.setValue(superAnimator.value, this.value);
      if (!superAnimator.isAnimating()) {
        this.stopAnimating();
      }
    }
  } else {
    this.stopAnimating();
  }
};

ViewAnimator.prototype.willStartAnimating = function (this: ViewAnimator<View, unknown>): void {
  this.owner.trackWillStartAnimating(this);
  const subAnimators = this.subAnimators;
  if (subAnimators !== null) {
    for (let i = 0, n = subAnimators.length; i < n; i += 1) {
      const subAnimator = subAnimators[i]!;
      if (subAnimator.isInherited()) {
        subAnimator.startAnimating();
      }
    }
  }
};

ViewAnimator.prototype.didStartAnimating = function (this: ViewAnimator<View, unknown>): void {
  this.owner.trackDidStartAnimating(this);
};

ViewAnimator.prototype.willStopAnimating = function (this: ViewAnimator<View, unknown>): void {
  this.owner.trackWillStopAnimating(this);
};

ViewAnimator.prototype.didStopAnimating = function (this: ViewAnimator<View, unknown>): void {
  this.owner.trackDidStopAnimating(this);
};

ViewAnimator.prototype.fromAny = function <T, U>(this: ViewAnimator<View, T, U>, value: T | U): T {
  return value as T;
};

ViewAnimator.prototype.isMounted = function (this: ViewAnimator<View, unknown>): boolean {
  return (this.animatorFlags & Animator.MountedFlag) !== 0;
};

ViewAnimator.prototype.mount = function (this: ViewAnimator<View, unknown>): void {
  if ((this.animatorFlags & Animator.MountedFlag) === 0) {
    this.willMount();
    this.setAnimatorFlags(this.animatorFlags | Animator.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ViewAnimator.prototype.willMount = function (this: ViewAnimator<View, unknown>): void {
  // hook
};

ViewAnimator.prototype.onMount = function (this: ViewAnimator<View, unknown>): void {
  this.bindSuperAnimator();
  const look = this.look;
  if (look !== null) {
    this.applyLook(look, false);
  }
};

ViewAnimator.prototype.didMount = function (this: ViewAnimator<View, unknown>): void {
  // hook
};

ViewAnimator.prototype.unmount = function (this: ViewAnimator<View, unknown>): void {
  if ((this.animatorFlags & Animator.MountedFlag) !== 0) {
    this.willUnmount();
    this.setAnimatorFlags(this.animatorFlags & ~Animator.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ViewAnimator.prototype.willUnmount = function (this: ViewAnimator<View, unknown>): void {
  // hook
};

ViewAnimator.prototype.onUnmount = function (this: ViewAnimator<View, unknown>): void {
  this.stopAnimating();
  this.unbindSuperAnimator();
};

ViewAnimator.prototype.didUnmount = function (this: ViewAnimator<View, unknown>): void {
  // hook
};

ViewAnimator.prototype.toString = function (this: ViewAnimator<View, unknown>): string {
  return this.name;
};

ViewAnimator.getClass = function (type: unknown): ViewAnimatorClass | null {
  if (type === String) {
    return StringViewAnimator;
  } else if (type === Boolean) {
    return BooleanViewAnimator;
  } else if (type === Number) {
    return NumberViewAnimator;
  } else if (type === Angle) {
    return AngleViewAnimator;
  } else if (type === Length) {
    return LengthViewAnimator;
  } else if (type === Color) {
    return ColorViewAnimator;
  } else if (type === Font) {
    return FontViewAnimator;
  } else if (type === Transform) {
    return TransformViewAnimator;
  }
  return null;
};

ViewAnimator.define = function <V extends View, T, U, I>(descriptor: ViewAnimatorDescriptor<V, T, U, I>): ViewAnimatorConstructor<V, T, U, I> {
  let _super: ViewAnimatorClass | null | undefined = descriptor.extends;
  const inherit = descriptor.inherit;
  const state = descriptor.state;
  const look = descriptor.look;
  const precedence = descriptor.precedence;
  const initState = descriptor.initState;
  delete descriptor.extends;
  delete descriptor.inherit;
  delete descriptor.state;
  delete descriptor.look;
  delete descriptor.precedence;
  delete descriptor.initState;

  if (_super === void 0) {
    _super = ViewAnimator.getClass(descriptor.type);
  }
  if (_super === null) {
    _super = ViewAnimator;
    if (descriptor.fromAny === void 0 && FromAny.is<T, U>(descriptor.type)) {
      descriptor.fromAny = descriptor.type.fromAny;
    }
  }

  const _constructor = function DecoratedViewAnimator(this: ViewAnimator<V, T, U>, owner: V, animatorName: string | undefined): ViewAnimator<V, T, U> {
    let _this: ViewAnimator<V, T, U> = function ViewAnimatorAccessor(state?: T | U, timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): T | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        if (arguments.length === 2) {
          _this.setState(state!, timing);
        } else {
          _this.setState(state!, timing as AnyTiming | boolean | undefined, precedence);
        }
        return _this.owner;
      }
    } as ViewAnimator<V, T, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, animatorName) || _this;
    let ownState: T | undefined;
    if (initState !== void 0) {
      ownState = _this.fromAny(initState());
    } else if (state !== void 0) {
      ownState = _this.fromAny(state);
    }
    if (ownState !== void 0) {
      Object.defineProperty(_this, "ownValue", {
        value: ownState,
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(_this, "ownState", {
        value: ownState,
        enumerable: true,
        configurable: true,
      });
    }
    if (look !== void 0) {
      Object.defineProperty(_this, "ownLook", {
        value: look,
        enumerable: true,
        configurable: true,
      });
    }
    if (precedence !== void 0) {
      Object.defineProperty(_this, "precedence", {
        value: precedence,
        enumerable: true,
        configurable: true,
      });
    }
    if (inherit !== void 0) {
      Object.defineProperty(_this, "inherit", {
        value: inherit,
        enumerable: true,
        configurable: true,
      });
    }
    return _this;
  } as unknown as ViewAnimatorConstructor<V, T, U, I>

  const _prototype = descriptor as unknown as ViewAnimator<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};
