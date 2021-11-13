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

import {AnyLength, Length} from "@swim/math";
import {ThemeAnimatorFactory, ThemeAnimator} from "./ThemeAnimator";

/** @internal */
export const LengthThemeAnimator = (function (_super: typeof ThemeAnimator) {
  const LengthThemeAnimator = _super.extend("LengthThemeAnimator") as ThemeAnimatorFactory<ThemeAnimator<any, Length | null | undefined, AnyLength | null | undefined>>;

  LengthThemeAnimator.prototype.fromAny = function (value: AnyLength | null | undefined): Length | null | undefined {
    return value !== void 0 && value !== null ? Length.fromAny(value) : null;
  };

  LengthThemeAnimator.prototype.equalState = function (newState: Length | null | undefined, oldState: Length | null | undefined): boolean {
    if (newState !== void 0 && newState !== null) {
      return newState.equals(oldState);
    } else {
      return newState === oldState;
    }
  };

  return LengthThemeAnimator;
})(ThemeAnimator);
