// Copyright 2015-2019 SWIM.AI inc.
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
import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {AnyTransform, Transform} from "@swim/transform";
import {AnyTransition, Transition, Tween} from "@swim/transition";
import {Animator, TweenAnimator} from "@swim/animate";
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
import {View} from "../View";
import {AnimatedView} from "../AnimatedView";

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

export type MemberAnimatorDescriptorType<C extends MemberAnimatorTypeConstructor> =
  C extends typeof Transform ? MemberAnimatorDescriptor<Transform, AnyTransform> :
  C extends typeof Font ? MemberAnimatorDescriptor<Font, AnyFont> :
  C extends typeof Color ? MemberAnimatorDescriptor<Color, AnyColor> :
  C extends typeof Length ? MemberAnimatorDescriptor<Length, AnyLength> :
  C extends typeof Angle ? MemberAnimatorDescriptor<Angle, AnyAngle> :
  C extends typeof Number ? MemberAnimatorDescriptor<number, number | string> :
  C extends typeof Boolean ? MemberAnimatorDescriptor<boolean, boolean | string> :
  C extends typeof String ? MemberAnimatorDescriptor<string> :
  C extends typeof Object ? MemberAnimatorDescriptor<Object> :
  C extends FromAny<any> ? MemberAnimatorDescriptor<any> :
  MemberAnimatorDescriptor<any>;

export interface MemberAnimatorDescriptor<T, U = T> {
  value?: T | U | null;
  transition?: AnyTransition<T> | null;
  inherit?: string | boolean | null;
}

export interface MemberAnimatorConstructor<T, U = T> {
  new<V extends AnimatedView>(view: V, value?: T | U | null, transition?: Transition<T> | null,
                              inherit?: string | null): MemberAnimator<V, T, U>;
}

export interface MemberAnimatorClass {
  new<V extends AnimatedView, T, U = T>(view: V, value?: T | null, transition?: Transition<T> | null,
                                        inherit?: string | null): MemberAnimator<V, T, U>;

  <C extends MemberAnimatorTypeConstructor>(constructor: C, descriptor?: MemberAnimatorDescriptorType<C>): PropertyDecorator;

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
  (): T | null | undefined;
  (value: U | null, tween?: Tween<T>): V;

  /** @hidden */
  _view: V;
  /** @hidden */
  _inherit: string | null;

  readonly view: V;

  readonly inherit: string | null;

  animate(animator?: Animator): void;

  cancel(): void;

  update(newValue: T, oldValue: T): void;

  delete(): void;
}

export const MemberAnimator = (function (_super: typeof TweenAnimator): MemberAnimatorClass {
  const MemberAnimator: MemberAnimatorClass = function <V extends AnimatedView, T, U>(
      this: MemberAnimator<V, T, U> | undefined, view: V | MemberAnimatorTypeConstructor,
      value?: T | null | MemberAnimatorDescriptor<T, U>, transition?: Transition<T> | null,
      inherit?: string | null): MemberAnimator<V, T, U> | PropertyDecorator {
    if (this instanceof MemberAnimator) { // constructor
      if (transition === void 0) {
        transition = null;
      }
      if (inherit === void 0) {
        inherit = null;
      }
      const _this = _super.call(this, value, transition) || this;
      _this._view = view;
      _this._inherit = inherit;
      return _this;
    } else { // decorator
      const constructor = view as MemberAnimatorTypeConstructor;
      const descriptor = value as MemberAnimatorDescriptor<T, U> | undefined;
      if (constructor === Object) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Object, descriptor);
      } else if (constructor === String) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.String, descriptor);
      } else if (constructor === Boolean) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Boolean, descriptor);
      } else if (constructor === Number) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Number, descriptor);
      } else if (constructor === Angle) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Angle, descriptor);
      } else if (constructor === Length) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Length, descriptor);
      } else if (constructor === Color) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Color, descriptor);
      } else if (constructor === Font) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Font, descriptor);
      } else if (constructor === Transform) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Transform, descriptor);
      } else if (FromAny.is(constructor)) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Any.bind(void 0, constructor), descriptor);
      }
      throw new TypeError("" + constructor);
    }
  } as MemberAnimatorClass;
  __extends(MemberAnimator, _super);

  Object.defineProperty(MemberAnimator.prototype, "view", {
    get: function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>): V {
      return this._view;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MemberAnimator.prototype, "inherit", {
    get: function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>): string | null {
      return this._inherit;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MemberAnimator.prototype, "value", {
    get: function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>): T | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const inherit = this._inherit;
        if (inherit !== null) {
          let view = this._view.parentView;
          while (view) {
            const animator = (view as any)[inherit];
            if (animator instanceof TweenAnimator) {
              value = animator.value;
              break;
            }
            view = view.parentView;
          }
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MemberAnimator.prototype, "state", {
    get: function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>): T | null | undefined {
      let state = this._state;
      if (state === void 0) {
        const inherit = this._inherit;
        if (inherit !== null) {
          let view = this._view.parentView;
          while (view) {
            const animator = (view as any)[inherit];
            if (animator instanceof TweenAnimator) {
              state = animator.state;
              break;
            }
            view = view.parentView;
          }
        }
      }
      return state;
    },
    enumerable: true,
    configurable: true,
  });

  MemberAnimator.prototype.animate = function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>,
                                                                             animator: Animator = this): void {
    if (!this._disabled || animator !== this) {
      this._view.animate(animator);
    }
  };

  MemberAnimator.prototype.cancel = function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>): void {
    // nop
  };

  MemberAnimator.prototype.update = function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>,
                                                                            newValue: T, oldValue: T): void {
    // hook
  };

  MemberAnimator.prototype.delete = function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>): void {
    // nop
  };

  return MemberAnimator;
}(TweenAnimator));
