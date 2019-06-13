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
import {Tween, Transition} from "@swim/transition";
import {MemberAnimatorInherit, MemberAnimator} from "./MemberAnimator";
import {AnimatedView} from "../AnimatedView";

/** @hidden */
export interface AnyMemberAnimatorClass {
  new<V extends AnimatedView, T, U = T>(type: FromAny<T, U>, view: V, value?: T | null, transition?: Transition<T> | null,
                                        inherit?: MemberAnimatorInherit): AnyMemberAnimator<V, T, U>;
}

/** @hidden */
export interface AnyMemberAnimator<V extends AnimatedView, T, U = T> extends MemberAnimator<V, T, U> {
  /** @hidden */
  readonly _type: FromAny<T, U>;

  readonly type: FromAny<T, U>;
}

/** @hidden */
export const AnyMemberAnimator = (function (_super: typeof MemberAnimator): AnyMemberAnimatorClass {
  const AnyMemberAnimator: AnyMemberAnimatorClass = function <V extends AnimatedView, T, U>(
      this: AnyMemberAnimator<V, T, U>, type: FromAny<T, U>, view: V, value?: T | null,
      transition?: Transition<T> | null, inherit?: MemberAnimatorInherit): AnyMemberAnimator<V, T, U> {
    let _this: AnyMemberAnimator<V, T, U> = function (value?: T | U | null, tween?: Tween<T>): T | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          value = _this._type.fromAny(value);
        }
        _this.setState(value as T, tween);
        return _this._view;
      }
    } as AnyMemberAnimator<V, T, U>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, value, transition, inherit) || _this;
    (_this as any)._type = type;
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

  return AnyMemberAnimator;
}(MemberAnimator));
MemberAnimator.Any = AnyMemberAnimator;
