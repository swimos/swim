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
import {Tween, Transition} from "@swim/transition";
import {AttributeAnimatorConstructor, AttributeAnimator} from "./AttributeAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export interface ColorAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, Color, AnyColor> {
}

/** @hidden */
export const ColorAttributeAnimator = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor {
  const ColorAttributeAnimator: AttributeAnimatorConstructor = function <V extends ElementView>(
      this: ColorAttributeAnimator<V>, view: V, name: string, value?: Color | null,
      transition?: Transition<Color> | null): ColorAttributeAnimator<V> {
    let _this: ColorAttributeAnimator<V> = function (value?: AnyColor | null, tween?: Tween<Color>): Color | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          value = Color.fromAny(value);
        }
        _this.setState(value, tween);
        return _this._view;
      }
    } as ColorAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, name, value, transition) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor;
  __extends(ColorAttributeAnimator, _super);

  Object.defineProperty(ColorAttributeAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: ColorAttributeAnimator<V>): Color | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const attributeValue = this.attributeValue;
        if (attributeValue) {
          try {
            value = Color.parse(attributeValue);
          } catch (swallow) {
            // nop
          }
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  return ColorAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.Color = ColorAttributeAnimator;
