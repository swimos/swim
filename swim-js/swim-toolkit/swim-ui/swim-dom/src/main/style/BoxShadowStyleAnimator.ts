// Copyright 2015-2023 Swim.inc
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

import {AnyBoxShadow, BoxShadow} from "@swim/style";
import {StyleAnimatorClass, StyleAnimator} from "./StyleAnimator";

/** @internal */
export interface BoxShadowStyleAnimator<O = unknown, T extends BoxShadow | null = BoxShadow | null, U extends AnyBoxShadow | null = AnyBoxShadow | T> extends StyleAnimator<O, T, U> {
}

/** @internal */
export const BoxShadowStyleAnimator = (function (_super: typeof StyleAnimator) {
  const BoxShadowStyleAnimator = _super.extend("BoxShadowStyleAnimator", {
    valueType: BoxShadow,
    value: null,
  }) as StyleAnimatorClass<BoxShadowStyleAnimator<any, any, any>>;

  BoxShadowStyleAnimator.prototype.equalValues = function (newValue: BoxShadow | null, oldValue: BoxShadow | null): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldValue);
    } else {
      return newValue === oldValue;
    }
  };

  BoxShadowStyleAnimator.prototype.parse = function (value: string): BoxShadow | null {
    return BoxShadow.parse(value);
  };

  BoxShadowStyleAnimator.prototype.fromAny = function (value: AnyBoxShadow): BoxShadow | null {
    return BoxShadow.fromAny(value);
  };

  return BoxShadowStyleAnimator;
})(StyleAnimator);
