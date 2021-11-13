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

import {AnimatorFactory, Animator} from "./Animator";

/** @internal */
export const NumberAnimator = (function (_super: typeof Animator) {
  const NumberAnimator = _super.extend("NumberAnimator") as AnimatorFactory<Animator<any, number | null | undefined, number | string | null | undefined>>;

  NumberAnimator.prototype.fromAny = function (value: number | string | null | undefined): number | null | undefined {
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

  NumberAnimator.prototype.equalState = function (newState: number | null | undefined, oldState: number | null | undefined): boolean {
    return newState === oldState;
  };

  return NumberAnimator;
})(Animator);
