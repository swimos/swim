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

/// <reference types="w3c-css-typed-object-model-level-1"/>

import {AnyLength, Length} from "@swim/math";
import {StyleAnimatorFactory, StyleAnimator} from "./StyleAnimator";

/** @internal */
export const LengthStyleAnimator = (function (_super: typeof StyleAnimator) {
  const LengthStyleAnimator = _super.extend("LengthStyleAnimator") as StyleAnimatorFactory<StyleAnimator<any, Length | null, AnyLength | null>>;

  LengthStyleAnimator.prototype.parse = function (value: string): Length | null {
    return Length.parse(value);
  };

  LengthStyleAnimator.prototype.fromCssValue = function (value: CSSStyleValue): Length | null {
    return Length.fromCssValue(value);
  };

  LengthStyleAnimator.prototype.fromAny = function (value: AnyLength | string): Length | null {
    try {
      return Length.fromAny(value);
    } catch (swallow) {
      return null;
    }
  };

  LengthStyleAnimator.prototype.equalState = function (newState: Length | null, oldState: Length | null): boolean {
    if (newState !== void 0 && newState !== null) {
      return newState.equals(oldState);
    } else {
      return newState === oldState;
    }
  };

  return LengthStyleAnimator;
})(StyleAnimator);
