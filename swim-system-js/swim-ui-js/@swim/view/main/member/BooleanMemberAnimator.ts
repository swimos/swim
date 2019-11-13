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
import {Transition, Tween} from "@swim/transition";
import {MemberAnimatorConstructor, MemberAnimator} from "./MemberAnimator";
import {AnimatedView} from "../AnimatedView";

/** @hidden */
export interface BooleanMemberAnimator<V extends AnimatedView> extends MemberAnimator<V, boolean, boolean | string> {
}

/** @hidden */
export const BooleanMemberAnimator = (function (_super: typeof MemberAnimator): MemberAnimatorConstructor<boolean, boolean | string> {
  const BooleanMemberAnimator: MemberAnimatorConstructor<boolean, boolean | string> = function <V extends AnimatedView>(
      this: BooleanMemberAnimator<V>, view: V, value?: boolean | string | null,
      transition?: Transition<boolean> | null, inherit?: string | null): BooleanMemberAnimator<V> {
    let _this: BooleanMemberAnimator<V> = function (value?: boolean | string | null, tween?: Tween<boolean>): boolean | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (typeof value === "string") {
          value = value ? true : false;
        }
        _this.setState(value, tween);
        return _this._view;
      }
    } as BooleanMemberAnimator<V>;
    (_this as any).__proto__ = this;
    if (typeof value === "string") {
      value = value ? true : false;
    }
    _this = _super.call(_this, view, value, transition, inherit) || _this;
    return _this;
  } as unknown as MemberAnimatorConstructor<boolean, boolean | string>;
  __extends(BooleanMemberAnimator, _super);

  return BooleanMemberAnimator;
}(MemberAnimator));
MemberAnimator.Boolean = BooleanMemberAnimator;
