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

import {AnyLength, Length, PxLength} from "@swim/math";
import {StyleConstraintAnimatorFactory, StyleConstraintAnimator} from "./StyleConstraintAnimator";

/** @internal */
export const LengthStyleConstraintAnimator = (function (_super: typeof StyleConstraintAnimator) {
  const LengthStyleConstraintAnimator = _super.extend("LengthStyleConstraintAnimator") as StyleConstraintAnimatorFactory<StyleConstraintAnimator<any, Length | null, AnyLength | null>>;

  LengthStyleConstraintAnimator.prototype.toNumber = function (value: Length): number {
    if (!(value instanceof PxLength)) {
      const computedValue = this.computedValue;
      if (computedValue !== void 0 && computedValue !== null) {
        value = computedValue;
      }
    }
    if (value instanceof PxLength) {
      return value.value;
    } else {
      return 0;
    }
  };

  LengthStyleConstraintAnimator.prototype.parse = function (value: string): Length | null {
    return Length.parse(value);
  };

  LengthStyleConstraintAnimator.prototype.fromCssValue = function (value: CSSStyleValue): Length | null {
    return Length.fromCssValue(value);
  };

  LengthStyleConstraintAnimator.prototype.fromAny = function (value: AnyLength | string): Length | null {
    try {
      return Length.fromAny(value);
    } catch (swallow) {
      return null;
    }
  };

  LengthStyleConstraintAnimator.prototype.equalState = function (newState: Length | null, oldState: Length | null): boolean {
    if (newState !== void 0 && newState !== null) {
      return newState.equals(oldState);
    } else {
      return newState === oldState;
    }
  };

  return LengthStyleConstraintAnimator;
})(StyleConstraintAnimator);
