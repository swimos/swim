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
export interface ColorOrStringStyleAnimator<V extends ElementView> extends StyleAnimator<V, Color | string, AnyColor | string> {
}

/** @hidden */
export const ColorOrStringStyleAnimator = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor {
  const ColorOrStringStyleAnimator: StyleAnimatorConstructor = function <V extends ElementView>(
      this: ColorOrStringStyleAnimator<V>, view: V, names: string | ReadonlyArray<string>, value?: Color | string | null,
      transition?: Transition<Color | string> | null, priority?: string): ColorOrStringStyleAnimator<V> {
    let _this: ColorOrStringStyleAnimator<V> = function (value?: AnyColor | string | null, tween?: Tween<Color | string>, priority?: string | null): Color | string | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          if (typeof value === "string") {
            try {
              value = Color.parse(value);
            } catch (swallow) {
              // string value
            }
          } else {
            value = Color.fromAny(value);
          }
        }
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as ColorOrStringStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, names, value, transition, priority) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor;
  __extends(ColorOrStringStyleAnimator, _super);

  Object.defineProperty(ColorOrStringStyleAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: ColorOrStringStyleAnimator<V>): Color | string | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const propertyValue = this.propertyValue;
        if (propertyValue) {
          try {
            value = Color.parse(propertyValue);
          } catch (swallow) {
            value = propertyValue;
          }
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  return ColorOrStringStyleAnimator;
}(StyleAnimator));
StyleAnimator.ColorOrString = ColorOrStringStyleAnimator;
