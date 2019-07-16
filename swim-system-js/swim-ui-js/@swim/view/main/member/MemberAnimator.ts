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
import {Objects, FromAny} from "@swim/util";
import {Angle} from "@swim/angle";
import {Length} from "@swim/length";
import {Color} from "@swim/color";
import {Font} from "@swim/font";
import {Transform} from "@swim/transform";
import {Tween, Transition} from "@swim/transition";
import {TweenAnimator} from "@swim/animate";
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

export type MemberAnimatorInherit = "inherit" | string | null;

export type MemberAnimatorType = FromAny<any>
                               | typeof Object
                               | typeof String
                               | typeof Boolean
                               | typeof Number
                               | typeof Angle
                               | typeof Length
                               | typeof Color
                               | typeof Font
                               | typeof Transform;

export interface MemberAnimatorConstructor {
  new<V extends AnimatedView, T, U = T>(view: V, value?: T | null, transition?: Transition<T> | null,
                                        inherit?: MemberAnimatorInherit): MemberAnimator<V, T, U>;
}

export interface MemberAnimatorClass extends MemberAnimatorConstructor {
  (type: MemberAnimatorType, inherit?: string): PropertyDecorator;

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
  readonly _view: V;

  readonly view: V;

  /** @hidden */
  readonly _inherit: MemberAnimatorInherit;

  readonly inherit: MemberAnimatorInherit;

  animate(): void;

  cancel(): void;

  update(newValue: T, oldValue: T): void;

  delete(): void;
}

export const MemberAnimator = (function (_super: typeof TweenAnimator): MemberAnimatorClass {
  const MemberAnimator: MemberAnimatorClass = function <V extends AnimatedView, T, U>(
      this: MemberAnimator<V, T, U> | undefined, view: V | MemberAnimatorType | unknown,
      value?: T | null | string, transition?: Transition<T> | null,
      inherit?: MemberAnimatorInherit): MemberAnimator<V, T, U> | PropertyDecorator {
    if (this instanceof MemberAnimator) { // constructor
      if (transition === void 0) {
        transition = null;
      }
      const _this = _super.call(this, value, transition) || this;
      _this._view = view;
      _this._inherit = inherit !== void 0 ? inherit : null;
      return _this;
    } else { // decorator
      const type = view as MemberAnimatorType;
      inherit = value as MemberAnimatorInherit | undefined;
      if (type === Object) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Object, inherit);
      } else if (type === String) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.String, inherit);
      } else if (type === Boolean) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Boolean, inherit);
      } else if (type === Number) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Number, inherit);
      } else if (type === Angle) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Angle, inherit);
      } else if (type === Length) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Length, inherit);
      } else if (type === Color) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Color, inherit);
      } else if (type === Font) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Font, inherit);
      } else if (type === Transform) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Transform, inherit);
      } else if (FromAny.is(type)) {
        return View.decorateMemberAnimator.bind(void 0, MemberAnimator.Any.bind(void 0, type), inherit);
      }
      throw new TypeError("" + type);
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
    get: function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>): MemberAnimatorInherit {
      return this._inherit;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MemberAnimator.prototype, "dirty", {
    get: function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>): boolean {
      return this._view.dirty;
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

  MemberAnimator.prototype.setDirty = function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>,
                                                                              dirty: boolean): void {
    if (dirty) {
      this._view.setDirty(dirty);
    }
  };

  MemberAnimator.prototype.animate = function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>): void {
    if (!this._disabled) {
      this._view.animate();
    }
  };

  MemberAnimator.prototype.cancel = function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>): void {
    // nop
  };

  MemberAnimator.prototype.update = function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>,
                                                                            newValue: T, oldValue: T): void {
    if (!Objects.equal(oldValue, newValue)) {
      this.setDirty(true);
    }
  };

  MemberAnimator.prototype.delete = function <V extends AnimatedView, T, U>(this: MemberAnimator<V, T, U>): void {
    // nop
  };

  return MemberAnimator;
}(TweenAnimator));
