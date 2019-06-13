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
import {AnyColor, Color} from "@swim/color";
import {Tween, Transition} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export interface ColorStyleAnimator<V extends ElementView> extends StyleAnimator<V, Color, AnyColor> {
}

/** @hidden */
export const ColorStyleAnimator = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor {
  const ColorStyleAnimator: StyleAnimatorConstructor = function <V extends ElementView>(
      this: ColorStyleAnimator<V>, view: V, names: string | ReadonlyArray<string>, value?: Color | null,
      transition?: Transition<Color> | null, priority?: string): ColorStyleAnimator<V> {
    let _this: ColorStyleAnimator<V> = function (value?: AnyColor | null, tween?: Tween<Color>, priority?: string | null): Color | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          value = Color.fromAny(value);
        }
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as ColorStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, names, value, transition, priority) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor;
  __extends(ColorStyleAnimator, _super);

  Object.defineProperty(ColorStyleAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: ColorStyleAnimator<V>): Color | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const propertyValue = this.propertyValue;
        if (propertyValue) {
          try {
            value = Color.parse(propertyValue);
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

  return ColorStyleAnimator;
}(StyleAnimator));
StyleAnimator.Color = ColorStyleAnimator;
