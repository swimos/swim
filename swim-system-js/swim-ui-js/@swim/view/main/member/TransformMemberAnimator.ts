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
import {AnyTransform, Transform} from "@swim/transform";
import {Tween, Transition} from "@swim/transition";
import {MemberAnimatorInherit, MemberAnimatorConstructor, MemberAnimator} from "./MemberAnimator";
import {AnimatedView} from "../AnimatedView";

/** @hidden */
export interface TransformMemberAnimator<V extends AnimatedView> extends MemberAnimator<V, Transform, AnyTransform> {
}

/** @hidden */
export const TransformMemberAnimator = (function (_super: typeof MemberAnimator): MemberAnimatorConstructor {
  const TransformMemberAnimator: MemberAnimatorConstructor = function <V extends AnimatedView>(
      this: TransformMemberAnimator<V>, view: V, value?: Transform | null,
      transition?: Transition<Transform> | null, inherit?: MemberAnimatorInherit): TransformMemberAnimator<V> {
    let _this: TransformMemberAnimator<V> = function (value?: AnyTransform | null, tween?: Tween<Transform>): Transform | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          value = Transform.fromAny(value);
        }
        _this.setState(value, tween);
        return _this._view;
      }
    } as TransformMemberAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, value, transition, inherit) || _this;
    return _this;
  } as unknown as MemberAnimatorConstructor;
  __extends(TransformMemberAnimator, _super);

  return TransformMemberAnimator;
}(MemberAnimator));
MemberAnimator.Transform = TransformMemberAnimator;
