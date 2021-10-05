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
import {AttributeAnimatorClass, AttributeAnimator} from "./AttributeAnimator";

/** @internal */
export const LengthAttributeAnimator = (function (_super: typeof AttributeAnimator) {
  const LengthAttributeAnimator = _super.extend() as AttributeAnimatorClass<AttributeAnimator<any, Length | null, AnyLength | null>>;

  LengthAttributeAnimator.prototype.parse = function (value: string): Length | null {
    return Length.parse(value);
  };

  LengthAttributeAnimator.prototype.fromAny = function (value: AnyLength): Length | null {
    try {
      return Length.fromAny(value);
    } catch (swallow) {
      return null;
    }
  };

  LengthAttributeAnimator.prototype.equalState = function (newState: Length | null, oldState: Length | null): boolean {
    if (newState !== void 0 && newState !== null) {
      return newState.equals(oldState);
    } else {
      return newState === oldState;
    }
  };

  return LengthAttributeAnimator;
})(AttributeAnimator);
