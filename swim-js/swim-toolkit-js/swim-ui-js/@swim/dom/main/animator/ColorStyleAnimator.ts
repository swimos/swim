// Copyright 2015-2021 Swim Inc.
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
import {StyleAnimatorClass, StyleAnimator} from "./StyleAnimator";

/** @internal */
export const ColorStyleAnimator = (function (_super: typeof StyleAnimator) {
  const ColorStyleAnimator = _super.extend() as StyleAnimatorClass<StyleAnimator<any, Color | null, AnyColor | null>>;

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

  ColorStyleAnimator.prototype.equalState = function (newState: Color | null, oldState: Color | null): boolean {
    if (newState !== void 0 && newState !== null) {
      return newState.equals(oldState);
    } else {
      return newState === oldState;
    }
  };

  return ColorStyleAnimator;
})(StyleAnimator);
