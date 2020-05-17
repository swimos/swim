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
import {AnimatedView} from "../animated/AnimatedView";
import {MemberAnimator} from "./MemberAnimator";

/** @hidden */
export interface ObjectMemberAnimatorClass {
  new<V extends AnimatedView, T>(view: V, animatorName: string, value?: T, transition?: Transition<T> | null,
                                 inherit?: string | null): ObjectMemberAnimator<V, T>;
}

/** @hidden */
export interface ObjectMemberAnimator<V extends AnimatedView, T> extends MemberAnimator<V, T> {
}

/** @hidden */
export const ObjectMemberAnimator: ObjectMemberAnimatorClass = (function (_super: typeof MemberAnimator): ObjectMemberAnimatorClass {
  const ObjectMemberAnimator: ObjectMemberAnimatorClass = function <V extends AnimatedView, T>(
      this: ObjectMemberAnimator<V, T>, view: V, animatorName: string | undefined, value?: T,
      transition?: Transition<T> | null, inherit?: string | null): ObjectMemberAnimator<V, T> {
    let _this: ObjectMemberAnimator<V, T> = function accessor(value?: T, tween?: Tween<T>): T | null | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as ObjectMemberAnimator<V, T>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, value, transition, inherit) || _this;
    return _this;
  } as unknown as ObjectMemberAnimatorClass;
  __extends(ObjectMemberAnimator, _super);

  ObjectMemberAnimator.prototype.fromAny = function <T>(this: ObjectMemberAnimator<AnimatedView, T>, value: T | null): T | null {
    return value;
  };

  return ObjectMemberAnimator;
}(MemberAnimator));
MemberAnimator.Object = ObjectMemberAnimator;
