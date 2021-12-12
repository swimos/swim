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

import {AttributeAnimatorFactory, AttributeAnimator} from "./AttributeAnimator";

/** @internal */
export const NumberAttributeAnimator = (function (_super: typeof AttributeAnimator) {
  const NumberAttributeAnimator = _super.extend("NumberAttributeAnimator") as AttributeAnimatorFactory<AttributeAnimator<any, number | undefined, string>>;

  NumberAttributeAnimator.prototype.parse = function (value: string): number | undefined {
    const number = +value;
    return isFinite(number) ? number : void 0;
  };

  NumberAttributeAnimator.prototype.fromAny = function (value: number | string): number | undefined {
    if (typeof value === "number") {
      return value;
    } else {
      const number = +value;
      return isFinite(number) ? number : void 0;
    }
  };

  NumberAttributeAnimator.prototype.equalValues = function (newValue: number | undefined, oldValue: number | undefined): boolean {
    return newValue === oldValue;
  };

  return NumberAttributeAnimator;
})(AttributeAnimator);
