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
import {StyleAnimatorFactory, StyleAnimator} from "./StyleAnimator";

/** @internal */
export const ColorStyleAnimator = (function (_super: typeof StyleAnimator) {
  const ColorStyleAnimator = _super.extend("ColorStyleAnimator") as StyleAnimatorFactory<StyleAnimator<any, Color | null, AnyColor | null>>;

  ColorStyleAnimator.prototype.parse = function (value: string): Color | null {
    return Color.parse(value);
  };

  ColorStyleAnimator.prototype.fromAny = function (value: AnyColor): Color | null {
    try {
      return Color.fromAny(value);
    } catch (swallow) {
      return null;
    }
  };

  ColorStyleAnimator.prototype.equalValues = function (newValue: Color | null, oldValue: Color | null): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldValue);
    } else {
      return newValue === oldValue;
    }
  };

  return ColorStyleAnimator;
})(StyleAnimator);
