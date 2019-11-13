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
import {AnyAngle, Angle} from "@swim/angle";
import {Transition, Tween} from "@swim/transition";
import {MemberAnimatorConstructor, MemberAnimator} from "./MemberAnimator";
import {AnimatedView} from "../AnimatedView";

/** @hidden */
export interface AngleMemberAnimator<V extends AnimatedView> extends MemberAnimator<V, Angle, AnyAngle> {
}

/** @hidden */
export const AngleMemberAnimator = (function (_super: typeof MemberAnimator): MemberAnimatorConstructor<Angle, AnyAngle> {
  const AngleMemberAnimator: MemberAnimatorConstructor<Angle, AnyAngle> = function <V extends AnimatedView>(
      this: AngleMemberAnimator<V>, view: V, value?: AnyAngle | null,
      transition?: Transition<Angle> | null, inherit?: string | null): AngleMemberAnimator<V> {
    let _this: AngleMemberAnimator<V> = function (value?: AnyAngle | null, tween?: Tween<Angle>): Angle | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          value = Angle.fromAny(value);
        }
        _this.setState(value, tween);
        return _this._view;
      }
    } as AngleMemberAnimator<V>;
    (_this as any).__proto__ = this;
    if (value !== null && value !== void 0) {
      value = Angle.fromAny(value);
    }
    _this = _super.call(_this, view, value, transition, inherit) || _this;
    return _this;
  } as unknown as MemberAnimatorConstructor<Angle, AnyAngle>;
  __extends(AngleMemberAnimator, _super);

  return AngleMemberAnimator;
}(MemberAnimator));
MemberAnimator.Angle = AngleMemberAnimator;
