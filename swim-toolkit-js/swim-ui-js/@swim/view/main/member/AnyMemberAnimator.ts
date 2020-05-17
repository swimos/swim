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
import {FromAny} from "@swim/util";
import {Transition, Tween} from "@swim/transition";
import {AnimatedView} from "../animated/AnimatedView";
import {MemberAnimator} from "./MemberAnimator";

/** @hidden */
export interface AnyMemberAnimatorClass {
  new<V extends AnimatedView, T, U = T>(type: FromAny<T, U>, view: V, animatorName?: string,
                                        value?: T | U, transition?: Transition<T> | null,
                                        inherit?: string | null): AnyMemberAnimator<V, T, U>;
}

/** @hidden */
export interface AnyMemberAnimator<V extends AnimatedView, T, U = T> extends MemberAnimator<V, T, U> {
  /** @hidden */
  readonly _type: FromAny<T, U>;

  readonly type: FromAny<T, U>;
}

/** @hidden */
export const AnyMemberAnimator: AnyMemberAnimatorClass = (function (_super: typeof MemberAnimator): AnyMemberAnimatorClass {
  const AnyMemberAnimator: AnyMemberAnimatorClass = function <V extends AnimatedView, T, U>(
      this: AnyMemberAnimator<V, T, U>, type: FromAny<T, U>, view: V, animatorName?: string, value?: T | U,
      transition?: Transition<T> | null, inherit?: string | null): AnyMemberAnimator<V, T, U> {
    let _this: AnyMemberAnimator<V, T, U> = function accessor(value?: T | U, tween?: Tween<T>): T | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value as T | undefined, tween);
        return _this._view;
      }
    } as AnyMemberAnimator<V, T, U>;
    (_this as any).__proto__ = this;
    (_this as any)._type = type;
    _this = _super.call(_this, view, animatorName, value, transition, inherit) || _this;
    return _this;
  } as unknown as AnyMemberAnimatorClass;
  __extends(AnyMemberAnimator, _super);

  Object.defineProperty(AnyMemberAnimator.prototype, "type", {
    get: function <V extends AnimatedView, T, U>(this: AnyMemberAnimator<V, T, U>): FromAny<T, U> {
      return this._type;
    },
    enumerable: true,
    configurable: true,
  });

  AnyMemberAnimator.prototype.fromAny = function <T, U>(this: AnyMemberAnimator<AnimatedView, T, U>, value: T | U): T {
    return this._type.fromAny(value);
  };

  return AnyMemberAnimator;
}(MemberAnimator));
MemberAnimator.Any = AnyMemberAnimator;
