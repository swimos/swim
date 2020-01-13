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
import {AnyLength, Length} from "@swim/length";
import {Transition, Tween} from "@swim/transition";
import {MemberAnimatorConstructor, MemberAnimator} from "./MemberAnimator";
import {AnimatedView} from "../AnimatedView";

/** @hidden */
export interface LengthMemberAnimator<V extends AnimatedView> extends MemberAnimator<V, Length, AnyLength> {
}

/** @hidden */
export const LengthMemberAnimator = (function (_super: typeof MemberAnimator): MemberAnimatorConstructor<Length, AnyLength> {
  const LengthMemberAnimator: MemberAnimatorConstructor<Length, AnyLength> = function <V extends AnimatedView>(
      this: LengthMemberAnimator<V>, view: V, value?: AnyLength | null,
      transition?: Transition<Length> | null, inherit?: string | null): LengthMemberAnimator<V> {
    let _this: LengthMemberAnimator<V> = function (value?: AnyLength | null, tween?: Tween<Length>): Length | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          value = Length.fromAny(value);
        }
        _this.setState(value, tween);
        return _this._view;
      }
    } as LengthMemberAnimator<V>;
    (_this as any).__proto__ = this;
    if (value !== null && value !== void 0) {
      value = Length.fromAny(value);
    }
    _this = _super.call(_this, view, value, transition, inherit) || _this;
    return _this;
  } as unknown as MemberAnimatorConstructor<Length, AnyLength>;
  __extends(LengthMemberAnimator, _super);

  return LengthMemberAnimator;
}(MemberAnimator));
MemberAnimator.Length = LengthMemberAnimator;
