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
import {AnyFont, Font} from "@swim/font";
import {Transition, Tween} from "@swim/transition";
import {AnimatedView} from "../animated/AnimatedView";
import {MemberAnimatorConstructor, MemberAnimator} from "./MemberAnimator";

/** @hidden */
export interface FontMemberAnimator<V extends AnimatedView> extends MemberAnimator<V, Font, AnyFont> {
}

/** @hidden */
export const FontMemberAnimator: MemberAnimatorConstructor<Font, AnyFont> = (function (_super: typeof MemberAnimator): MemberAnimatorConstructor<Font, AnyFont> {
  const FontMemberAnimator: MemberAnimatorConstructor<Font, AnyFont> = function <V extends AnimatedView>(
      this: FontMemberAnimator<V>, view: V, animatorName: string | undefined, value?: AnyFont,
      transition?: Transition<Font> | null, inherit?: string | null): FontMemberAnimator<V> {
    let _this: FontMemberAnimator<V> = function accessor(value?: AnyFont, tween?: Tween<Font>): Font | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as FontMemberAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, value, transition, inherit) || _this;
    return _this;
  } as unknown as MemberAnimatorConstructor<Font, AnyFont>;
  __extends(FontMemberAnimator, _super);

  FontMemberAnimator.prototype.fromAny = function (this: FontMemberAnimator<AnimatedView>, value: AnyFont | null): Font | null {
    return value !== null ? Font.fromAny(value) : null;
  };

  return FontMemberAnimator;
}(MemberAnimator));
MemberAnimator.Font = FontMemberAnimator;
