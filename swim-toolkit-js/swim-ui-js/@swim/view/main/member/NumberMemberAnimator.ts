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
export interface NumberMemberAnimator<V extends AnimatedView> extends MemberAnimator<V, number, number | string> {
}

/** @hidden */
export const NumberMemberAnimator: MemberAnimatorConstructor<number, number | string> = (function (_super: typeof MemberAnimator): MemberAnimatorConstructor<number, number | string> {
  const NumberMemberAnimator: MemberAnimatorConstructor<number, number | string> = function <V extends AnimatedView>(
      this: NumberMemberAnimator<V>, view: V, animatorName: string | undefined, value?: number | string,
      transition?: Transition<number> | null, inherit?: string | null): NumberMemberAnimator<V> {
    let _this: NumberMemberAnimator<V> = function accessor(value?: number | string, tween?: Tween<number>): number | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as NumberMemberAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, value, transition, inherit) || _this;
    return _this;
  } as unknown as MemberAnimatorConstructor<number, number | string>;
  __extends(NumberMemberAnimator, _super);

  NumberMemberAnimator.prototype.fromAny = function (this: NumberMemberAnimator<AnimatedView>, value: number | string | null): number | null {
    if (typeof value === "string") {
      const number = +value;
      if (isFinite(number)) {
        return number;
      } else {
        throw new Error(value);
      }
    } else {
      return value;
    }
  };

  return NumberMemberAnimator;
}(MemberAnimator));
MemberAnimator.Number = NumberMemberAnimator;
