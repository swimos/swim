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
import {AnyColor, Color} from "@swim/color";
import {Tween} from "@swim/transition";
import {AttributeAnimatorConstructor, AttributeAnimator} from "./AttributeAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export interface ColorOrStringAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, Color | string, AnyColor | string> {
}

/** @hidden */
export const ColorOrStringAttributeAnimator: AttributeAnimatorConstructor<Color | string, AnyColor | string> = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor<Color | string, AnyColor | string> {
  const ColorOrStringAttributeAnimator: AttributeAnimatorConstructor<Color | string, AnyColor | string> = function <V extends ElementView>(
      this: ColorOrStringAttributeAnimator<V>, view: V, animatorName: string, attributeName: string): ColorOrStringAttributeAnimator<V> {
    let _this: ColorOrStringAttributeAnimator<V> = function accessor(value?: AnyColor | string, tween?: Tween<Color | string>): Color | string | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as ColorOrStringAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, attributeName) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor<Color | string, AnyColor | string>;
  __extends(ColorOrStringAttributeAnimator, _super);

  ColorOrStringAttributeAnimator.prototype.parse = function (this: ColorOrStringAttributeAnimator<ElementView>, value: string): Color | string {
    try {
      return Color.parse(value);
    } catch (swallow) {
      return value;
    }
  };

  ColorOrStringAttributeAnimator.prototype.fromAny = function (this: ColorOrStringAttributeAnimator<ElementView>, value: AnyColor | string): Color | string {
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

  return ColorOrStringAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.ColorOrString = ColorOrStringAttributeAnimator;
