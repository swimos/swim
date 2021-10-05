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

import {AnyFont, Font} from "@swim/style";
import {ThemeAnimatorClass, ThemeAnimator} from "./ThemeAnimator";

/** @internal */
export const FontThemeAnimator = (function (_super: typeof ThemeAnimator) {
  const FontThemeAnimator = _super.extend() as ThemeAnimatorClass<ThemeAnimator<any, Font | null | undefined, AnyFont | null | undefined>>;

  FontThemeAnimator.prototype.fromAny = function (value: AnyFont | null | undefined): Font | null | undefined {
    return value !== void 0 && value !== null ? Font.fromAny(value) : value;
  };

  FontThemeAnimator.prototype.equalState = function (newState: Font | null | undefined, oldState: Font | null | undefined): boolean {
    if (newState !== void 0 && newState !== null) {
      return newState.equals(oldState);
    } else {
      return newState === oldState;
    }
  };

  return FontThemeAnimator;
})(ThemeAnimator);
