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
import {AnyTransition, Transition, Tween} from "@swim/transition";
import {Animator, TweenAnimator} from "@swim/animate";
import {View} from "../View";
import {AnyViewAnimator} from "./AnyViewAnimator";
import {ObjectViewAnimator} from "./ObjectViewAnimator";
import {StringViewAnimator} from "./StringViewAnimator";
import {BooleanViewAnimator} from "./BooleanViewAnimator";
import {NumberViewAnimator} from "./NumberViewAnimator";
import {AngleViewAnimator} from "./AngleViewAnimator";
import {LengthViewAnimator} from "./LengthViewAnimator";
import {ColorViewAnimator} from "./ColorViewAnimator";
import {FontViewAnimator} from "./FontViewAnimator";
import {TransformViewAnimator} from "./TransformViewAnimator";
import {ContinuousScaleViewAnimator} from "./ContinuousScaleViewAnimator";

export type ViewAnimatorInit<V extends View, T, U = T> =
  (this: ViewAnimator<V, T, U>) => T | U | undefined;

export type ViewAnimatorFromAny<V extends View, T, U = T> =
  (this: ViewAnimator<V, T, U>, value: T | U) => T | undefined;

export type ViewAnimatorTypeConstructor = FromAny<any>
                                        | typeof Object
                                        | typeof String
                                        | typeof Boolean
                                        | typeof Number
                                        | typeof Angle
                                        | typeof Length
                                        | typeof Color
                                        | typeof Font
                                        | typeof Transform
                                        | typeof ContinuousScale
                                        | {new (...args: any): any}
                                        | any;

export type ViewAnimatorDescriptorType<V extends View, C extends ViewAnimatorTypeConstructor> =
  C extends typeof ContinuousScale ? ViewAnimatorDescriptor<V, any, any> :
  C extends typeof Transform ? ViewAnimatorDescriptor<V, Transform | null, AnyTransform | null> :
  C extends typeof Font ? ViewAnimatorDescriptor<V, Font | null, AnyFont | null> :
  C extends typeof Color ? ViewAnimatorDescriptor<V, Color | null, AnyColor | null> :
  C extends typeof Length ? ViewAnimatorDescriptor<V, Length | null, AnyLength | null> :
  C extends typeof Angle ? ViewAnimatorDescriptor<V, Angle | null, AnyAngle | null> :
  C extends typeof Number ? ViewAnimatorDescriptor<V, number | null, number | string | null> :
  C extends typeof Boolean ? ViewAnimatorDescriptor<V, boolean | null, boolean | string | null> :
  C extends typeof String ? ViewAnimatorDescriptor<V, string | null> :
  C extends typeof Object ? ViewAnimatorDescriptor<V, Object> :
  C extends FromAny<any> ? ViewAnimatorDescriptor<V, any> :
  C extends new (...args: any) => any ? ViewAnimatorDescriptor<V, InstanceType<C>, any> :
  ViewAnimatorDescriptor<V, any>;

export interface ViewAnimatorDescriptor<V extends View, T, U = T> {
  init?: ViewAnimatorInit<V, T, U>;
  value?: T | U;
  transition?: AnyTransition<T> | null;
  inherit?: string | boolean | null;
  fromAny?: ViewAnimatorFromAny<V, T, U>;
  /** @hidden */
  animatorType?: ViewAnimatorConstructor<T, U>;
}

export interface ViewAnimatorConstructor<T, U = T> {
  new<V extends View>(view: V, animatorName: string | undefined,
                      descriptor?: ViewAnimatorDescriptor<V, T, U>): ViewAnimator<V, T, U>;
}

export interface ViewAnimatorClass {
  new<V extends View, T, U = T>(view: V, animatorName: string | undefined,
                                descriptor?: ViewAnimatorDescriptor<V, T, U>): ViewAnimator<V, T, U>;

  <V extends View, C extends ViewAnimatorTypeConstructor>(
      valueType: C, descriptor?: ViewAnimatorDescriptorType<V, C>): PropertyDecorator;

  // Forward type declarations
  /** @hidden */
  Any: typeof AnyViewAnimator; // defined by AnyViewAnimator
  /** @hidden */
  Object: typeof ObjectViewAnimator; // defined by ObjectViewAnimator
  /** @hidden */
  String: typeof StringViewAnimator; // defined by StringViewAnimator
  /** @hidden */
  Boolean: typeof BooleanViewAnimator; // defined by BooleanViewAnimator
  /** @hidden */
  Number: typeof NumberViewAnimator; // defined by NumberViewAnimator
  /** @hidden */
  Angle: typeof AngleViewAnimator; // defined by AngleViewAnimator
  /** @hidden */
  Length: typeof LengthViewAnimator; // defined by LengthViewAnimator
  /** @hidden */
  Color: typeof ColorViewAnimator; // defined by ColorViewAnimator
  /** @hidden */
  Font: typeof FontViewAnimator; // defined by FontViewAnimator
  /** @hidden */
  Transform: typeof TransformViewAnimator; // defined by TransformViewAnimator
  /** @hidden */
  ContinuousScale: typeof ContinuousScaleViewAnimator; // defined by ContinuousScaleViewAnimator
}

export interface ViewAnimator<V extends View, T, U = T> extends TweenAnimator<T> {
  (): T | undefined;
  (value: T | U | undefined, tween?: Tween<T>): V;

  /** @hidden */
  _view: V;
  /** @hidden */
  _inherit: string | null;
  /** @hidden */
  _auto: boolean;

  readonly view: V;

  readonly name: string;

  readonly inherit: string | null;

  setInherit(inherit: string | null): void;

  readonly superAnimator: ViewAnimator<View, T, U> | null;

  readonly superValue: T | undefined;

  readonly superState: T | undefined;

  readonly ownValue: T | undefined;

  readonly ownState: T | undefined;

  isAuto(): boolean;

  setAuto(auto: boolean): void;

  /** @hidden */
  superIsTweening(): boolean;

  isTweening(): boolean;

  setState(state: T | U | undefined, tween?: Tween<T>): void;

  setAutoState(state: T | U | undefined, tween?: Tween<T>): void;

  setOwnState(state: T | U | undefined, tween?: Tween<T>): void;

  setBaseState(state: T | U | undefined, tween?: Tween<T>): void;

  animate(animator?: Animator): void;

  update(newValue: T | undefined, oldValue: T | undefined): void;

  willUpdate(newValue: T | undefined, oldValue: T | undefined): void;

  onUpdate(newValue: T | undefined, oldValue: T | undefined): void;

  didUpdate(newValue: T | undefined, oldValue: T | undefined): void;

  cancel(): void;

  delete(): void;

  fromAny(value: T | U): T | undefined;
}

export const ViewAnimator: ViewAnimatorClass = (function (_super: typeof TweenAnimator): ViewAnimatorClass {
  function MemberAnimatorDecoratorFactory<V extends View, C extends ViewAnimatorTypeConstructor>(
      valueType: C, descriptor?: ViewAnimatorDescriptorType<V, C>): PropertyDecorator {
    if (descriptor === void 0) {
      descriptor = {} as ViewAnimatorDescriptorType<V, C>;
    }
    let animatorType = descriptor.animatorType;
    if (animatorType === void 0) {
      if (valueType === String) {
        animatorType = ViewAnimator.String;
      } else if (valueType === Boolean) {
        animatorType = ViewAnimator.Boolean;
      } else if (valueType === Number) {
        animatorType = ViewAnimator.Number;
      } else if (valueType === Angle) {
        animatorType = ViewAnimator.Angle;
      } else if (valueType === Length) {
        animatorType = ViewAnimator.Length;
      } else if (valueType === Color) {
        animatorType = ViewAnimator.Color;
      } else if (valueType === Font) {
        animatorType = ViewAnimator.Font;
      } else if (valueType === Transform) {
        animatorType = ViewAnimator.Transform;
      } else if (valueType === ContinuousScale) {
        animatorType = ViewAnimator.ContinuousScale;
      } else if (FromAny.is(valueType)) {
        animatorType = ViewAnimator.Any.bind(void 0, valueType);
      } else {
        animatorType = ViewAnimator.Object;
      }
      descriptor.animatorType = animatorType;
    }
    return View.decorateViewAnimator.bind(void 0, animatorType, descriptor);
  }

  function ViewAnimatorConstructor<V extends View, T, U>(
      this: ViewAnimator<V, T, U>, view: V, animatorName: string | undefined,
      descriptor?: ViewAnimatorDescriptor<V, T, U>): ViewAnimator<V, T, U> {
    this._view = view;
    if (animatorName !== void 0) {
      Object.defineProperty(this, "name", {
        value: animatorName,
        enumerable: true,
        configurable: true,
      });
    }
    if (descriptor !== void 0) {
      if (typeof descriptor.inherit === "string") {
        this._inherit = descriptor.inherit;
      } else if (descriptor.inherit === true && animatorName !== void 0) {
        this._inherit = animatorName;
      } else {
        this._inherit = null;
      }
    } else {
      this._inherit = null;
    }
    this._auto = true;
    if (descriptor !== void 0 && descriptor.fromAny !== void 0) {
      this.fromAny = descriptor.fromAny;
    }
    let value: T | U | undefined;
    let transition: Transition<T> | null | undefined;
    if (descriptor !== void 0) {
      value = descriptor.value;
      if (value !== void 0) {
        value = this.fromAny(value);
      }
      if (descriptor.transition !== void 0 && descriptor.transition !== null) {
        transition = Transition.fromAny(descriptor.transition);
      } else {
        transition = null;
      }
    } else {
      transition = null;
    }
    const _this: ViewAnimator<V, T, U> = _super.call(this, value as T | undefined, transition) || this;
    if (descriptor !== void 0 && descriptor.init !== void 0) {
      value = descriptor.init.call(this);
      if (value !== void 0) {
        value = this.fromAny(value);
      }
      _this._value = value as T | undefined;
      _this._state = value as T | undefined;
    }
    return _this;
  }

  const ViewAnimator: ViewAnimatorClass = function <V extends View, T, U>(
      this: ViewAnimator<V, T, U> | ViewAnimatorClass,
      view: V | ViewAnimatorTypeConstructor,
      animatorName?: string | ViewAnimatorDescriptor<V, T, U>,
      descriptor?: ViewAnimatorDescriptor<V, T, U>): ViewAnimator<V, T, U> | PropertyDecorator {
    if (this instanceof ViewAnimator) { // constructor
      return ViewAnimatorConstructor.call(this, view as V, animatorName as string, descriptor);
    } else { // decorator factory
      const valueType = view as ViewAnimatorTypeConstructor;
      const descriptor = animatorName as ViewAnimatorDescriptor<V, T, U> | undefined;
      return MemberAnimatorDecoratorFactory(valueType, descriptor);
    }
  } as ViewAnimatorClass;
  __extends(ViewAnimator, _super);

  Object.defineProperty(ViewAnimator.prototype, "view", {
    get: function <V extends View>(this: ViewAnimator<V, unknown>): V {
      return this._view;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(ViewAnimator.prototype, "inherit", {
    get: function (this: ViewAnimator<View, unknown>): string | null {
      return this._inherit;
    },
    enumerable: true,
    configurable: true,
  });

  ViewAnimator.prototype.setInherit = function (this: ViewAnimator<View, unknown>,
                                                inherit: string | null): void {
    this._inherit = inherit;
  };

  Object.defineProperty(ViewAnimator.prototype, "superAnimator", {
    get: function <T, U>(this: ViewAnimator<View, T, U>): ViewAnimator<View, T, U> | null {
      const inherit = this._inherit;
      if (inherit !== null) {
        let view = this._view.parentView;
        while (view !== null) {
          const animator = view.getLazyViewAnimator(inherit);
          if (animator instanceof ViewAnimator) {
            return animator as ViewAnimator<View, T, U>;
          }
          view = view.parentView;
        }
      }
      return null;
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

  Object.defineProperty(ViewAnimator.prototype, "ownValue", {
    get: function <T, U>(this: ViewAnimator<View, T, U>): T | undefined {
      return this._value;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(ViewAnimator.prototype, "ownState", {
    get: function <T, U>(this: ViewAnimator<View, T, U>): T | undefined {
      return this._state;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(ViewAnimator.prototype, "value", {
    get: function <T, U>(this: ViewAnimator<View, T, U>): T | undefined {
      const value = this._value;
      return value !== void 0 ? value : this.superValue;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(ViewAnimator.prototype, "state", {
    get: function <T, U>(this: ViewAnimator<View, T, U>): T | undefined {
      const state = this._state;
      return state !== void 0 ? state : this.superState;
    },
    enumerable: true,
    configurable: true,
  });

  ViewAnimator.prototype.isAuto = function (this: ViewAnimator<View, unknown>): boolean {
    return this._auto;
  };

  ViewAnimator.prototype.setAuto = function (this: ViewAnimator<View, unknown>,
                                             auto: boolean): void {
    if (this._auto !== auto) {
      this._auto = auto;
      this._view.animatorDidSetAuto(this, auto);
    }
  };

  ViewAnimator.prototype.superIsTweening = function (this: ViewAnimator<View, unknown>): boolean {
    const superAnimator = this.superAnimator;
    return superAnimator !== null && superAnimator.isTweening();
  };

  ViewAnimator.prototype.isTweening = function (this: ViewAnimator<View, unknown>): boolean {
    const value = this._value;
    return value !== void 0 ? _super.prototype.isTweening.call(this) : this.superIsTweening();
  };

  ViewAnimator.prototype.setState = function <T, U>(this: ViewAnimator<View, T, U>,
                                                    state: T | U | undefined,
                                                    tween?: Tween<T>): void {
    this._auto = false;
    this.setOwnState(state, tween);
  };

  ViewAnimator.prototype.setAutoState = function <T, U>(this: ViewAnimator<View, T, U>,
                                                        state: T | U | undefined,
                                                        tween?: Tween<T>): void {
    if (this._auto === true) {
      this.setOwnState(state, tween);
    }
  };

  ViewAnimator.prototype.setOwnState = function <T, U>(this: ViewAnimator<View, T, U>,
                                                       state: T | U | undefined,
                                                       tween?: Tween<T>): void {
    if (state !== void 0) {
      state = this.fromAny(state);
    }
    _super.prototype.setState.call(this, state, tween);
  };

  ViewAnimator.prototype.setBaseState = function <T, U>(this: ViewAnimator<View, T, U>,
                                                        state: T | U | undefined,
                                                        tween?: Tween<T>): void {
    let superAnimator: ViewAnimator<View, T, U> | null | undefined;
    if (this._value === void 0 && (superAnimator = this.superAnimator, superAnimator !== null)) {
      superAnimator.setBaseState(state, tween);
    } else {
      this.setState(state, tween);
    }
  };

  ViewAnimator.prototype.animate = function <T, U>(this: ViewAnimator<View, T, U>,
                                                   animator: Animator = this): void {
    if (this._enabled || animator !== this) {
      this._view.animate(animator);
    }
  };

  ViewAnimator.prototype.update = function <T, U>(this: ViewAnimator<View, T, U>,
                                                  newValue: T | undefined, oldValue: T | undefined): void {
    if (!Objects.equal(oldValue, newValue)) {
      this.willUpdate(newValue, oldValue);
      this.onUpdate(newValue, oldValue);
      this.didUpdate(newValue, oldValue);
    }
  };

  ViewAnimator.prototype.willUpdate = function <T, U>(this: ViewAnimator<View, T, U>,
                                                      newValue: T | undefined,
                                                      oldValue: T | undefined): void {
    // hook
  };

  ViewAnimator.prototype.onUpdate = function <T, U>(this: ViewAnimator<View, T, U>,
                                                    newValue: T | undefined,
                                                    oldValue: T | undefined): void {
    // hook
  };

  ViewAnimator.prototype.didUpdate = function <T, U>(this: ViewAnimator<View, T, U>,
                                                     newValue: T | undefined,
                                                     oldValue: T | undefined): void {
    // hook
  };

  ViewAnimator.prototype.cancel = function <T, U>(this: ViewAnimator<View, T, U>): void {
    // nop
  };

  ViewAnimator.prototype.delete = function <T, U>(this: ViewAnimator<View, T, U>): void {
    // nop
  };

  ViewAnimator.prototype.fromAny = function <T, U>(this: ViewAnimator<View, T, U>,
                                                   value: T | U): T | undefined {
    throw new Error(); // abstract
  };

  return ViewAnimator;
}(TweenAnimator));
View.Animator = ViewAnimator;
