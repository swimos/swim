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

import {AnyAngle, Angle} from "@swim/math";
import {ThemeAnimatorFactory, ThemeAnimator} from "./ThemeAnimator";

/** @internal */
export const AngleThemeAnimator = (function (_super: typeof ThemeAnimator) {
  const AngleThemeAnimator = _super.extend("AngleThemeAnimator") as ThemeAnimatorFactory<ThemeAnimator<any, Angle | null | undefined, AnyAngle | null | undefined>>;

  AngleThemeAnimator.prototype.fromAny = function (value: AnyAngle | null): Angle | null {
    return value !== void 0 && value !== null ? Angle.fromAny(value) : value;
  };

  AngleThemeAnimator.prototype.equalValues = function (newValue: Angle | null | undefined, oldValue: Angle | null | undefined): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldValue);
    } else {
      return newValue === oldValue;
    }
  };

  return AngleThemeAnimator;
})(ThemeAnimator);
