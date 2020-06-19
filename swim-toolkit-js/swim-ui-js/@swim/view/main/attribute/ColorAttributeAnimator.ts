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
import {AttributeAnimatorConstructor, AttributeAnimator} from "./AttributeAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export interface ColorAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, Color, AnyColor> {
}

/** @hidden */
export const ColorAttributeAnimator: AttributeAnimatorConstructor<Color, AnyColor> = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor<Color, AnyColor> {
  const ColorAttributeAnimator: AttributeAnimatorConstructor<Color, AnyColor> = function <V extends ElementView>(
      this: ColorAttributeAnimator<V>, view: V, animatorName: string, attributeName: string): ColorAttributeAnimator<V> {
    let _this: ColorAttributeAnimator<V> = function accessor(value?: AnyColor, tween?: Tween<Color>): Color | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as ColorAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, attributeName) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor<Color, AnyColor>;
  __extends(ColorAttributeAnimator, _super);

  ColorAttributeAnimator.prototype.parse = function (this: ColorAttributeAnimator<ElementView>, value: string): Color {
    return Color.parse(value);
  };

  ColorAttributeAnimator.prototype.fromAny = function (this: ColorAttributeAnimator<ElementView>, value: AnyColor): Color {
    return Color.fromAny(value);
  };

  return ColorAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.Color = ColorAttributeAnimator;
