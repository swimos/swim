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
import {FontFamily, Font} from "@swim/font";
import {Tween, Transition} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export interface FontFamilyStyleAnimator<V extends ElementView> extends StyleAnimator<V, FontFamily | FontFamily[], FontFamily | ReadonlyArray<FontFamily>> {
}

/** @hidden */
export const FontFamilyStyleAnimator = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor {
  const FontFamilyStyleAnimator: StyleAnimatorConstructor = function <V extends ElementView>(
      this: FontFamilyStyleAnimator<V>, view: V, names: string | ReadonlyArray<string>, value?: FontFamily | FontFamily[] | null,
      transition?: Transition<FontFamily | FontFamily[]> | null, priority?: string): FontFamilyStyleAnimator<V> {
    let _this: FontFamilyStyleAnimator<V> = function (value?: FontFamily | ReadonlyArray<FontFamily> | null, tween?: Tween<FontFamily | FontFamily[]>, priority?: string | null): FontFamily | FontFamily[] | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          value = Font.family(value).family();
        }
        _this.setState(value as FontFamily | FontFamily[], tween, priority);
        return _this._view;
      }
    } as FontFamilyStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, names, value, transition, priority) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor;
  __extends(FontFamilyStyleAnimator, _super);

  Object.defineProperty(FontFamilyStyleAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: FontFamilyStyleAnimator<V>): FontFamily | FontFamily[] | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const propertyValue = this.propertyValue;
        if (propertyValue) {
          try {
            value = Font.parse(propertyValue).family();
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

  return FontFamilyStyleAnimator;
}(StyleAnimator));
StyleAnimator.FontFamily = FontFamilyStyleAnimator;
