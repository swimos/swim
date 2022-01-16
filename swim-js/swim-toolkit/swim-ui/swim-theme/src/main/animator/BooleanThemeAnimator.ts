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

import {ThemeAnimatorFactory, ThemeAnimator} from "./ThemeAnimator";

/** @internal */
export const BooleanThemeAnimator = (function (_super: typeof ThemeAnimator) {
  const BooleanThemeAnimator = _super.extend("BooleanThemeAnimator") as ThemeAnimatorFactory<ThemeAnimator<any, boolean | null | undefined, boolean | string | null | undefined>>;

  BooleanThemeAnimator.prototype.fromAny = function (value: boolean | string | null | undefined): boolean | null | undefined {
    return !!value;
  };

  BooleanThemeAnimator.prototype.equalValues = function (newValue: boolean | null | undefined, oldValue: boolean | null | undefined): boolean {
    return newValue === oldValue;
  };

  return BooleanThemeAnimator;
})(ThemeAnimator);