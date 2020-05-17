// Copyright 2015-2020 SWIM.AI inc.
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
import {AnyTransition, Transition, Tween} from "@swim/transition";
import {Animator, TweenAnimator} from "@swim/animate";
import {AnimatedView} from "../animated/AnimatedView";
import {AnyMemberAnimator} from "./AnyMemberAnimator";
import {ObjectMemberAnimator} from "./ObjectMemberAnimator";
import {StringMemberAnimator} from "./StringMemberAnimator";
import {BooleanMemberAnimator} from "./BooleanMemberAnimator";
import {NumberMemberAnimator} from "./NumberMemberAnimator";
import {AngleMemberAnimator} from "./AngleMemberAnimator";
import {LengthMemberAnimator} from "./LengthMemberAnimator";
import {ColorMemberAnimator} from "./ColorMemberAnimator";
import {FontMemberAnimator} from "./FontMemberAnimator";
import {TransformMemberAnimator} from "./TransformMemberAnimator";

export type MemberAnimatorInit<V extends AnimatedView, T> = (this: V) => T | undefined;

export type MemberAnimatorTypeConstructor = FromAny<any>
                                          | typeof Object
                                          | typeof String
                                          | typeof Boolean
                                          | typeof Number
                                          | typeof Angle
                                          | typeof Length
                                          | typeof Color
                                          | typeof Font
                                          | typeof Transform;

export type MemberAnimatorDescriptorType<V extends AnimatedView, C extends MemberAnimatorTypeConstructor> =
  C extends typeof Transform ? MemberAnimatorDescriptor<V, Transform | null, AnyTransform | null> :
  C extends typeof Font ? MemberAnimatorDescriptor<V, Font | null, AnyFont | null> :
  C extends typeof Color ? MemberAnimatorDescriptor<V, Color | null, AnyColor | null> :
  C extends typeof Length ? MemberAnimatorDescriptor<V, Length | null, AnyLength | null> :
  C extends typeof Angle ? MemberAnimatorDescriptor<V, Angle | null, AnyAngle | null> :
  C extends typeof Number ? MemberAnimatorDescriptor<V, number | null, number | string | null> :
  C extends typeof Boolean ? MemberAnimatorDescriptor<V, boolean | null, boolean | string | null> :
  C extends typeof String ? MemberAnimatorDescriptor<V, string | null> :
  C extends typeof Object ? MemberAnimatorDescriptor<V, Object> :
  C extends FromAny<any> ? MemberAnimatorDescriptor<V, any> :
  MemberAnimatorDescriptor<V, any>;

export interface MemberAnimatorDescriptor<V extends AnimatedView, T, U = T> {
  init?: MemberAnimatorInit<V, T | U>;
  value?: T | U;
  transition?: AnyTransition<T> | null;
  inherit?: string | boolean | null;
  /** @hidden */
  animatorType?: MemberAnimatorConstructor<T, U>;
}

export interface MemberAnimatorConstructor<T, U = T> {
  new<V extends AnimatedView>(view: V, animatorName: string | undefined, value?: T | U,
                              transition?: Transition<T> | null, inherit?: string | null): MemberAnimator<V, T, U>;
}

export interface MemberAnimatorClass {
  new<V extends AnimatedView, T, U = T>(view: V, animatorName: string | undefined, value?: T | U,
                                        transition?: Transition<T> | null, inherit?: string | null): MemberAnimator<V, T, U>;

  <V extends AnimatedView, C extends MemberAnimatorTypeConstructor>(valueType: C, descriptor?: MemberAnimatorDescriptorType<V, C>): PropertyDecorator;

  // Forward type declarations
  /** @hidden */
  Any: typeof AnyMemberAnimator; // defined by AnyMemberAnimator
  /** @hidden */
  Object: typeof ObjectMemberAnimator; // defined by ObjectMemberAnimator
  /** @hidden */
  String: typeof StringMemberAnimator; // defined by StringMemberAnimator
  /** @hidden */
  Boolean: typeof BooleanMemberAnimator; // defined by BooleanMemberAnimator
  /** @hidden */
  Number: typeof NumberMemberAnimator; // defined by NumberMemberAnimator
  /** @hidden */
  Angle: typeof AngleMemberAnimator; // defined by AngleMemberAnimator
  /** @hidden */
  Length: typeof LengthMemberAnimator; // defined by LengthMemberAnimator
  /** @hidden */
  Color: typeof ColorMemberAnimator; // defined by ColorMemberAnimator
  /** @hidden */
  Font: typeof FontMemberAnimator; // defined by FontMemberAnimator
  /** @hidden */
  Transform: typeof TransformMemberAnimator; // defined by TransformMemberAnimator
}

export interface MemberAnimator<V extends AnimatedView, T, U = T> extends TweenAnimator<T> {
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

  readonly superAnimator: MemberAnimator<AnimatedView, T, U> | null;

  readonly superValue: T | undefined;

  readonly superState: T | undefined;

  isAuto(): boolean;

  setAuto(auto: boolean): void;

  setState(state: T | U | undefined, tween?: Tween<T>): void;

  setAutoState(state: T | U | undefined, tween?: Tween<T>): void;

  animate(animator?: Animator): void;

  update(newValue: T | undefined, oldValue: T | undefined): void;

  willUpdate(newValue: T | undefined, oldValue: T | undefined): void;

  onUpdate(newValue: T | undefined, oldValue: T | undefined): void;

  didUpdate(newValue: T | undefined, oldValue: T | undefined): void;

  cancel(): void;

  delete(): void;

  fromAny(value: T | U): T;
}

export const MemberAnimator: MemberAnimatorClass = (function (_super: typeof TweenAnimator): MemberAnimatorClass {
  function MemberAnimatorDecoratorFactory<V extends AnimatedView, C extends MemberAnimatorTypeConstructor>(
      valueType: C, descriptor?: MemberAnimatorDescriptorType<V, C>): PropertyDecorator {
    if (descriptor === void 0) {
      descriptor = {} as MemberAnimatorDescriptorType<V, C>;
    }
    let animatorType = descriptor.animatorType;
    if (animatorType === void 0) {
      if (valueType === Object) {
        animatorType = MemberAnimator.Object;
      } else if (valueType === String) {
        animatorType = MemberAnimator.String;
      } else if (valueType === Boolean) {
        animatorType = MemberAnimator.Boolean;
      } else if (valueType === Number) {
        animatorType = MemberAnimator.Number;
      } else if (valueType === Angle) {
        animatorType = MemberAnimator.Angle;
      } else if (valueType === Length) {
        animatorType = MemberAnimator.Length;
      } else if (valueType === Color) {
        animatorType = MemberAnimator.Color;
      } else if (valueType === Font) {
        animatorType = MemberAnimator.Font;
      } else if (valueType === Transform) {
        animatorType = MemberAnimator.Transform;
      } else if (FromAny.is(valueType)) {
        animatorType = MemberAnimator.Any.bind(void 0, valueType);
      } else {
        throw new TypeError("" + valueType);
      }
      descriptor.animatorType = animatorType;
    }
    return AnimatedView.decorateMemberAnimator.bind(void 0, animatorType, descriptor);
  }

  function MemberAnimatorConstructor<V extends AnimatedView, T, U = T>(
      this: MemberAnimator<V, T, U>, view: V, animatorName: string | undefined,
      value?: T | U, transition?: Transition<T> | null, inherit?: string | null): MemberAnimator<V, T, U> {
    if (transition === void 0) {
      transition = null;
    }
    if (inherit === void 0) {
      inherit = null;
    }
    if (animatorName !== void 0) {
      Object.defineProperty(this, "name", {
        value: animatorName,
        enumerable: true,
        configurable: true,
      });
    }
    this._view = view;
    this._inherit = inherit;
    this._auto = true;
    if (value !== void 0) {
      value = this.fromAny(value);
    }
    const _this = _super.call(this, value, transition) || this;
    return _this;
  }

  const MemberAnimator: MemberAnimatorClass = function <V extends AnimatedView, T, U>(
      this: MemberAnimator<V, T, U> | MemberAnimatorClass,
      view: V | MemberAnimatorTypeConstructor,
      animatorName?: string | MemberAnimatorDescriptor<V, T, U>,
      value?: T | U,
      transition?: Transition<T> | null,
      inherit?: string | null): MemberAnimator<V, T, U> | PropertyDecorator {
    if (this instanceof MemberAnimator) { // constructor
      return MemberAnimatorConstructor.call(this, view, animatorName, value, transition, inherit);
    } else { // decorator factory
      const valueType = view as MemberAnimatorTypeConstructor;
      const descriptor = animatorName as MemberAnimatorDescriptor<V, T, U> | undefined;
      return MemberAnimatorDecoratorFactory(valueType, descriptor);
    }
  } as MemberAnimatorClass;
  __extends(MemberAnimator, _super);

  Object.defineProperty(MemberAnimator.prototype, "view", {
    get: function (this: MemberAnimator<AnimatedView, unknown, unknown>): AnimatedView {
      return this._view;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MemberAnimator.prototype, "inherit", {
    get: function (this: MemberAnimator<AnimatedView, unknown, unknown>): string | null {
      return this._inherit;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MemberAnimator.prototype, "superAnimator", {
    get: function <T, U>(this: MemberAnimator<AnimatedView, T, U>): MemberAnimator<AnimatedView, T, U> | null {
      const inherit = this._inherit;
      if (inherit !== null) {
        let view = this._view.parentView;
        while (view !== null) {
          if (AnimatedView.is(view)) {
            const animator = view.getLazyMemberAnimator(inherit);
            if (animator instanceof MemberAnimator) {
              return animator;
            }
          }
          view = view.parentView;
        }
      }
      return null;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MemberAnimator.prototype, "superValue", {
    get: function <T, U>(this: MemberAnimator<AnimatedView, T, U>): T | undefined {
      const superAnimator = this.superAnimator;
      return superAnimator !== null ? superAnimator.value : void 0;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MemberAnimator.prototype, "superState", {
    get: function <T, U>(this: MemberAnimator<AnimatedView, T, U>): T | undefined {
      const superAnimator = this.superAnimator;
      return superAnimator !== null ? superAnimator.state : void 0;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MemberAnimator.prototype, "value", {
    get: function <T, U>(this: MemberAnimator<AnimatedView, T, U>): T | undefined {
      const value = this._value;
      return value !== void 0 ? value : this.superValue;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MemberAnimator.prototype, "state", {
    get: function <T, U>(this: MemberAnimator<AnimatedView, T, U>): T | undefined {
      const state = this._state;
      return state !== void 0 ? state : this.superState;
    },
    enumerable: true,
    configurable: true,
  });

  MemberAnimator.prototype.isAuto = function (this: MemberAnimator<AnimatedView, unknown, unknown>): boolean {
    return this._auto;
  };

  MemberAnimator.prototype.setAuto = function (this: MemberAnimator<AnimatedView, unknown, unknown>,
                                               auto: boolean): void {
    if (this._auto !== auto) {
      this._auto = auto;
      this._view.animatorDidSetAuto(this, auto);
    }
  };

  MemberAnimator.prototype.setState = function <T, U>(this: MemberAnimator<AnimatedView, T, U>,
                                                      state: T | U | undefined,
                                                      tween?: Tween<T>): void {
    if (state !== void 0) {
      state = this.fromAny(state);
    }
    this._auto = false;
    _super.prototype.setState.call(this, state, tween);
  };

  MemberAnimator.prototype.setAutoState = function <T, U>(this: MemberAnimator<AnimatedView, T, U>,
                                                          state: T | U | undefined,
                                                          tween?: Tween<T>): void {
    if (this._auto === true) {
      if (state !== void 0) {
        state = this.fromAny(state);
      }
      _super.prototype.setState.call(this, state, tween);
    }
  };

  MemberAnimator.prototype.animate = function <T, U>(this: MemberAnimator<AnimatedView, T, U>,
                                                     animator: Animator = this): void {
    if (this._enabled || animator !== this) {
      this._view.animate(animator);
    }
  };

  MemberAnimator.prototype.update = function <T, U>(this: MemberAnimator<AnimatedView, T, U>,
                                                    newValue: T | undefined, oldValue: T | undefined): void {
    if (!Objects.equal(oldValue, newValue)) {
      this.willUpdate(newValue, oldValue);
      this.onUpdate(newValue, oldValue);
      this.didUpdate(newValue, oldValue);
    }
  };

  MemberAnimator.prototype.willUpdate = function <T, U>(this: MemberAnimator<AnimatedView, T, U>,
                                                        newValue: T | undefined,
                                                        oldValue: T | undefined): void {
    // hook
  };

  MemberAnimator.prototype.onUpdate = function <T, U>(this: MemberAnimator<AnimatedView, T, U>,
                                                      newValue: T | undefined,
                                                      oldValue: T | undefined): void {
    // hook
  };

  MemberAnimator.prototype.didUpdate = function <T, U>(this: MemberAnimator<AnimatedView, T, U>,
                                                       newValue: T | undefined,
                                                       oldValue: T | undefined): void {
    // hook
  };

  MemberAnimator.prototype.cancel = function <T, U>(this: MemberAnimator<AnimatedView, T, U>): void {
    // nop
  };

  MemberAnimator.prototype.delete = function <T, U>(this: MemberAnimator<AnimatedView, T, U>): void {
    // nop
  };

  MemberAnimator.prototype.fromAny = function <T, U>(this: MemberAnimator<AnimatedView, T, U>, value: T | U): T {
    throw new Error(); // abstract
  };

  return MemberAnimator;
}(TweenAnimator));
