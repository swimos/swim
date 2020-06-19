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
import {AnyColor, Color} from "@swim/color";
import {Tween} from "@swim/transition";
import {View} from "../View";
import {ViewAnimatorDescriptor, ViewAnimatorConstructor, ViewAnimator} from "./ViewAnimator";

/** @hidden */
export interface ColorViewAnimator<V extends View> extends ViewAnimator<V, Color, AnyColor> {
}

/** @hidden */
export const ColorViewAnimator: ViewAnimatorConstructor<Color, AnyColor> = (function (_super: typeof ViewAnimator): ViewAnimatorConstructor<Color, AnyColor> {
  const ColorViewAnimator: ViewAnimatorConstructor<Color, AnyColor> = function <V extends View>(
      this: ColorViewAnimator<V>, view: V, animatorName: string | undefined,
      descriptor?: ViewAnimatorDescriptor<V, Color, AnyColor>): ColorViewAnimator<V> {
    let _this: ColorViewAnimator<V> = function accessor(value?: AnyColor, tween?: Tween<Color>): Color | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as ColorViewAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, descriptor) || _this;
    return _this;
  } as unknown as ViewAnimatorConstructor<Color, AnyColor>;
  __extends(ColorViewAnimator, _super);

  ColorViewAnimator.prototype.fromAny = function (this: ColorViewAnimator<View>, value: AnyColor | null): Color | null {
    return value !== null ? Color.fromAny(value) : null;
  };

  return ColorViewAnimator;
}(ViewAnimator));
ViewAnimator.Color = ColorViewAnimator;
