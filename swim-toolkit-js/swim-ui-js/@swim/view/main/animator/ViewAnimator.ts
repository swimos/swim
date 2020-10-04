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

import {__extends} from "tslib";
import {Objects, FromAny} from "@swim/util";
import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {AnyTransform, Transform} from "@swim/transform";
import {ContinuousScale} from "@swim/scale";
import {Tween} from "@swim/transition";
import {Animator, TweenAnimator} from "@swim/animate";
import {ViewFlags, View} from "../View";
import {StringViewAnimator} from "./StringViewAnimator";
import {BooleanViewAnimator} from "./BooleanViewAnimator";
import {NumberViewAnimator} from "./NumberViewAnimator";
import {AngleViewAnimator} from "./AngleViewAnimator";
import {LengthViewAnimator} from "./LengthViewAnimator";
import {ColorViewAnimator} from "./ColorViewAnimator";
import {FontViewAnimator} from "./FontViewAnimator";
import {TransformViewAnimator} from "./TransformViewAnimator";
import {ContinuousScaleViewAnimator} from "./ContinuousScaleViewAnimator";

export type ViewAnimatorMemberType<V, K extends keyof V> =
  V extends {[P in K]: ViewAnimator<any, infer T, any>} ? T : unknown;

export type ViewAnimatorMemberInit<V, K extends keyof V> =
  V extends {[P in K]: ViewAnimator<any, infer T, infer U>} ? T | U : unknown;

export interface ViewAnimatorInit<T, U = T> {
  extends?: ViewAnimatorPrototype;
  type?: unknown;
  state?: T | U;
  inherit?: string | boolean;

  updateFlags?: ViewFlags;
  willUpdate?(newValue: T, oldValue: T): void;
  onUpdate?(newValue: T, oldValue: T): void;
  didUpdate?(newValue: T, oldValue: T): void;
  fromAny?(value: T | U): T;
  initState?(): T | U;
}

export type ViewAnimatorDescriptorInit<V extends View, T, U = T, I = {}> = ViewAnimatorInit<T, U> & ThisType<ViewAnimator<V, T, U> & I> & I;

export type ViewAnimatorDescriptorExtends<V extends View, T, U = T, I = {}> = {extends: ViewAnimatorPrototype | undefined} & ViewAnimatorDescriptorInit<V, T, U, I>;

export type ViewAnimatorDescriptorFromAny<V extends View, T, U = T, I = {}> = ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & ViewAnimatorDescriptorInit<V, T, U, I>;

export type ViewAnimatorDescriptor<V extends View, T, U = T, I = {}> =
  U extends T ? ViewAnimatorDescriptorInit<V, T, U, I> :
  T extends Angle | null | undefined ? U extends AnyAngle | null | undefined ? {type: typeof Angle} & ViewAnimatorDescriptorInit<V, T, U, I> : ViewAnimatorDescriptorExtends<V, T, U, I> :
  T extends Length | null | undefined ? U extends AnyLength | null | undefined ? {type: typeof Length} & ViewAnimatorDescriptorInit<V, T, U, I> : ViewAnimatorDescriptorExtends<V, T, U, I> :
  T extends Color | null | undefined ? U extends AnyColor | null | undefined ? {type: typeof Color} & ViewAnimatorDescriptorInit<V, T, U, I> : ViewAnimatorDescriptorExtends<V, T, U, I> :
  T extends Font | null | undefined ? U extends AnyFont | null | undefined ? {type: typeof Font} & ViewAnimatorDescriptorInit<V, T, U, I> : ViewAnimatorDescriptorExtends<V, T, U, I> :
  T extends Transform | null | undefined ? U extends AnyTransform | null | undefined ? {type: typeof Transform} & ViewAnimatorDescriptorInit<V, T, U, I> : ViewAnimatorDescriptorExtends<V, T, U, I> :
  T extends ContinuousScale<infer X, infer Y> | undefined ? U extends ContinuousScale<X, Y> | string | undefined ? {type: typeof ContinuousScale} & ViewAnimatorDescriptorInit<V, T, U, I> : ViewAnimatorDescriptorExtends<V, T, U, I> :
  T extends string | null | undefined ? U extends string | null | undefined ? {type: typeof String} & ViewAnimatorDescriptorInit<V, T, U, I> : ViewAnimatorDescriptorExtends<V, T, U, I> :
  T extends boolean | null | undefined ? U extends boolean | string | null | undefined ? {type: typeof Boolean} & ViewAnimatorDescriptorInit<V, T, U, I> : ViewAnimatorDescriptorExtends<V, T, U, I> :
  T extends number | null | undefined ? U extends number | string | null | undefined ? {type: typeof Number} & ViewAnimatorDescriptorInit<V, T, U, I> : ViewAnimatorDescriptorExtends<V, T, U, I> :
  ViewAnimatorDescriptorFromAny<V, T, U, I>;

export type ViewAnimatorPrototype = Function & {prototype: ViewAnimator<any, any, any>};

export type ViewAnimatorConstructor<V extends View, T, U = T, I = {}> = {
  new(view: V, animatorName: string | undefined): ViewAnimator<V, T, U> & I;
  prototype: ViewAnimator<any, any, any> & I;
};

export declare abstract class ViewAnimator<V extends View, T, U = T> {
  /** @hidden */
  _view: V;
  /** @hidden */
  _inherit: string | boolean;
  /** @hidden */
  _superAnimator?: ViewAnimator<View, T, U>;
  /** @hidden */
  _subAnimators?: ViewAnimator<View, T, U>[];

  constructor(view: V, animatorName: string | undefined);

  get name(): string;

  get view(): V;

  get inherit(): string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  setInherited(inherited: boolean): void;

  updateFlags?: ViewFlags;

  /** @hidden */
  get superName(): string | undefined;

  get superAnimator(): ViewAnimator<View, T, U> | null;

  /** @hidden */
  bindSuperAnimator(): void;

  /** @hidden */
  unbindSuperAnimator(): void;

  /** @hidden */
  addSubAnimator(subAnimator: ViewAnimator<View, T, U>): void;

  /** @hidden */
  removeSubAnimator(subAnimator: ViewAnimator<View, T, U>): void;

  isAuto(): boolean;

  setAuto(auto: boolean): void;

  isTweening(): boolean;

  get ownValue(): T | undefined;

  get ownState(): T | undefined;

  get superValue(): T | undefined;

  get superState(): T | undefined;

  getValue(): T extends undefined ? never : T;

  getState(): T extends undefined ? never : T;

  getValueOr<E>(elseValue: E): (T extends undefined ? never : T) | E;

  getStateOr<E>(elseState: E): (T extends undefined ? never : T) | E;

  setState(state: T | U, tween?: Tween<T>): void;

  setAutoState(state: T | U, tween?: Tween<T>): void;

  setOwnState(state: T | U, tween?: Tween<T>): void;

  setBaseState(state: T | U, tween?: Tween<T>): void;

  onAnimate(t: number): void;

  onAnimateInherited(): void;

  update(newValue: T, oldValue: T): void;

  onUpdate(newValue: T, oldValue: T): void;

  /** @hidden */
  updateSubAnimators(newValue: T, oldValue: T): void;

  animate(animator?: Animator): void;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;

  fromAny(value: T | U): T;

  /** @hidden */
  initState?(): T | U;

  /** @hidden */
  static getConstructor(type: unknown): ViewAnimatorPrototype | null;

  static define<V extends View, T, U = T, I = {}>(descriptor: ViewAnimatorDescriptorExtends<V, T, U, I>): ViewAnimatorConstructor<V, T, U, I>;
  static define<V extends View, T, U = T>(descriptor: ViewAnimatorDescriptor<V, T, U>): ViewAnimatorConstructor<V, T, U>;

  // Forward type declarations
  /** @hidden */
  static String: typeof StringViewAnimator; // defined by StringViewAnimator
  /** @hidden */
  static Boolean: typeof BooleanViewAnimator; // defined by BooleanViewAnimator
  /** @hidden */
  static Number: typeof NumberViewAnimator; // defined by NumberViewAnimator
  /** @hidden */
  static Angle: typeof AngleViewAnimator; // defined by AngleViewAnimator
  /** @hidden */
  static Length: typeof LengthViewAnimator; // defined by LengthViewAnimator
  /** @hidden */
  static Color: typeof ColorViewAnimator; // defined by ColorViewAnimator
  /** @hidden */
  static Font: typeof FontViewAnimator; // defined by FontViewAnimator
  /** @hidden */
  static Transform: typeof TransformViewAnimator; // defined by TransformViewAnimator
  /** @hidden */
  static ContinuousScale: typeof ContinuousScaleViewAnimator; // defined by ContinuousScaleViewAnimator
}

export interface ViewAnimator<V extends View, T, U = T> extends TweenAnimator<T> {
  (): T;
  (state: T | U, tween?: Tween<T>): V;
}

export function ViewAnimator<V extends View, T, U = T, I = {}>(descriptor: ViewAnimatorDescriptorExtends<V, T, U, I>): PropertyDecorator;
export function ViewAnimator<V extends View, T, U = T>(descriptor: ViewAnimatorDescriptor<V, T, U>): PropertyDecorator;

export function ViewAnimator<V extends View, T, U>(
    this: ViewAnimator<V, T, U> | typeof ViewAnimator,
    view: V | ViewAnimatorDescriptor<V, T, U>,
    animatorName?: string,
  ): ViewAnimator<V, T, U> | PropertyDecorator {
  if (this instanceof ViewAnimator) { // constructor
    return ViewAnimatorConstructor.call(this, view as V, animatorName);
  } else { // decorator factory
    return ViewAnimatorDecoratorFactory(view as ViewAnimatorDescriptor<V, T, U>);
  }
}
__extends(ViewAnimator, TweenAnimator);
View.Animator = ViewAnimator;

function ViewAnimatorConstructor<V extends View, T, U>(this: ViewAnimator<V, T, U>, view: V, animatorName: string | undefined): ViewAnimator<V, T, U> {
  const _this: ViewAnimator<V, T, U> = TweenAnimator.call(this, void 0, null) || this;
  if (animatorName !== void 0) {
    Object.defineProperty(_this, "name", {
      value: animatorName,
      enumerable: true,
      configurable: true,
    });
  }
  _this._view = view;
  if (_this.initState !== void 0) {
    const initState = _this.initState();
    if (initState !== void 0) {
      _this._state = _this.fromAny(initState);
      _this._value = _this._state;
    }
  } else if (this._inherit !== false) {
    this._animatorFlags |= TweenAnimator.InheritedFlag;
  }
  return _this;
}

function ViewAnimatorDecoratorFactory<V extends View, T, U>(descriptor: ViewAnimatorDescriptor<V, T, U>): PropertyDecorator {
  return View.decorateViewAnimator.bind(ViewAnimator, ViewAnimator.define(descriptor));
}

Object.defineProperty(ViewAnimator.prototype, "view", {
  get: function <V extends View>(this: ViewAnimator<V, unknown>): V {
    return this._view;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewAnimator.prototype, "inherit", {
  get: function (this: ViewAnimator<View, unknown>): string | boolean {
    return this._inherit;
  },
  enumerable: true,
  configurable: true,
});

ViewAnimator.prototype.setInherit = function (this: ViewAnimator<View, unknown>,
                                              inherit: string | boolean): void {
  if (this._inherit !== inherit) {
    this.unbindSuperAnimator();
    if (inherit !== false) {
      this._inherit = inherit;
      this.bindSuperAnimator();
    } else if (this._inherit !== false) {
      this._inherit = false;
    }
  }
};

ViewAnimator.prototype.isInherited = function (this: ViewAnimator<View, unknown>): boolean {
  return (this._animatorFlags & TweenAnimator.InheritedFlag) !== 0;
};

ViewAnimator.prototype.setInherited = function (this: ViewAnimator<View, unknown>,
                                             inherited: boolean): void {
  if (inherited && (this._animatorFlags & TweenAnimator.InheritedFlag) === 0) {
    this._animatorFlags |= TweenAnimator.InheritedFlag;
    this.animate();
  } else if (!inherited && (this._animatorFlags & TweenAnimator.InheritedFlag) !== 0) {
    this._animatorFlags &= ~TweenAnimator.InheritedFlag;
    this.animate();
  }
};

Object.defineProperty(ViewAnimator.prototype, "superName", {
  get: function (this: ViewAnimator<View, unknown>): string | undefined {
    const inherit = this._inherit;
    return typeof inherit === "string" ? inherit : inherit === true ? this.name : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewAnimator.prototype, "superAnimator", {
  get: function (this: ViewAnimator<View, unknown>): ViewAnimator<View, unknown> | null {
    let superAnimator: ViewAnimator<View, unknown> | null | undefined = this._superAnimator;
    if (superAnimator === void 0) {
      superAnimator = null;
      let view = this._view;
      if (!view.isMounted()) {
        const superName = this.superName;
        if (superName !== void 0) {
          do {
            const parentView = view.parentView;
            if (parentView !== null) {
              view = parentView;
              const animator = view.getLazyViewAnimator(superName);
              if (animator !== null) {
                superAnimator = animator;
              } else {
                continue;
              }
            }
            break;
          } while (true);
        }
      }
    }
    return superAnimator;
  },
  enumerable: true,
  configurable: true,
});

ViewAnimator.prototype.bindSuperAnimator = function (this: ViewAnimator<View, unknown>): void {
  let view = this._view;
  if (view.isMounted()) {
    const superName = this.superName;
    if (superName !== void 0) {
      do {
        const parentView = view.parentView;
        if (parentView !== null) {
          view = parentView;
          const animator = view.getLazyViewAnimator(superName);
          if (animator !== null) {
            this._superAnimator = animator;
            animator.addSubAnimator(this);
            if (this.isInherited()) {
              this._state = animator._state;
              this._value = animator._value;
              this._animatorFlags |= TweenAnimator.UpdatedFlag;
              this.animate();
            }
          } else {
            continue;
          }
        }
        break;
      } while (true);
    }
  }
};

ViewAnimator.prototype.unbindSuperAnimator = function (this: ViewAnimator<View, unknown>): void {
  const superAnimator = this._superAnimator;
  if (superAnimator !== void 0) {
    superAnimator.removeSubAnimator(this);
    this._superAnimator = void 0;
  }
};

ViewAnimator.prototype.addSubAnimator = function <T, U>(this: ViewAnimator<View, T, U>,
                                                        subAnimator: ViewAnimator<View, T, U>): void {
  let subAnimators = this._subAnimators;
  if (subAnimators === void 0) {
    subAnimators = [];
    this._subAnimators = subAnimators;
  }
  subAnimators.push(subAnimator);
};

ViewAnimator.prototype.removeSubAnimator = function <T, U>(this: ViewAnimator<View, T, U>,
                                                           subAnimator: ViewAnimator<View, T, U>): void {
  const subAnimators = this._subAnimators;
  if (subAnimators !== void 0) {
    const index = subAnimators.indexOf(subAnimator);
    if (index >= 0) {
      subAnimators.splice(index, 1);
    }
  }
};

ViewAnimator.prototype.isAuto = function (this: ViewAnimator<View, unknown>): boolean {
  return (this._animatorFlags & TweenAnimator.OverrideFlag) === 0;
};

ViewAnimator.prototype.setAuto = function (this: ViewAnimator<View, unknown>,
                                           auto: boolean): void {
  if (auto && (this._animatorFlags & TweenAnimator.OverrideFlag) !== 0) {
    this._animatorFlags &= ~TweenAnimator.OverrideFlag;
  } else if (!auto && (this._animatorFlags & TweenAnimator.OverrideFlag) === 0) {
    this._animatorFlags |= TweenAnimator.OverrideFlag;
  }
};

ViewAnimator.prototype.isTweening = function (this: ViewAnimator<View, unknown>): boolean {
  if (!this.isInherited()) {
    return (this._animatorFlags & TweenAnimator.TweeningFlag) !== 0;
  } else {
    const superAnimator = this.superAnimator;
    return superAnimator !== null && superAnimator.isTweening();
  }
};

Object.defineProperty(ViewAnimator.prototype, "ownValue", {
  get: function <T, U>(this: ViewAnimator<View, T, U>): T | undefined {
    return !this.isInherited() ? this.value : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewAnimator.prototype, "ownState", {
  get: function <T, U>(this: ViewAnimator<View, T, U>): T | undefined {
    return !this.isInherited() ? this.state : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewAnimator.prototype, "superValue", {
  get: function <T, U>(this: ViewAnimator<View, T, U>): T | undefined {
    const superAnimator = this.superAnimator;
    return superAnimator !== null ? superAnimator.value : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewAnimator.prototype, "superState", {
  get: function <T, U>(this: ViewAnimator<View, T, U>): T | undefined {
    const superAnimator = this.superAnimator;
    return superAnimator !== null ? superAnimator.state : void 0;
  },
  enumerable: true,
  configurable: true,
});

ViewAnimator.prototype.getValue = function <T, U>(this: ViewAnimator<View, T, U>): T extends undefined ? never : T {
  const value = this.value;
  if (value === void 0) {
    throw new TypeError("undefined " + this.name + " value");
  }
  return value as T extends undefined ? never : T;
};

ViewAnimator.prototype.getState = function <T, U>(this: ViewAnimator<View, T, U>): T extends undefined ? never : T {
  const state = this.state;
  if (state === void 0) {
    throw new TypeError("undefined " + this.name + " state");
  }
  return state as T extends undefined ? never : T;
};

ViewAnimator.prototype.getValueOr = function <T, U, E>(this: ViewAnimator<View, T, U>,
                                                       elseValue: E): (T extends undefined ? never : T) | E {
  let value: T | E | undefined = this.value;
  if (value === void 0) {
    value = elseValue;
  }
  return value as (T extends undefined ? never : T) | E;
};

ViewAnimator.prototype.getStateOr = function <T, U, E>(this: ViewAnimator<View, T, U>,
                                                       elseState: E): (T extends undefined ? never : T) | E {
  let state: T | E | undefined = this.state;
  if (state === void 0) {
    state = elseState
  }
  return state as (T extends undefined ? never : T) | E;
};

ViewAnimator.prototype.setState = function <T, U>(this: ViewAnimator<View, T, U>,
                                                  state: T | U, tween?: Tween<T>): void {
  this._animatorFlags |= TweenAnimator.OverrideFlag;
  this.setOwnState(state, tween);
};

ViewAnimator.prototype.setAutoState = function <T, U>(this: ViewAnimator<View, T, U>,
                                                      state: T | U, tween?: Tween<T>): void {
  if ((this._animatorFlags & TweenAnimator.OverrideFlag) === 0) {
    this.setOwnState(state, tween);
  }
};

ViewAnimator.prototype.setOwnState = function <T, U>(this: ViewAnimator<View, T, U>,
                                                     state: T | U, tween?: Tween<T>): void {
  if (state !== void 0) {
    state = this.fromAny(state);
  }
  this._animatorFlags &= ~TweenAnimator.InheritedFlag;
  TweenAnimator.prototype.setState.call(this, state, tween);
};

ViewAnimator.prototype.setBaseState = function <T, U>(this: ViewAnimator<View, T, U>,
                                                      state: T | U, tween?: Tween<T>): void {
  let superAnimator: ViewAnimator<View, T, U> | null | undefined;
  if (this.isInherited() && (superAnimator = this.superAnimator, superAnimator !== null)) {
    superAnimator.setBaseState(state, tween);
  } else {
    this.setState(state, tween);
  }
};

ViewAnimator.prototype.onAnimate = function <T, U>(this: ViewAnimator<View, T, U>, t: number): void {
  if (!this.isInherited()) {
    TweenAnimator.prototype.onAnimate.call(this, t);
  } else if (this.isUpdated()) {
    this.onAnimateInherited();
  } else {
    this.onIdle();
  }
};

ViewAnimator.prototype.onAnimateInherited = function <T, U>(this: ViewAnimator<View, T, U>): void {
  const superAnimator = this._superAnimator;
  if (superAnimator !== void 0) {
    this._animatorFlags &= ~TweenAnimator.UpdatedFlag;
    this.update(superAnimator.value, this.value);
  } else {
    this.onIdle();
  }
};

ViewAnimator.prototype.update = function <T, U>(this: ViewAnimator<View, T, U>,
                                                newValue: T, oldValue: T): void {
  if (!Objects.equal(oldValue, newValue)) {
    this.willUpdate(newValue, oldValue);
    this._value = newValue;
    this._animatorFlags |= TweenAnimator.UpdatedFlag;
    this.onUpdate(newValue, oldValue);
    this.updateSubAnimators(newValue, oldValue);
    this.didUpdate(newValue, oldValue);
  }
};

ViewAnimator.prototype.onUpdate = function <T, U>(this: ViewAnimator<View, T, U>,
                                                  newValue: T, oldValue: T): void {
  const updateFlags = this.updateFlags;
  if (updateFlags !== void 0) {
    this._view.requireUpdate(updateFlags);
  }
};

ViewAnimator.prototype.updateSubAnimators = function <T, U>(this: ViewAnimator<View, T, U>,
                                                            newValue: T, oldValue: T): void {
  const subAnimators = this._subAnimators;
  if (subAnimators !== void 0) {
    for (let i = 0, n = subAnimators.length; i < n; i += 1) {
      const subAnimator = subAnimators[i];
      if (subAnimator.isInherited()) {
        subAnimator._animatorFlags |= TweenAnimator.UpdatedFlag;
        subAnimator.animate();
      }
    }
  }
};

ViewAnimator.prototype.animate = function <T, U>(this: ViewAnimator<View, T, U>,
                                                 animator: Animator = this): void {
  if (animator !== this || (this._animatorFlags & TweenAnimator.DisabledFlag) === 0) {
    this._view.animate(animator);
  }
};

ViewAnimator.prototype.mount = function (this: ViewAnimator<View, unknown>): void {
  this.bindSuperAnimator();
};

ViewAnimator.prototype.unmount = function (this: ViewAnimator<View, unknown>): void {
  this.unbindSuperAnimator();
};

ViewAnimator.prototype.fromAny = function <T, U>(this: ViewAnimator<View, T, U>, value: T | U): T {
  return value as T;
};

ViewAnimator.getConstructor = function (type: unknown): ViewAnimatorPrototype | null {
  if (type === String) {
    return ViewAnimator.String;
  } else if (type === Boolean) {
    return ViewAnimator.Boolean;
  } else if (type === Number) {
    return ViewAnimator.Number;
  } else if (type === Angle) {
    return ViewAnimator.Angle;
  } else if (type === Length) {
    return ViewAnimator.Length;
  } else if (type === Color) {
    return ViewAnimator.Color;
  } else if (type === Font) {
    return ViewAnimator.Font;
  } else if (type === Transform) {
    return ViewAnimator.Transform;
  } else if (type === ContinuousScale) {
    return ViewAnimator.ContinuousScale;
  }
  return null;
};

ViewAnimator.define = function <V extends View, T, U, I>(descriptor: ViewAnimatorDescriptor<V, T, U, I>): ViewAnimatorConstructor<V, T, U, I> {
  let _super: ViewAnimatorPrototype | null | undefined = descriptor.extends;
  const state = descriptor.state;
  const inherit = descriptor.inherit;
  delete descriptor.extends;
  delete descriptor.state;
  delete descriptor.inherit;

  if (_super === void 0) {
    _super = ViewAnimator.getConstructor(descriptor.type);
  }
  if (_super === null) {
    _super = ViewAnimator;
    if (!descriptor.hasOwnProperty("fromAny") && FromAny.is<T, U>(descriptor.type)) {
      descriptor.fromAny = descriptor.type.fromAny;
    }
  }

  const _constructor = function ViewAnimatorAccessor(this: ViewAnimator<V, T, U>, view: V, animatorName: string | undefined): ViewAnimator<V, T, U> {
    let _this: ViewAnimator<V, T, U> = function accessor(state?: T | U, tween?: Tween<T>): T | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(state!, tween);
        return _this._view;
      }
    } as ViewAnimator<V, T, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, view, animatorName) || _this;
    return _this;
  } as unknown as ViewAnimatorConstructor<V, T, U, I>

  const _prototype = descriptor as unknown as ViewAnimator<V, T, U> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (state !== void 0 && !_prototype.hasOwnProperty("initState")) {
    _prototype.initState = function (): T | U {
      return state;
    };
  }
  _prototype._inherit = inherit !== void 0 ? inherit : false;

  return _constructor;
};
