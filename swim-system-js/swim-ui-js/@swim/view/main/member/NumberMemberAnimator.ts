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
import {Tween, Transition} from "@swim/transition";
import {MemberAnimatorInherit, MemberAnimatorConstructor, MemberAnimator} from "./MemberAnimator";
import {AnimatedView} from "../AnimatedView";

/** @hidden */
export interface NumberMemberAnimator<V extends AnimatedView> extends MemberAnimator<V, number, number | string> {
}

/** @hidden */
export const NumberMemberAnimator = (function (_super: typeof MemberAnimator): MemberAnimatorConstructor {
  const NumberMemberAnimator: MemberAnimatorConstructor = function <V extends AnimatedView>(
      this: NumberMemberAnimator<V>, view: V, value?: number | null,
      transition?: Transition<number> | null, inherit?: MemberAnimatorInherit): NumberMemberAnimator<V> {
    let _this: NumberMemberAnimator<V> = function (value?: number | string | null, tween?: Tween<number>): number | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (typeof value === "string") {
          value = +value;
        }
        _this.setState(value, tween);
        return _this._view;
      }
    } as NumberMemberAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, value, transition, inherit) || _this;
    return _this;
  } as unknown as MemberAnimatorConstructor;
  __extends(NumberMemberAnimator, _super);

  return NumberMemberAnimator;
}(MemberAnimator));
MemberAnimator.Number = NumberMemberAnimator;
