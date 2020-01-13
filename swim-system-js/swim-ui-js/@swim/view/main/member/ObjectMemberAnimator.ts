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
import {Transition, Tween} from "@swim/transition";
import {MemberAnimator} from "./MemberAnimator";
import {AnimatedView} from "../AnimatedView";

/** @hidden */
export interface ObjectMemberAnimatorClass {
  new<V extends AnimatedView, T>(view: V, value?: T | null, transition?: Transition<T> | null,
                                 inherit?: string | null): ObjectMemberAnimator<V, T>;
}

/** @hidden */
export interface ObjectMemberAnimator<V extends AnimatedView, T> extends MemberAnimator<V, T, T> {
}

/** @hidden */
export const ObjectMemberAnimator = (function (_super: typeof MemberAnimator): ObjectMemberAnimatorClass {
  const ObjectMemberAnimator: ObjectMemberAnimatorClass = function <V extends AnimatedView, T>(
      this: ObjectMemberAnimator<V, T>, view: V, value?: T | null,
      transition?: Transition<T> | null, inherit?: string | null): ObjectMemberAnimator<V, T> {
    let _this: ObjectMemberAnimator<V, T> = function (value?: T | null, tween?: Tween<T>): T | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as ObjectMemberAnimator<V, T>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, value, transition, inherit) || _this;
    return _this;
  } as unknown as ObjectMemberAnimatorClass;
  __extends(ObjectMemberAnimator, _super);

  return ObjectMemberAnimator;
}(MemberAnimator));
MemberAnimator.Object = ObjectMemberAnimator;
