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
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export interface ColorStyleAnimator<V extends ElementView> extends StyleAnimator<V, Color, AnyColor> {
}

/** @hidden */
export const ColorStyleAnimator: StyleAnimatorConstructor<Color, AnyColor> = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor<Color, AnyColor> {
  const ColorStyleAnimator: StyleAnimatorConstructor<Color, AnyColor> = function <V extends ElementView>(
      this: ColorStyleAnimator<V>, view: V, animatorName: string, propertyNames: string | ReadonlyArray<string>): ColorStyleAnimator<V> {
    let _this: ColorStyleAnimator<V> = function accessor(value?: AnyColor, tween?: Tween<Color>, priority?: string): Color | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as ColorStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, propertyNames) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor<Color, AnyColor>;
  __extends(ColorStyleAnimator, _super);

  ColorStyleAnimator.prototype.parse = function (this: ColorStyleAnimator<ElementView>, value: string): Color {
    return Color.parse(value);
  };

  ColorStyleAnimator.prototype.fromAny = function (this: ColorStyleAnimator<ElementView>, value: AnyColor): Color {
    return Color.fromAny(value);
  };

  return ColorStyleAnimator;
}(StyleAnimator));
StyleAnimator.Color = ColorStyleAnimator;
