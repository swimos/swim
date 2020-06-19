// Copyright 2015-2020 Swim inc.
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
import {Tween} from "@swim/transition";
import {View} from "../View";
import {ViewAnimatorDescriptor, ViewAnimatorConstructor, ViewAnimator} from "./ViewAnimator";

/** @hidden */
export interface AngleViewAnimator<V extends View> extends ViewAnimator<V, Angle, AnyAngle> {
}

/** @hidden */
export const AngleViewAnimator: ViewAnimatorConstructor<Angle, AnyAngle> = (function (_super: typeof ViewAnimator): ViewAnimatorConstructor<Angle, AnyAngle> {
  const AngleViewAnimator: ViewAnimatorConstructor<Angle, AnyAngle> = function <V extends View>(
      this: AngleViewAnimator<V>, view: V, animatorName: string | undefined,
      descriptor?: ViewAnimatorDescriptor<V, Angle, AnyAngle>): AngleViewAnimator<V> {
    let _this: AngleViewAnimator<V> = function accessor(value?: AnyAngle, tween?: Tween<Angle>): Angle | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as AngleViewAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, descriptor) || _this;
    return _this;
  } as unknown as ViewAnimatorConstructor<Angle, AnyAngle>;
  __extends(AngleViewAnimator, _super);

  AngleViewAnimator.prototype.fromAny = function (this: AngleViewAnimator<View>, value: AnyAngle | null): Angle | null {
    return value !== null ? Angle.fromAny(value) : null;
  };

  return AngleViewAnimator;
}(ViewAnimator));
ViewAnimator.Angle = AngleViewAnimator;
