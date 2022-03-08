// Copyright 2015-2022 Swim.inc
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

import {AnyColor, Color} from "@swim/style";
import {ThemeAnimatorFactory, ThemeAnimator} from "./ThemeAnimator";

/** @internal */
export const ColorThemeAnimator = (function (_super: typeof ThemeAnimator) {
  const ColorThemeAnimator = _super.extend("ColorThemeAnimator") as ThemeAnimatorFactory<ThemeAnimator<any, Color | null | undefined, AnyColor | null | undefined>>;

  ColorThemeAnimator.prototype.fromAny = function (value: AnyColor | null): Color | null {
    return value !== void 0 && value !== null ? Color.fromAny(value) : value;
  };

  ColorThemeAnimator.prototype.equalValues = function (newValue: Color | null | undefined, oldValue: Color | null | undefined): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldValue);
    } else {
      return newValue === oldValue;
    }
  };

  return ColorThemeAnimator;
})(ThemeAnimator);
