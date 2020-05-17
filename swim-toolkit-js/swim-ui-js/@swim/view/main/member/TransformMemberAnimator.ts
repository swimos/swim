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
import {AnyTransform, Transform} from "@swim/transform";
import {Transition, Tween} from "@swim/transition";
import {AnimatedView} from "../animated/AnimatedView";
import {MemberAnimatorConstructor, MemberAnimator} from "./MemberAnimator";

/** @hidden */
export interface TransformMemberAnimator<V extends AnimatedView> extends MemberAnimator<V, Transform, AnyTransform> {
}

/** @hidden */
export const TransformMemberAnimator: MemberAnimatorConstructor<Transform, AnyTransform> = (function (_super: typeof MemberAnimator): MemberAnimatorConstructor<Transform, AnyTransform> {
  const TransformMemberAnimator: MemberAnimatorConstructor<Transform, AnyTransform> = function <V extends AnimatedView>(
      this: TransformMemberAnimator<V>, view: V, animatorName: string | undefined, value?: AnyTransform,
      transition?: Transition<Transform> | null, inherit?: string | null): TransformMemberAnimator<V> {
    let _this: TransformMemberAnimator<V> = function accessor(value?: AnyTransform, tween?: Tween<Transform>): Transform | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as TransformMemberAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, value, transition, inherit) || _this;
    return _this;
  } as unknown as MemberAnimatorConstructor<Transform, AnyTransform>;
  __extends(TransformMemberAnimator, _super);

  TransformMemberAnimator.prototype.fromAny = function (this: TransformMemberAnimator<AnimatedView>, value: AnyTransform | null): Transform | null {
    return value !== null ? Transform.fromAny(value) : null;
  };

  return TransformMemberAnimator;
}(MemberAnimator));
MemberAnimator.Transform = TransformMemberAnimator;
