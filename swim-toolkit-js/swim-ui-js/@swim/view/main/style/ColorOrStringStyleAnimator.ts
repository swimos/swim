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
export interface ColorOrStringStyleAnimator<V extends ElementView> extends StyleAnimator<V, Color | string, AnyColor | string> {
}

/** @hidden */
export const ColorOrStringStyleAnimator: StyleAnimatorConstructor<Color | string, AnyColor | string> = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor<Color | string, AnyColor | string> {
  const ColorOrStringStyleAnimator: StyleAnimatorConstructor<Color | string, AnyColor | string> = function <V extends ElementView>(
      this: ColorOrStringStyleAnimator<V>, view: V, animatorName: string, propertyNames: string | ReadonlyArray<string>): ColorOrStringStyleAnimator<V> {
    let _this: ColorOrStringStyleAnimator<V> = function accessor(value?: AnyColor | string, tween?: Tween<Color | string>, priority?: string): Color | string | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as ColorOrStringStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, propertyNames) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor<Color | string, AnyColor | string>;
  __extends(ColorOrStringStyleAnimator, _super);

  ColorOrStringStyleAnimator.prototype.parse = function (this: ColorOrStringStyleAnimator<ElementView>, value: string): Color | string {
    try {
      return Color.parse(value);
    } catch (swallow) {
      return value;
    }
  };

  ColorOrStringStyleAnimator.prototype.fromAny = function (this: ColorOrStringStyleAnimator<ElementView>, value: AnyColor | string): Color | string {
    if (typeof value === "string") {
      try {
        return Color.parse(value);
      } catch (swallow) {
        return value;
      }
    } else {
      return Color.fromAny(value);
    }
  };

  return ColorOrStringStyleAnimator;
}(StyleAnimator));
StyleAnimator.ColorOrString = ColorOrStringStyleAnimator;
