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
import {AnyFont, Font} from "@swim/font";
import {Tween, Transition} from "@swim/transition";
import {MemberAnimatorInherit, MemberAnimatorConstructor, MemberAnimator} from "./MemberAnimator";
import {AnimatedView} from "../AnimatedView";

/** @hidden */
export interface FontMemberAnimator<V extends AnimatedView> extends MemberAnimator<V, Font, AnyFont> {
}

/** @hidden */
export const FontMemberAnimator = (function (_super: typeof MemberAnimator): MemberAnimatorConstructor {
  const FontMemberAnimator: MemberAnimatorConstructor = function <V extends AnimatedView>(
      this: FontMemberAnimator<V>, view: V, value?: Font | null,
      transition?: Transition<Font> | null, inherit?: MemberAnimatorInherit): FontMemberAnimator<V> {
    let _this: FontMemberAnimator<V> = function (value?: AnyFont | null, tween?: Tween<Font>): Font | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          value = Font.fromAny(value);
        }
        _this.setState(value, tween);
        return _this._view;
      }
    } as FontMemberAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, value, transition, inherit) || _this;
    return _this;
  } as unknown as MemberAnimatorConstructor;
  __extends(FontMemberAnimator, _super);

  return FontMemberAnimator;
}(MemberAnimator));
MemberAnimator.Font = FontMemberAnimator;
