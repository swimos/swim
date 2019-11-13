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
export interface StringMemberAnimator<V extends AnimatedView> extends MemberAnimator<V, string, string> {
}

/** @hidden */
export const StringMemberAnimator = (function (_super: typeof MemberAnimator): MemberAnimatorConstructor<string> {
  const StringMemberAnimator: MemberAnimatorConstructor<string> = function <V extends AnimatedView>(
      this: StringMemberAnimator<V>, view: V, value?: string | null,
      transition?: Transition<string> | null, inherit?: string | null): StringMemberAnimator<V> {
    let _this: StringMemberAnimator<V> = function (value?: string | null, tween?: Tween<string>): string | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as StringMemberAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, value, transition, inherit) || _this;
    return _this;
  } as unknown as MemberAnimatorConstructor<string>;
  __extends(StringMemberAnimator, _super);

  return StringMemberAnimator;
}(MemberAnimator));
MemberAnimator.String = StringMemberAnimator;
