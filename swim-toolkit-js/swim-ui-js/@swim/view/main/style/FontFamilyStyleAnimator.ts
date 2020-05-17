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
import {Tween} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export interface FontFamilyStyleAnimator<V extends ElementView> extends StyleAnimator<V, FontFamily | FontFamily[], FontFamily | ReadonlyArray<FontFamily>> {
}

/** @hidden */
export const FontFamilyStyleAnimator: StyleAnimatorConstructor<FontFamily | FontFamily[], FontFamily | ReadonlyArray<FontFamily>> = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor<FontFamily | FontFamily[], FontFamily | ReadonlyArray<FontFamily>> {
  const FontFamilyStyleAnimator: StyleAnimatorConstructor<FontFamily | FontFamily[], FontFamily | ReadonlyArray<FontFamily>> = function <V extends ElementView>(
      this: FontFamilyStyleAnimator<V>, view: V, animatorName: string, propertyNames: string | ReadonlyArray<string>): FontFamilyStyleAnimator<V> {
    let _this: FontFamilyStyleAnimator<V> = function accessor(value?: FontFamily | ReadonlyArray<FontFamily>, tween?: Tween<FontFamily | FontFamily[]>, priority?: string): FontFamily | FontFamily[] | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as FontFamilyStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, propertyNames) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor<FontFamily | FontFamily[], FontFamily | ReadonlyArray<FontFamily>>;
  __extends(FontFamilyStyleAnimator, _super);

  FontFamilyStyleAnimator.prototype.parse = function (this: FontFamilyStyleAnimator<ElementView>, value: string): FontFamily | FontFamily[] {
    return Font.parse(value).family();
  };

  FontFamilyStyleAnimator.prototype.fromAny = function (this: FontFamilyStyleAnimator<ElementView>, value: FontFamily | ReadonlyArray<FontFamily>): FontFamily | FontFamily[] {
    return Font.family(value).family();
  };

  return FontFamilyStyleAnimator;
}(StyleAnimator));
StyleAnimator.FontFamily = FontFamilyStyleAnimator;
