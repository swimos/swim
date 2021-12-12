// Copyright 2015-2021 Swim.inc
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

import {AnyLength, Length} from "@swim/math";
import {ThemeConstraintAnimatorFactory, ThemeConstraintAnimator} from "./ThemeConstraintAnimator";

/** @internal */
export const LengthThemeConstraintAnimator = (function (_super: typeof ThemeConstraintAnimator) {
  const LengthThemeConstraintAnimator = _super.extend("LengthThemeConstraintAnimator") as ThemeConstraintAnimatorFactory<ThemeConstraintAnimator<any, Length | null | undefined, AnyLength | null | undefined>>;

  LengthThemeConstraintAnimator.prototype.toNumber = function (value: Length | null | undefined): number {
    try {
      return value !== void 0 && value !== null ? value.pxValue() : 0;
    } catch (swallow) {
      return 0;
    }
  };

  LengthThemeConstraintAnimator.prototype.fromAny = function (value: AnyLength | null | undefined): Length | null | undefined {
    return value !== void 0 && value !== null ? Length.fromAny(value) : null;
  };

  LengthThemeConstraintAnimator.prototype.equalValues = function (newValue: Length | null | undefined, oldValue: Length | null | undefined): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldValue);
    } else {
      return newValue === oldValue;
    }
  };

  return LengthThemeConstraintAnimator;
})(ThemeConstraintAnimator);
