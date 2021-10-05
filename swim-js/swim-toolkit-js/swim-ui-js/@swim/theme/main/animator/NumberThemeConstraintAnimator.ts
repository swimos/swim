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

import {ThemeConstraintAnimatorClass, ThemeConstraintAnimator} from "./ThemeConstraintAnimator";

/** @internal */
export const NumberThemeConstraintAnimator = (function (_super: typeof ThemeConstraintAnimator) {
  const NumberThemeConstraintAnimator = _super.extend() as ThemeConstraintAnimatorClass<ThemeConstraintAnimator<any, number | null | undefined, number | string | null | undefined>>;

  NumberThemeConstraintAnimator.prototype.toNumber = function (value: number | null): number {
    return typeof value === "number" ? value : 0;
  };

  NumberThemeConstraintAnimator.prototype.fromAny = function (value: number | string | null | undefined): number | null | undefined {
    if (typeof value === "string") {
      const number = +value;
      if (isFinite(number)) {
        return number;
      } else {
        throw new Error(value);
      }
    } else {
      return value;
    }
  };

  NumberThemeConstraintAnimator.prototype.equalState = function (newState: number | null | undefined, oldState: number | null | undefined): boolean {
    return newState === oldState;
  };

  return NumberThemeConstraintAnimator;
})(ThemeConstraintAnimator);
