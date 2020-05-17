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
import {MemberAnimatorConstructor, MemberAnimator} from "./MemberAnimator";

/** @hidden */
export interface BooleanMemberAnimator<V extends AnimatedView> extends MemberAnimator<V, boolean, boolean | string> {
}

/** @hidden */
export const BooleanMemberAnimator: MemberAnimatorConstructor<boolean, boolean | string> = (function (_super: typeof MemberAnimator): MemberAnimatorConstructor<boolean, boolean | string> {
  const BooleanMemberAnimator: MemberAnimatorConstructor<boolean, boolean | string> = function <V extends AnimatedView>(
      this: BooleanMemberAnimator<V>, view: V, animatorName: string | undefined, value?: boolean | string,
      transition?: Transition<boolean> | null, inherit?: string | null): BooleanMemberAnimator<V> {
    let _this: BooleanMemberAnimator<V> = function accessor(value?: boolean | string, tween?: Tween<boolean>): boolean | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as BooleanMemberAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, value, transition, inherit) || _this;
    return _this;
  } as unknown as MemberAnimatorConstructor<boolean, boolean | string>;
  __extends(BooleanMemberAnimator, _super);

  BooleanMemberAnimator.prototype.fromAny = function (this: BooleanMemberAnimator<AnimatedView>, value: boolean | string | null): boolean | null {
    if (typeof value === "string") {
      return !!value;
    } else {
      return value;
    }
  };

  return BooleanMemberAnimator;
}(MemberAnimator));
MemberAnimator.Boolean = BooleanMemberAnimator;
