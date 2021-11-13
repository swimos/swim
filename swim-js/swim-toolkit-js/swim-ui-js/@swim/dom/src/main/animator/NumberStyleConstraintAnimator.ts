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

import {StyleConstraintAnimatorFactory, StyleConstraintAnimator} from "./StyleConstraintAnimator";

/** @internal */
export const NumberStyleConstraintAnimator = (function (_super: typeof StyleConstraintAnimator) {
  const NumberStyleConstraintAnimator = _super.extend("NumberStyleConstraintAnimator") as StyleConstraintAnimatorFactory<StyleConstraintAnimator<any, number | undefined, string>>;

  NumberStyleConstraintAnimator.prototype.toNumber = function (value: number): number {
    return typeof value === "number" ? value : 0;
  };

  NumberStyleConstraintAnimator.prototype.parse = function (value: string): number | undefined {
    const number = +value;
    return isFinite(number) ? number : void 0;
  };

  NumberStyleConstraintAnimator.prototype.fromCssValue = function (value: CSSStyleValue): number | undefined {
    if (value instanceof CSSNumericValue) {
      return value.to("number").value;
    } else {
      return void 0;
    }
  };

  NumberStyleConstraintAnimator.prototype.fromAny = function (value: number | string): number | undefined {
    if (typeof value === "number") {
      return value;
    } else {
      const number = +value;
      return isFinite(number) ? number : void 0;
    }
  };

  NumberStyleConstraintAnimator.prototype.equalState = function (newState: number | undefined, oldState: number | undefined): boolean {
    return newState === oldState;
  };

  return NumberStyleConstraintAnimator;
})(StyleConstraintAnimator);
